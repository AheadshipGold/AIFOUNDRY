import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
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

  @Get('audit/verify-chain')
  async verifyChain() {
    return this.adminService.verifyAuditChainIntegrity();
  }

  @Post('audit/reports/generate')
  async generateReport(@Body('period') period?: string) {
    return this.adminService.generateAuditReport(period || 'Hebdomadaire');
  }

  @Get('audit/reports')
  async getAuditReports() {
    return this.adminService.getAuditReports();
  }

  @Get('users')
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  @Patch('users/create')
  async createAdmin(@Body() body: { email: string; name?: string }) {
    return this.adminService.createAdmin(body.email, body.name);
  }
}
