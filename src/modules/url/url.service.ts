import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from '../hashing/hashing.service';
import { UrlRepository } from './url.repository';
import { URL_REPOSITORY, type URLRepository } from './repository.interface';
import { ShortenUrlDto } from './dtos/shortenUrl.dto';
import { GetUrlDto } from './dtos/get-url.dto';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { GetAnalyticsUrlDto } from './dtos/get-analytics.dto';
import { UrlDto } from "./dtos/url.dto";

@Injectable()
export class UrlService {
    constructor(
        @Inject(URL_REPOSITORY) private readonly urlRepo: URLRepository,
        // private readonly urlRepo: UrlRepository,
        private readonly hashingService: HashingService,
        @Inject('REDIS_CONN')
        private readonly redis: any,
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

        const existingUrl = await this.urlRepo.findShortCodeWithUser(shortCode, userId);

        if (existingUrl) {
            throw new ConflictException(
                'Short URL already exists for this user.',
            );
        }

        const expiresAt = new Date();
        expiresAt.setDate(
            expiresAt.getDate() + 7,
        );

        const url = new UrlDto();

        url.userId = userId;
        url.shortCode = shortCode;
        url.originalUrl = dto.originalUrl;
        url.expiresAt = expiresAt;



        return this.urlRepo.create(url);
    }

    async redirectUrl(shortCode: string, ip: string, userAgent?: string): Promise<any> {

        const url = await this.urlRepo.findActiveByShortCode(shortCode,);


        if (!url) {
            throw new NotFoundException('Requested short URL was not found.');
        }


        if (url.expiresAt && new Date() > url.expiresAt) {
            throw new BadRequestException('This short URL has expired.');
        }


        const ipHash = this.hashingService.hashIp(ip);

        const [updatedUrl, newVisit] = await this.urlRepo.redirectAndTrackVisit(
            url.id,
            ipHash,
            userAgent,
        );


        let targetUrl = url.originalUrl ? url.originalUrl.trim() : '';
        if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`;
        }


        return {
            originalUrl: targetUrl,
            analytics: {
                totalClicks: updatedUrl.clickCount,
                latestVisit: {
                    id: newVisit.id,
                    userAgent: newVisit.userAgent,
                    trackedAt: newVisit.createdAt
                }
            }
        };
    }

    async getUrlList(userId: string, input: GetUrlDto) {

        const page = input.page ?? 1;
        const size = input.size ?? 10;

        const skip = (page - 1) * size;

        const [urls, total] = await Promise.all([
            this.urlRepo.findManyWithPagination(
                userId,
                skip,
                size,
            ),

            this.urlRepo.countActiveUrls(
                userId,
            ),
        ]);





        return {
            urls: urls.map((url) => ({
                ...url,

            })),

            pagination: {
                page: page,
                size: size,
                total,
                totalPages: Math.ceil(total / size),
            },
        };
    }

    async updateUrl(userId: string, id: string, input: UpdateUrlDto) {
        const url = await this.urlRepo.findActiveById(
            id,
            userId,
        );

        if (!url) {
            throw new NotFoundException('URL not found.');
        }

        const updateUrl = await this.urlRepo.updateUrl(
            id,

            {
                originalUrl: input.originalUrl,
            }
        );

        return updateUrl;
    }

    async deleteUrl(userId: string, id: string) {
        const url = await this.urlRepo.findActiveById(

            id,
            userId,
        );

        if (!url) {
            throw new NotFoundException('URL not found.');
        }

        const deleteUrl = await this.urlRepo.deleteUrl(
            id,);

        return deleteUrl;
    }

    async getAnalyticsUrl(id: string, userId: string, input: GetAnalyticsUrlDto) {
        const url = await this.urlRepo.findActiveById(
            id,
            userId,
        );

        if (!url) {
            throw new NotFoundException('URL not found.');
        }

        const where: Prisma.VisitWhereInput = {
            urlId: id,
        };

        if (input.startDate || input.endDate) {
            where.createdAt = {};

            if (input.startDate) {
                where.createdAt.gte = new Date(input.startDate);
            }


            if (input.endDate) {
                where.createdAt.lte = new Date(input.endDate);
            }
        }

        const visits = await this.urlRepo.findVisits(where,);


        const totalClicks = url.clickCount;

        const uniqueVisitors = new Set(visits.map((visit) => visit.ipHash),).size;

        const lastVisitedAt = visits.length > 0 ? visits[visits.length - 1].createdAt : null;

        const dailyClicks: {
            date: string;
            clicks: number;
        }[] = [];

        for (const visit of visits) {
            const date = visit.createdAt.toISOString().split('T')[0];

            const index = dailyClicks.findIndex(
                (item) => item.date === date,
            );

            if (index === -1) {
                dailyClicks.push({
                    date,
                    clicks: 1,
                });
            } else {
                dailyClicks[index].clicks++;
            }
        }

        return {
            url: {
                id: url.id,
                shortCode: url.shortCode,
                originalUrl: url.originalUrl,
                createdAt: url.createdAt,
                expiresAt: url.expiresAt,
            },

            analytics: {
                totalClicks,
                uniqueVisitors,
                lastVisitedAt,
                dailyClicks,
            },
        };
    }

    async testRedis() {
        await this.redis.set('test', 'Hello Redis');

        const value = await this.redis.get('test');

        return {
            message: 'Redis is working!',
            value,
        };
    }
}