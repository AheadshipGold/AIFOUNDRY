import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequestsService, PurchaseRequestItem, SellerProposalItem } from './requests.service';

@Controller('v1/requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  async getAll(): Promise<PurchaseRequestItem[]> {
    return this.requestsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<PurchaseRequestItem> {
    return this.requestsService.findById(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      buyerName: string;
      buyerPhone?: string;
      rawPrompt: string;
      category?: string;
      budgetMinor?: number;
    },
  ): Promise<PurchaseRequestItem> {
    return this.requestsService.create(body);
  }

  @Post(':id/proposals')
  async addProposal(
    @Param('id') id: string,
    @Body()
    body: {
      shopId?: string;
      shopName: string;
      artisanCity?: string;
      priceMinor: number;
      advancePaymentRequiredMinor?: number;
      productionDays: number;
      notes: string;
    },
  ): Promise<SellerProposalItem> {
    return this.requestsService.addProposal(id, body);
  }

  @Post(':id/accept-proposal')
  async acceptProposal(
    @Param('id') id: string,
    @Body()
    body: {
      proposalId: string;
    },
  ) {
    return this.requestsService.acceptProposal(id, body.proposalId);
  }
}
