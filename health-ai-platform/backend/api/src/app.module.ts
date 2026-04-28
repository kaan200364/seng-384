import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PlatformStateModule } from './platform-state/platform-state.module';
import { MeetingsModule } from './meetings/meetings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PlatformStateModule, UsersModule, AuthModule, PostsModule, MeetingsModule, AdminModule],
})
export class AppModule { }
