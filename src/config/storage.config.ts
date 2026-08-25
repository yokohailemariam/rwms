import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10) || 9000,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
  useSSL: process.env.MINIO_USE_SSL === 'true',
  bucketName: process.env.MINIO_BUCKET_NAME || 'rwms-files',
}));
