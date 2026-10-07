import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('v1/shops')
export class ShopsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(':slug')
  async getShopBySlug(@Param('slug') slug: string) {
    return this.catalogService.getShopBySlug(slug);
  }
}
