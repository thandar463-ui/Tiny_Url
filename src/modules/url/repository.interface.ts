import { UrlDto } from './dtos/url.dto';

import { Prisma } from '@prisma/client';

export const URL_REPOSITORY = 'URL_REPOSITORY';

export interface URLRepository {
    create(url: UrlDto): Promise<UrlDto>;

    findShortCodeWithUser(shortCode: string, userId: string): Promise<UrlDto | null>;

    findActiveByShortCode(shortCode: string): Promise<UrlDto | null>;

    findActiveById(id: string, userId: string): Promise<UrlDto | null>;

    redirectAndTrackVisit(urlId: string, ipHash: string, userAgent?: string): Promise<[UrlDto, any]>;

    updateUrl(id: string, partial: Partial<UrlDto>): Promise<UrlDto>;

    deleteUrl(id: string): Promise<UrlDto>;

    countActiveUrls(userId: string): Promise<number>;

    findManyWithPagination(userId: string, skip: number, size: number): Promise<(UrlDto & { _count: { visits: number } })[]>;

    findVisits(where: Prisma.VisitWhereInput): Promise<any[]>;
}
