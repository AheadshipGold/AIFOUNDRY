import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IncidentsService, IncidentRecord } from './incidents.service';
import { IncidentCategory } from '@prisma/client';

@Controller('v1/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async getAll(): Promise<IncidentRecord[]> {
    return this.incidentsService.findAll();
  }

  @Get('order/:orderId')
  async getByOrder(@Param('orderId') orderId: string): Promise<IncidentRecord[]> {
    return this.incidentsService.findByOrder(orderId);
  }

  @Post()
  async create(
    @Body()
    body: {
      orderId: string;
      reporterName: string;
      reporterPhone?: string;
      category?: IncidentCategory;
      title: string;
      description: string;
      evidenceUrls?: string[];
    }
  ): Promise<IncidentRecord> {
    return this.incidentsService.create(body);
  }

  @Post(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body()
    body: {
      resolution: string;
      proposedOutcome?: string;
    }
  ): Promise<IncidentRecord> {
    return this.incidentsService.resolve(id, body.resolution, body.proposedOutcome);
  }
}
