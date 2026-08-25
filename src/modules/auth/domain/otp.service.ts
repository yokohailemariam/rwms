import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { generateOtp } from '../../../common/utils/crypto.util';

const OTP_TTL = 300; // 5 minutes
const OTP_PREFIX = 'otp:';

interface StoredOtp {
  code: string;
}

@Injectable()
export class OtpService {
  constructor(private readonly redis: RedisService) {}

  async generateOtp(identifier: string): Promise<string> {
    const code = generateOtp();
    await this.redis.setex(
      `${OTP_PREFIX}${identifier}`,
      OTP_TTL,
      JSON.stringify({ code }),
    );
    return code;
  }

  async verifyOtp(identifier: string, code: string): Promise<boolean> {
    const stored = await this.redis.get(`${OTP_PREFIX}${identifier}`);
    if (!stored) return false;

    const { code: storedCode } = JSON.parse(stored) as StoredOtp;
    if (storedCode !== code) return false;

    // Single-use: delete after verify
    await this.redis.del(`${OTP_PREFIX}${identifier}`);
    return true;
  }
}
