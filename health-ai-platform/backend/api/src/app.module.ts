import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PlatformStateModule } from './platform-state/platform-state.module';
import { MeetingsModule } from './meetings/meetings.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { DemoSeedModule } from './demo-seed/demo-seed.module';

@Module({
  imports: [
    PrismaModule,
    PlatformStateModule,
    DemoSeedModule,
    UsersModule,
    AuthModule,
    PostsModule,
    MeetingsModule,
    AdminModule,
  ],
})
export class AppModule {}
