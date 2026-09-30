import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { ShopsModule } from './shops/shops.module';
import { StorageModule } from './storage/storage.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    ShopsModule,
    StorageModule,
    JobsModule,
    HealthModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
