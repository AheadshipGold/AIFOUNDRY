import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { IncidentsService, IncidentRecord } from './incidents.service';
import { IncidentCategory } from '@prisma/client';

@Controller('v1/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async findAll(): Promise<IncidentRecord[]> {
    return this.incidentsService.findAll();
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string): Promise<IncidentRecord[]> {
    return this.incidentsService.findByOrder(orderId);
  }

  @Get('shop/:shopId')
  async findByShop(@Param('shopId') shopId: string): Promise<IncidentRecord[]> {
    return this.incidentsService.findByShop(shopId);
  }

  @Post()
  async create(
    @Body()
    dto: {
      orderId: string;
      reporterName: string;
      reporterPhone?: string;
      category?: IncidentCategory;
      title: string;
      description: string;
      evidenceUrls?: string[];
    }
  ): Promise<IncidentRecord> {
    return this.incidentsService.create(dto);
  }

  @Post(':id/evidence')
  async addEvidence(
    @Param('id') id: string,
    @Body('evidenceUrls') evidenceUrls: string[]
  ): Promise<IncidentRecord> {
    return this.incidentsService.addEvidence(id, evidenceUrls || []);
  }

  @Put(':id/propose')
  async proposeResolution(
    @Param('id') id: string,
    @Body('proposedOutcome') proposedOutcome: string
  ): Promise<IncidentRecord> {
    return this.incidentsService.proposeResolution(id, proposedOutcome);
  }

  @Put(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body()
    dto: {
      resolution: string;
      proposedOutcome?: string;
    }
  ): Promise<IncidentRecord> {
    return this.incidentsService.resolve(id, dto.resolution, dto.proposedOutcome);
  }
}
