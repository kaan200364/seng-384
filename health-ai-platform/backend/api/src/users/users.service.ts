import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PlatformUser, PublicUser, UserRole } from '../common/platform.types';

@Injectable()
export class UsersService {
    private nextId = 4;
    private users: PlatformUser[] = [
        {
            id: 1,
            email: 'engineer@metu.edu',
            password: bcrypt.hashSync('demo123', 10),
            fullName: 'Kaan Turkay',
            role: UserRole.ENGINEER,
            institution: 'Middle East Technical University',
            expertise: 'Machine Learning, Product Design',
            city: 'Ankara',
            bio: 'Engineer focused on healthcare AI workflows and partnership discovery.',
            emailVerified: true,
            suspended: false,
            createdAt: '2026-03-01T09:00:00.000Z',
        },
        {
            id: 2,
            email: 'doctor@hacettepe.edu',
            password: bcrypt.hashSync('demo123', 10),
            fullName: 'Dr. Elif Kaya',
            role: UserRole.HEALTHCARE_PROFESSIONAL,
            institution: 'Hacettepe University Hospital',
            expertise: 'Radiology, Clinical Validation',
            city: 'Ankara',
            bio: 'Healthcare professional interested in AI-assisted clinical validation projects.',
            emailVerified: true,
            suspended: false,
            createdAt: '2026-03-02T10:30:00.000Z',
        },
        {
            id: 3,
            email: 'admin@healthai.edu',
            password: bcrypt.hashSync('demo123', 10),
            fullName: 'Aylin Demir',
            role: UserRole.ADMIN,
            institution: 'Health AI Program Office',
            expertise: 'Moderation, Governance',
            city: 'Istanbul',
            bio: 'Platform administrator responsible for moderation and audit review.',
            emailVerified: true,
            suspended: false,
            createdAt: '2026-03-03T11:15:00.000Z',
        },
    ];

    async createUser(data: {
        email: string;
        password: string;
        fullName: string;
        role: UserRole;
        institution?: string;
        expertise?: string;
        city?: string;
        bio?: string;
    }) {
        const existing = this.users.find((user) => user.email.toLowerCase() === data.email.toLowerCase());
        if (existing) {
            throw new BadRequestException('Email is already registered');
        }

        const user: PlatformUser = {
            id: this.nextId++,
            email: data.email.toLowerCase(),
            password: data.password,
            fullName: data.fullName,
            role: data.role,
            institution: data.institution ?? 'Not provided',
            expertise: data.expertise ?? 'Not provided',
            city: data.city ?? 'Not provided',
            bio: data.bio ?? '',
            emailVerified: false,
            suspended: false,
            createdAt: new Date().toISOString(),
        };

        this.users.push(user);
        return this.toPublicUser(user);
    }

    async findByEmail(email: string) {
        return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    }

    async findAll() {
        return this.users.filter((user) => !user.suspended).map((user) => this.toPublicUser(user));
    }

    async findById(id: number) {
        return this.users.find((user) => user.id === id);
    }

    async getPublicUserById(id: number) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toPublicUser(user);
    }

    async verifyEmail(email: string) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.emailVerified = true;
        return {
            message: 'Email verified successfully',
            user: this.toPublicUser(user),
        };
    }

    async updateProfile(
        userId: number,
        data: { fullName?: string; institution?: string; expertise?: string; city?: string; bio?: string },
    ) {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.fullName = data.fullName ?? user.fullName;
        user.institution = data.institution ?? user.institution;
        user.expertise = data.expertise ?? user.expertise;
        user.city = data.city ?? user.city;
        user.bio = data.bio ?? user.bio;

        return this.toPublicUser(user);
    }

    async suspendUser(userId: number) {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.suspended = true;
        return this.toPublicUser(user);
    }

    async deleteUser(userId: number) {
        const userIndex = this.users.findIndex((user) => user.id === userId);
        if (userIndex === -1) {
            throw new NotFoundException('User not found');
        }

        const [removed] = this.users.splice(userIndex, 1);
        return this.toPublicUser(removed);
    }

    private toPublicUser(user: PlatformUser): PublicUser {
        const { password, ...rest } = user;
        return rest;
    }
}
