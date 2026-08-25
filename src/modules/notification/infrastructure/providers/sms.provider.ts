import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);

  constructor(private readonly config: ConfigService) {}

  async sendSms(to: string, message: string): Promise<void> {
    // Placeholder — integrate with Twilio/Africa's Talking/etc.
    const provider = this.config.get('SMS_PROVIDER') || 'mock';

    if (provider === 'mock') {
      this.logger.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
      return;
    }

    // Production: integrate real SMS gateway here
    this.logger.warn(`SMS provider "${provider}" not configured`);
  }
}
