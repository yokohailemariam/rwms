import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
  groupId: process.env.KAFKA_GROUP_ID || 'rwms-group',
  clientId: process.env.KAFKA_CLIENT_ID || 'rwms-api',
}));
