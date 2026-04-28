import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PostsModule, UsersModule],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
