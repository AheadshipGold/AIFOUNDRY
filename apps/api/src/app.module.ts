import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CatalogModule } from './catalog/catalog.module';
import { RequestsModule } from './requests/requests.module';
import { OrdersModule } from './orders/orders.module';
import { SellerModule } from './seller/seller.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DigitalModule } from './digital/digital.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CmsModule } from './cms/cms.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    PrismaModule,
    CatalogModule,
    RequestsModule,
    OrdersModule,
    SellerModule,
    AdminModule,
    AuthModule,
    DigitalModule,
    IncidentsModule,
    SubscriptionsModule,
    CmsModule,
    ReviewsModule,
    FavoritesModule,
    NotificationsModule,
    AiModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
