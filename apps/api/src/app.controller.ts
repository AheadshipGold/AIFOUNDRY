import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ShopIsolationGuard } from './shops/shop-isolation.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/test-shop')
  @UseGuards(ShopIsolationGuard)
  testShopIsolation() {
    return { status: 'ok', shopAccess: true };
  }
}
