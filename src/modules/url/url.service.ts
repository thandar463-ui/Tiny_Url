import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { HashingService } from '../hashing/hashing.service';

import { ShortenUrlDto } from './dtos/shortenUrl.dto';

@Injectable()
export class UrlService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly hashingService: HashingService,
    ) { }

    async create(
        userId: string,
        dto: ShortenUrlDto,
    ) {
        const shortCode =
            this.hashingService.generateShortCode(
                userId,
                dto.originalUrl,
            );

        const existingUrl =
            await this.prisma.url.findUnique({
                where: {
                    shortCode_userId: {
                        shortCode,
                        userId,

                    },
                },
            });

        if (existingUrl) {
            throw new ConflictException(
                'Short URL already exists',
            );
        }

        const expiresAt = new Date();
        expiresAt.setDate(
            expiresAt.getDate() + 1 * 60 * 60 * 24 * 7,
        );

        const url =
            await this.prisma.url.create({
                data: {
                    userId,
                    originalUrl: dto.originalUrl,
                    shortCode,
                    expiresAt,
                },
            });

        return {
            id: url.id,
            shortCode: url.shortCode,
            originalUrl: url.originalUrl,
            clickCount: url.clickCount,
            expiresAt: url.expiresAt,
            createdAt: url.createdAt,
        };
    }
}