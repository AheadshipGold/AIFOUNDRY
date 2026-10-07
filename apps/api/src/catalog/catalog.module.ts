import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { ShopsController } from './shops.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CatalogController, ShopsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
