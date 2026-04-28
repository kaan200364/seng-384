import { Global, Module } from '@nestjs/common';
import { DemoSeedService } from './demo-seed.service';

@Global()
@Module({
  providers: [DemoSeedService],
})
export class DemoSeedModule {}
