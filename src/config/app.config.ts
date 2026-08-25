import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'RWMS',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
}));
