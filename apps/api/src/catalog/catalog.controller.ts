import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService, ProductItem } from './catalog.service';

@Controller('v1/products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getProducts(
    @Query('q') query?: string,
    @Query('category') category?: string,
  ): ProductItem[] {
    return this.catalogService.findAll(query, category);
  }

  @Get(':id')
  getProduct(@Param('id') id: string): ProductItem {
    return this.catalogService.findById(id);
  }
}
