import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getErrorMessage } from '../../../../common/utils/error.util';

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST') || 'mailhog',
      port: parseInt(config.get('SMTP_PORT') || '1025', 10),
      secure: false,
      auth: config.get('SMTP_USER')
        ? { user: config.get('SMTP_USER'), pass: config.get('SMTP_PASS') }
        : undefined,
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM') || 'noreply@rwms.local',
        to,
        subject,
        html: body,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${to}: ${getErrorMessage(err)}`,
      );
      throw err;
    }
  }
}
