import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Kafka,
  Producer,
  RecordMetadata,
  CompressionTypes,
  Message,
} from 'kafkajs';
import { getErrorMessage } from '../../common/utils/error.util';

export interface KafkaMessage {
  topic: string;
  key: string;
  value: unknown;
  headers?: Record<string, string>;
}

interface KafkaConfig {
  clientId: string;
  brokers: string[];
}

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private readonly logger = new Logger(KafkaProducer.name);
  private connected = false;

  constructor(private configService: ConfigService) {
    const kafkaConfig = this.configService.get<KafkaConfig>('kafka');
    this.kafka = new Kafka({
      clientId: kafkaConfig?.clientId || 'rwms-api',
      brokers: kafkaConfig?.brokers || ['localhost:29092'],
      retry: {
        initialRetryTime: 100,
        retries: 5,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error(
        'Failed to connect Kafka producer',
        getErrorMessage(error),
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    try {
      await this.producer.disconnect();
      this.connected = false;
    } catch (error) {
      this.logger.error(
        'Failed to disconnect Kafka producer',
        getErrorMessage(error),
      );
    }
  }

  async publish(
    topic: string,
    key: string,
    value: unknown,
    headers?: Record<string, string>,
  ): Promise<RecordMetadata[]> {
    if (!this.connected) {
      await this.connect();
    }
    return this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          headers,
        },
      ],
    });
  }

  async publishBatch(messages: KafkaMessage[]): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
    const topicMessages = messages.reduce(
      (acc, msg) => {
        const existing = acc.find((tm) => tm.topic === msg.topic);
        const kafkaMsg = {
          key: msg.key,
          value:
            typeof msg.value === 'string'
              ? msg.value
              : JSON.stringify(msg.value),
          headers: msg.headers,
        };
        if (existing) {
          existing.messages.push(kafkaMsg);
        } else {
          acc.push({ topic: msg.topic, messages: [kafkaMsg] });
        }
        return acc;
      },
      [] as Array<{ topic: string; messages: Message[] }>,
    );

    await this.producer.sendBatch({ topicMessages });
  }
}
