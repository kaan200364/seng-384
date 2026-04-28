import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlatformPost, PostStatus, UserRole } from '../common/platform.types';
import { UsersService } from '../users/users.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class PostsService {
    private nextId = 4;
    private posts: PlatformPost[] = [
        {
            id: 1,
            title: 'AI-Assisted Cardiology Diagnosis',
            domain: 'Cardiology',
            requiredExpertise: 'Machine Learning Engineer',
            projectStage: 'Research',
            confidentialityLevel: 'PUBLIC',
            city: 'Ankara',
            description: 'Looking for an engineer to help validate ECG-based diagnostic workflows.',
            status: PostStatus.ACTIVE,
            authorId: 2,
            createdAt: '2026-03-10T09:00:00.000Z',
            updatedAt: '2026-03-10T09:00:00.000Z',
        },
        {
            id: 2,
            title: 'Radiology Support Tool Prototype',
            domain: 'Radiology',
            requiredExpertise: 'Frontend Engineer',
            projectStage: 'Prototype',
            confidentialityLevel: 'CONFIDENTIAL',
            city: 'Istanbul',
            description: 'Prototype support is needed for a decision-support interface used in imaging workflows.',
            status: PostStatus.DRAFT,
            authorId: 1,
            createdAt: '2026-03-11T09:00:00.000Z',
            updatedAt: '2026-03-11T09:00:00.000Z',
        },
        {
            id: 3,
            title: 'Orthopedics Data Labeling Collaboration',
            domain: 'Orthopedics',
            requiredExpertise: 'Data Scientist',
            projectStage: 'Idea',
            confidentialityLevel: 'PUBLIC',
            city: 'Izmir',
            description: 'Seeking a collaborator to shape a labeling workflow for orthopedics outcome analysis.',
            status: PostStatus.ACTIVE,
            authorId: 1,
            createdAt: '2026-03-12T09:00:00.000Z',
            updatedAt: '2026-03-12T09:00:00.000Z',
        },
    ];

    constructor(
        private readonly usersService: UsersService,
        private readonly platformState: PlatformStateService,
    ) { }

    async createPost(data: {
        title: string;
        domain: string;
        requiredExpertise: string;
        projectStage: string;
        confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
        city: string;
        description: string;
        authorId: number;
        status: PostStatus;
    }) {
        const post: PlatformPost = {
            id: this.nextId++,
            title: data.title,
            domain: data.domain,
            requiredExpertise: data.requiredExpertise,
            projectStage: data.projectStage,
            confidentialityLevel: data.confidentialityLevel,
            city: data.city,
            description: data.description,
            authorId: data.authorId,
            status: data.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.posts.unshift(post);

        const author = await this.usersService.findById(data.authorId);
        if (author) {
            this.platformState.addLog(author, 'post_create', 'post', String(post.id), `Created post "${post.title}"`);
        }

        return this.enrichPost(post);
    }

    async getAllPosts(filters?: {
        query?: string;
        domain?: string;
        city?: string;
        status?: string;
        requiredExpertise?: string;
        currentUserId?: number;
        currentUserRole?: string;
    }) {
        const items = this.posts.filter((post) => {
            const isOwner = filters?.currentUserId === post.authorId;
            const isAdmin = filters?.currentUserRole === UserRole.ADMIN;

            if (post.status === PostStatus.DRAFT && !isOwner && !isAdmin) {
                return false;
            }

            if (filters?.status && filters.status !== 'ALL' && post.status !== filters.status) {
                return false;
            }

            if (filters?.domain && filters.domain !== 'ALL' && post.domain !== filters.domain) {
                return false;
            }

            if (filters?.city && filters.city !== 'ALL' && post.city !== filters.city) {
                return false;
            }

            if (
                filters?.requiredExpertise &&
                filters.requiredExpertise !== 'ALL' &&
                post.requiredExpertise !== filters.requiredExpertise
            ) {
                return false;
            }

            if (filters?.query) {
                const query = filters.query.toLowerCase();
                const haystack = `${post.title} ${post.description} ${post.domain} ${post.requiredExpertise}`.toLowerCase();
                if (!haystack.includes(query)) {
                    return false;
                }
            }

            return true;
        });

        return Promise.all(items.map((post) => this.enrichPost(post)));
    }

    async getPostById(postId: number, currentUserId?: number, currentUserRole?: string) {
        const post = this.posts.find((item) => item.id === postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (
            post.status === PostStatus.DRAFT &&
            currentUserId !== post.authorId &&
            currentUserRole !== UserRole.ADMIN
        ) {
            throw new ForbiddenException('You do not have access to this draft post');
        }

        return this.enrichPost(post);
    }

    async deletePost(postId: number, userId: number) {
        const postIndex = this.posts.findIndex((item) => item.id === postId);
        const post = this.posts[postIndex];

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        this.posts.splice(postIndex, 1);
        const user = await this.usersService.findById(userId);
        if (user) {
            this.platformState.addLog(user, 'post_delete', 'post', String(postId), `Deleted post "${post.title}"`);
        }

        return { message: 'Post deleted successfully' };
    }


    async updatePost(
        postId: number,
        userId: number,
        data: {
            title: string;
            domain: string;
            requiredExpertise: string;
            projectStage: string;
            confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
            city: string;
            description: string;
            status?: PostStatus;
        },
    ) {
        const post = this.posts.find((item) => item.id === postId);

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only edit your own posts');
        }

        post.title = data.title;
        post.domain = data.domain;
        post.requiredExpertise = data.requiredExpertise;
        post.projectStage = data.projectStage;
        post.confidentialityLevel = data.confidentialityLevel;
        post.city = data.city;
        post.description = data.description;
        post.status = data.status ?? post.status;
        post.updatedAt = new Date().toISOString();

        const user = await this.usersService.findById(userId);
        if (user) {
            this.platformState.addLog(user, 'post_update', 'post', String(postId), `Updated post "${post.title}"`);
        }

        return this.enrichPost(post);
    }

    async updatePostStatus(postId: number, userId: number, status: PostStatus) {
        const post = this.posts.find((item) => item.id === postId);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only change the status of your own posts');
        }

        post.status = status;
        post.updatedAt = new Date().toISOString();

        const user = await this.usersService.findById(userId);
        if (user) {
            this.platformState.addLog(user, 'post_status_change', 'post', String(postId), `Changed post status to ${status}`);
        }

        return this.enrichPost(post);
    }

    async adminDeletePost(postId: number, adminUserId: number) {
        const postIndex = this.posts.findIndex((item) => item.id === postId);
        const post = this.posts[postIndex];
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        this.posts.splice(postIndex, 1);
        const admin = await this.usersService.findById(adminUserId);
        if (admin) {
            this.platformState.addLog(admin, 'admin_remove_post', 'post', String(postId), `Removed post "${post.title}"`);
        }

        return { message: 'Post removed by admin' };
    }

    private async enrichPost(post: PlatformPost) {
        const author = await this.usersService.getPublicUserById(post.authorId);
        return {
            ...post,
            author,
        };
    }
}
