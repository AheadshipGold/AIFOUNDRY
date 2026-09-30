import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService, OrderRecord } from './orders.service';

@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAll(): OrderRecord[] {
    return this.ordersService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): OrderRecord {
    return this.ordersService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      buyerName: string;
      buyerPhone: string;
      deliveryAddress: string;
      paymentChannel: 'MTN_MOMO' | 'MOOV_MONEY' | 'CELTIIS_CASH' | 'CARD' | 'CASH_ON_DELIVERY';
      items: Array<{ variantId: string; quantity: number }>;
    },
  ): OrderRecord {
    return this.ordersService.createOrder(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      paymentStatus?: 'PENDING' | 'SETTLED_TO_MERCHANT' | 'FAILED';
      fulfillmentStatus?: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';
    },
  ): OrderRecord {
    return this.ordersService.updateStatus(id, body);
  }
}
