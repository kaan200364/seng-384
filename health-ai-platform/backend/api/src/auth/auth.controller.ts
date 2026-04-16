import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../generated/prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(
        @Body()
        body: {
            email: string;
            password: string;
            fullName: string;
            role: UserRole;
        },
    ) {
        return this.authService.register(body);
    }

    @Post('login')
    login(
        @Body()
        body: {
            email: string;
            password: string;
        },
    ) {
        return this.authService.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: any) {
        return req.user;
    }
}