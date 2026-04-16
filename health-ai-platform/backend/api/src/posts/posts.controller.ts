import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Put } from '@nestjs/common';

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
            description: string;
        },
    ) {
        return this.postsService.createPost({
            title: body.title,
            description: body.description,
            authorId: req.user.userId,
        });
    }

    @Get()
    getAllPosts() {
        return this.postsService.getAllPosts();
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
        @Body() body: { title: string; description: string },
    ) {
        return this.postsService.updatePost(id, req.user.userId, body);
    }
}