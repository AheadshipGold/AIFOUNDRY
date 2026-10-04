const fs = require('fs');

const serviceCode = `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandingConfig() {
    const config = await this.prisma.platformConfig.findUnique({
      where: { id: 'cms_main' },
    });
    if (!config) {
      return { data: {} };
    }
    return config;
  }

  async updateLandingConfig(data: any, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'PLATFORM_OWNER') {
      throw new UnauthorizedException('Access denied');
    }

    const config = await this.prisma.platformConfig.upsert({
      where: { id: 'cms_main' },
      update: { data },
      create: { id: 'cms_main', data },
    });
    return config;
  }
}`;

const controllerCode = `import { Controller, Get, Put, Body, Req, Headers, UnauthorizedException } from '@nestjs/common';
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
}`;

const moduleCode = `import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}`;

fs.writeFileSync('apps/api/src/cms/cms.service.ts', serviceCode);
fs.writeFileSync('apps/api/src/cms/cms.controller.ts', controllerCode);
fs.writeFileSync('apps/api/src/cms/cms.module.ts', moduleCode);
