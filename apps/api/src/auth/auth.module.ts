import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BetterAuthController } from './better-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BetterAuthController, AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
