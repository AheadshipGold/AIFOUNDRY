import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequestsService, PurchaseRequestItem, SellerProposalItem } from './requests.service';

@Controller('v1/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  getAll(): PurchaseRequestItem[] {
    return this.requestsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): PurchaseRequestItem {
    return this.requestsService.findById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      buyerName: string;
      buyerPhone?: string;
      rawPrompt: string;
      category?: string;
      budgetMinor?: number;
    },
  ): PurchaseRequestItem {
    return this.requestsService.create(body);
  }

  @Post(':id/proposals')
  addProposal(
    @Param('id') id: string,
    @Body()
    body: {
      shopName: string;
      priceMinor: number;
      productionDays: number;
      notes: string;
    },
  ): SellerProposalItem {
    return this.requestsService.addProposal(id, body);
  }
}
