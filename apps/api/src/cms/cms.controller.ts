import { Controller, Get, Put, Body, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('v1/cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('landing')
  async getLandingConfig() {
    return this.cmsService.getLandingConfig();
  }

  @Put('landing')
  async updateLandingConfig(
    @Body() data: any,
    @Req() req: any,
    @Headers('x-user-id') explicitUserId?: string
  ) {
    const userId = explicitUserId; // In reality, properly extracted
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.cmsService.updateLandingConfig(data, userId);
  }
}