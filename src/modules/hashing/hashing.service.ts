import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HashingService {
    private readonly hmacSecret =
        process.env.HMAC_SECRET!;

    generateShortCode(
        userId: string,
        originalUrl: string,
    ): string {
        return crypto
            .createHmac('sha256', this.hmacSecret)
            .update(`${userId}:${originalUrl}`)
            .digest('base64url')
            .slice(0, 8);
    }

    hashIp(ip: string): string {
        return crypto
            .createHash('sha256')
            .update(ip)
            .digest('hex');
    }
}