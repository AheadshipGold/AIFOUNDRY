import { Body, Controller, Get, Post } from '@nestjs/common';
import { SellerService } from './seller.service';

@Controller('v1/seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('dashboard')
  getDashboard() {
    return this.sellerService.getDashboardMetrics();
  }

  @Get('cashbook')
  getCashbook() {
    return this.sellerService.getCashbook();
  }

  @Post('cashbook/close')
  closeDay(
    @Body()
    body: {
      physicalCashMinor: number;
      closedBy: string;
      notes?: string;
    },
  ) {
    return this.sellerService.closeDay(body);
  }
}
