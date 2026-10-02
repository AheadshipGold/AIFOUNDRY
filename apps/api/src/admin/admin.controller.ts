import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @Get('shops')
  async getShops(@Query('q') query?: string) {
    return this.adminService.getShops(query);
  }

  @Patch('shops/:id/verification')
  async updateShopVerification(
    @Param('id') id: string,
    @Body() body: { isVerified: boolean; adminEmail?: string; ipAddress?: string }
  ) {
    return this.adminService.updateShopVerification(
      id,
      body.isVerified,
      body.adminEmail,
      body.ipAddress
    );
  }

  @Get('corridors')
  async getCorridors() {
    return this.adminService.getCorridors();
  }

  @Patch('corridors/:id/toggle')
  async toggleCorridor(
    @Param('id') id: string,
    @Body() body: { isEnabled: boolean; adminEmail?: string; ipAddress?: string }
  ) {
    return this.adminService.toggleCorridor(
      id,
      body.isEnabled,
      body.adminEmail,
      body.ipAddress
    );
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
