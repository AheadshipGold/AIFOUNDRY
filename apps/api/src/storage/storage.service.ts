import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StorageProvider {
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  getObject(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  deleteObject(key: string): Promise<void>;
  createPresignedGetUrl(key: string, expiresIn?: number): Promise<string>;
  createPresignedPutUrl(key: string, mimeType: string, expiresIn?: number): Promise<string>;
}

@Injectable()
export class StorageService implements StorageProvider, OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.bucket = this.configService.get<string>('S3_BUCKET') || 'aifoundry-local';
    
    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:8333',
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID') || 'localadmin',
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY') || 'localdevsecret',
      },
      forcePathStyle: this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true',
      requestChecksumCalculation: 'WHEN_REQUIRED',
      maxAttempts: 5,
    });

    this.logger.log(`StorageService initialized against bucket: ${this.bucket}`);
  }

  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    await this.s3.send(command);
    this.logger.debug(`Object put: ${key}`);
  }

  async getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const response = await this.s3.send(command);
    
    // AWS SDK v3 returns a Node.js Readable stream as response.Body in Node env
    const stream = response.Body as NodeJS.ReadableStream;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async exists(key: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      await this.s3.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
    this.logger.debug(`Object deleted: ${key}`);
  }

  async createPresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  async createPresignedPutUrl(key: string, mimeType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return await getSignedUrl(this.s3, command, { expiresIn });
  }
}
