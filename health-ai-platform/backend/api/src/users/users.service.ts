import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(data: {
        email: string;
        password: string;
        fullName: string;
        role: UserRole;
    }) {
        return this.prisma.user.create({
            data,
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }
}