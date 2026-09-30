import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './catalog/catalog.module';
import { RequestsModule } from './requests/requests.module';
import { OrdersModule } from './orders/orders.module';
import { SellerModule } from './seller/seller.module';

@Module({
  imports: [
    CatalogModule,
    RequestsModule,
    OrdersModule,
    SellerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
