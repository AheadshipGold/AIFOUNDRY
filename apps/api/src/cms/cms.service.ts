import { Injectable, UnauthorizedException } from '@nestjs/common';
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
}