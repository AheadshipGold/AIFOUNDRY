import { Injectable } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class AuthService {
  public auth;

  constructor(private prisma: PrismaService) {
    this.auth = betterAuth({
      baseURL: 'http://localhost:3001',
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      // Social providers can be added here
      // session: { ... },
    });
  }
}
