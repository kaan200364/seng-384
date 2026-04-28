import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PlatformStateService } from '../platform-state/platform-state.service';
import { UserRole } from '../common/platform.types';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly platformState: PlatformStateService,
    ) { }

    async register(data: {
        email: string;
        password: string;
        fullName: string;
        role: UserRole;
    }) {
        if (!this.isInstitutionalEmail(data.email)) {
            throw new BadRequestException('Only .edu or .edu.tr email addresses are allowed');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.usersService.createUser({
            ...data,
            password: hashedPassword,
        });

        const createdUser = await this.usersService.findById(user.id);
        if (createdUser) {
            this.platformState.addLog(
                createdUser,
                'register',
                'user',
                String(user.id),
                `Registered account for ${user.email}`,
            );
        }

        return {
            message: 'Registration successful. Please verify your email before login.',
            verificationRequired: true,
            email: user.email,
            user,
        };
    }

    async verifyEmail(data: { email: string }) {
        const result = await this.usersService.verifyEmail(data.email);

        this.platformState.addNotification(
            result.user.id,
            'Email verified',
            'Your account is verified. You can now log in.',
        );

        return result;
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

        if (!user.emailVerified) {
            throw new UnauthorizedException('Please verify your email before login');
        }

        if (user.suspended) {
            throw new UnauthorizedException('Your account is suspended');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
        };

        this.platformState.addLog(user, 'login', 'user', String(user.id), `Logged in as ${user.role}`);

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

    private isInstitutionalEmail(email: string) {
        return /\.edu(\.tr)?$/i.test(email);
    }
}
