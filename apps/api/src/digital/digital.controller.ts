import { Controller, Get, Param, Post } from '@nestjs/common';
import { DigitalService, DigitalAssetItem, DigitalGrantItem } from './digital.service';

@Controller('v1/digital')
export class DigitalController {
  constructor(private readonly digitalService: DigitalService) {}

  @Get('catalog')
  async listCatalog(): Promise<DigitalAssetItem[]> {
    return this.digitalService.listCatalogDigitalAssets();
  }

  @Get('entitlements')
  async getEntitlements(): Promise<DigitalGrantItem[]> {
    return this.digitalService.getBuyerGrants();
  }

  @Post('download/:id')
  async download(@Param('id') id: string) {
    return this.digitalService.verifyAndDownload(id);
  }
}
