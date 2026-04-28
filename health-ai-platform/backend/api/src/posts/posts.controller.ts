import {
        Body,
        Controller,
        Delete,
        Get,
        Patch,
        Param,
        ParseIntPipe,
        Post,
        Put,
        Query,
        Req,
        UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostStatus } from '../common/platform.types';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    createPost(
        @Req() req: any,
        @Body()
        body: {
            title: string;
            domain: string;
            requiredExpertise: string;
            projectStage: string;
            confidentialityLevel: 'PUBLIC' | 'CONFIDENTIAL';
            city: string;
            description: string;
            status: PostStatus;
        },
    ) {
        return this.postsService.createPost({
            title: body.title,
            domain: body.domain,
            requiredExpertise: body.requiredExpertise,
            projectStage: body.projectStage,
            confidentialityLevel: body.confidentialityLevel,
            city: body.city,
            description: body.description,
            authorId: req.user.userId,
            status: body.status,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getAllPosts(
        @Req() req: any,
        @Query('query') query?: string,
        @Query('domain') domain?: string,
        @Query('city') city?: string,
        @Query('status') status?: string,
        @Query('requiredExpertise') requiredExpertise?: string,
    ) {
        return this.postsService.getAllPosts({
            query,
            domain,
            city,
            status,
            requiredExpertise,
            currentUserId: req.user?.userId,
            currentUserRole: req.user?.role,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getPostById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.postsService.getPostById(id, req.user.userId, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deletePost(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.postsService.deletePost(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
        @Body()
        body: {
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
        return this.postsService.updatePost(id, req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updatePostStatus(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
        @Body() body: { status: PostStatus },
    ) {
        return this.postsService.updatePostStatus(id, req.user.userId, body.status);
    }
}
