import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import jwtConfig from './jwt.config';
import kafkaConfig from './kafka.config';
import storageConfig from './storage.config';

export const configs = [
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  kafkaConfig,
  storageConfig,
];

export {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  kafkaConfig,
  storageConfig,
};

export default configs;
