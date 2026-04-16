import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    async createPost(data: {
        title: string;
        description: string;
        authorId: number;
    }) {
        return this.prisma.post.create({
            data: {
                title: data.title,
                description: data.description,
                authorId: data.authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
        });
    }

    async getAllPosts() {
        return this.prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async deletePost(postId: number, userId: number) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        return this.prisma.post.delete({
            where: { id: postId },
        });
    }


    async updatePost(
        postId: number,
        userId: number,
        data: { title: string; description: string },
    ) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.authorId !== userId) {
            throw new ForbiddenException('You can only edit your own posts');
        }

        return this.prisma.post.update({
            where: { id: postId },
            data: {
                title: data.title,
                description: data.description,
            },
        });
    }
}