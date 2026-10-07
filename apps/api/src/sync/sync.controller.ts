import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SyncService, SyncItemDto } from './sync.service';

@Controller('v1/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('reconcile')
  async reconcile(
    @Body('shopId') shopId: string,
    @Body('items') items: SyncItemDto[]
  ) {
    if (!shopId) {
      throw new BadRequestException('Le champ shopId est requis.');
    }
    if (!items || !Array.isArray(items)) {
      throw new BadRequestException('Le tableau items est requis.');
    }

    return this.syncService.reconcileBatch(shopId, items);
  }

  @Get('conflicts')
  async getConflicts(@Query('shopId') shopId: string) {
    if (!shopId) {
      throw new BadRequestException('Le paramètre shopId est requis.');
    }
    return this.syncService.getConflicts(shopId);
  }

  @Post('conflicts/:id/resolve')
  async resolveConflict(
    @Param('id') conflictId: string,
    @Body('strategy') strategy: 'FORCE_STOCK_OVERRIDE' | 'CANCEL_LOCAL_OPERATION',
    @Body('auditReason') auditReason?: string
  ) {
    if (!strategy) {
      throw new BadRequestException('La stratégie de résolution est requise.');
    }

    return this.syncService.resolveConflict(conflictId, strategy, auditReason);
  }
}
