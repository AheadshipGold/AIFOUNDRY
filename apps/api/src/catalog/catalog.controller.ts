import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CatalogService, ProductItem } from './catalog.service';

@Controller('v1/products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getProducts(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('shopId') shopId?: string,
  ): Promise<ProductItem[]> {
    return this.catalogService.findAll(query, category, shopId);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ProductItem> {
    return this.catalogService.findById(id);
  }

  @Post()
  async createProduct(
    @Body()
    body: {
      shopId: string;
      title: string;
      description?: string;
      category?: string;
      priceMinor: number;
      stockOnHand?: number;
      originCity?: string;
      images?: string[];
    },
  ): Promise<ProductItem> {
    return this.catalogService.createProduct(body);
  }
}

