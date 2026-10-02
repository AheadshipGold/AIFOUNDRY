import { Module } from '@nestjs/common';
import { DigitalController } from './digital.controller';
import { DigitalService } from './digital.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DigitalController],
  providers: [DigitalService],
  exports: [DigitalService],
})
export class DigitalModule {}
