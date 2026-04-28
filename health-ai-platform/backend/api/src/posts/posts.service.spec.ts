import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { UsersService } from '../users/users.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: PlatformStateService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
