import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [UsersModule, PostsModule],
  controllers: [AdminController],
})
export class AdminModule {}
