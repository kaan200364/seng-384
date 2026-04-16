import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(data: {
        email: string;
        password: string;
        fullName: string;
        role: UserRole;
    }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.usersService.createUser({
            ...data,
            password: hashedPassword,
        });
    }

    async login(data: { email: string; password: string }) {
        const user = await this.usersService.findByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            message: 'Login successful',
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }
}