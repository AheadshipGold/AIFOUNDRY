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

  @Post('cashbook/collect')
  recordCollection(
    @Body()
    body: {
      label: string;
      amountMinor: number;
      channel: 'MTN MoMo' | 'Moov Money' | 'Celtiis Cash' | 'Espèces' | 'Virement';
      reference: string;
      notes?: string;
      source?: 'SELLER_MANUAL' | 'PROVIDER' | 'COD';
    },
  ) {
    return this.sellerService.recordCollection(body);
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
