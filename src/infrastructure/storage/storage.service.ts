import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: Minio.Client;
  private readonly logger = new Logger(StorageService.name);
  private defaultBucket: string;

  constructor(private configService: ConfigService) {
    const storageConfig = this.configService.get('storage');
    this.defaultBucket = storageConfig?.bucketName || 'rwms-files';

    this.client = new Minio.Client({
      endPoint: storageConfig?.endpoint || 'localhost',
      port: storageConfig?.port || 9000,
      useSSL: storageConfig?.useSSL || false,
      accessKey: storageConfig?.accessKey || 'minioadmin',
      secretKey: storageConfig?.secretKey || 'minioadmin123',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists(this.defaultBucket);
  }

  async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucketName);
      if (!exists) {
        await this.client.makeBucket(bucketName, 'us-east-1');
        this.logger.log(`Bucket '${bucketName}' created`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure bucket '${bucketName}': ${error.message}`,
      );
    }
  }

  async uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    mimetype: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    await this.ensureBucketExists(bucket);
    await this.client.putObject(bucket, key, buffer, buffer.length, {
      'Content-Type': mimetype,
      ...metadata,
    });
    return key;
  }

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    const stream = await this.client.getObject(bucket, key);
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(bucket, key);
  }

  async getPresignedUrl(
    bucket: string,
    key: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(bucket, key, expirySeconds);
  }

  async fileExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.client.statObject(bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  getDefaultBucket(): string {
    return this.defaultBucket;
  }
}
