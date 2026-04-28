import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
