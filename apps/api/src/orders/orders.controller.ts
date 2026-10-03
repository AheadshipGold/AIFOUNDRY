import { Body, Controller, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { OrdersService, OrderRecord } from './orders.service';

@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getAll(
    @Query('shopId') shopId?: string,
    @Headers('x-shop-id') headerShopId?: string,
    @Headers('x-user-id') explicitUserId?: string,
  ): Promise<OrderRecord[]> {
    const targetShopId = headerShopId || shopId;
    return this.ordersService.findAll(targetShopId, explicitUserId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<OrderRecord> {
    return this.ordersService.findById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      buyerName: string;
      buyerPhone: string;
      deliveryAddress: string;
      paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
      items: Array<{ variantId: string; quantity: number }>;
    },
  ): Promise<OrderRecord> {
    return this.ordersService.createOrder(body);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      paymentStatus?: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
      fulfillmentStatus?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    },
  ): Promise<OrderRecord> {
    return this.ordersService.updateStatus(id, body);
  }
}
