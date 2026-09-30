import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ShopIsolationGuard } from './shop-isolation.guard';

@Module({
  imports: [AuthModule],
  providers: [ShopIsolationGuard],
  exports: [ShopIsolationGuard],
})
export class ShopsModule {}
