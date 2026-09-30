import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PgBoss } from 'pg-boss';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private boss: any;
  private readonly logger = new Logger(JobsService.name);

  constructor(private configService: ConfigService) {
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    if (dbUrl) {
      this.boss = new PgBoss(dbUrl);
    }
  }

  async onModuleInit() {
    if (this.boss) {
      try {
        await this.boss.start();
        this.logger.log('pg-boss started successfully');
      } catch (error) {
        this.logger.error('Failed to start pg-boss', error);
      }
    }
  }

  async onModuleDestroy() {
    if (this.boss) {
      await this.boss.stop();
      this.logger.log('pg-boss stopped');
    }
  }

  async sendEmailJob(to: string, templateId: string, data: any) {
    if (!this.boss) return;
    await this.boss.send('email:send', { to, templateId, data }, { retryLimit: 3 });
  }

  // Abstraction for creating workers
  async createWorker(queueName: string, handler: (job: any) => Promise<void>) {
    if (!this.boss) return;
    await this.boss.work(queueName, handler);
  }
}
