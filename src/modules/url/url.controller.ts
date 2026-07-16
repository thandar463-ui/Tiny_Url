import { Controller, Post, Body, UseGuards, Get, Patch, Delete, Res, Param, Ip, Headers, UsePipes, ValidationPipe } from '@nestjs/common';
import type { Response } from 'express';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dtos/shortenUrl.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetUrlDto } from './dtos/get-url.dto';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { GetAnalyticsUrlDto } from './dtos/get-analytics.dto';

@Controller('urls')
export class UrlController {
    constructor(
        private readonly urlService: UrlService,
    ) { }

    @Post('shorten')
    @UseGuards(AuthGuard)
    create(
        @CurrentUser('id')
        userId: string,

        @Body()
        dto: ShortenUrlDto,
    ) {
        return this.urlService.create(
            userId,
            dto,
        );
    }

    @Get('redir/:shortCode')
    async redirect(
        @Param('shortCode') shortCode: string,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
        @Res() res: Response,
    ) {
        const result = await this.urlService.redirectUrl(
            shortCode,
            ip,
            userAgent,
        );

        return res.status(200).json({
            success: true,
            originalUrl: result.originalUrl,
            analytics: result.analytics,
            message: 'Found original URL and tracked visit successfully!'
        });
    }

    @Get()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))

    async getUrlList(
        @CurrentUser('id') userId: string,
        @Body() input: GetUrlDto
    ) {
        const result = await this.urlService.getUrlList(userId, input);

        return {
            success: true,
            data: result,
            message: 'Fetched URLs successfully!',
        };
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @CurrentUser('id') userId: string,

        @Param('id') id: string,

        @Body() input: UpdateUrlDto
    ) {
        const updatedUrl = await this.urlService.updateUrl(userId, id, input);

        return {
            success: true,
            data: updatedUrl,
            message: 'Url updated successfully!',
        };
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(
        @CurrentUser('id') userId: string,

        @Param('id') id: string,

    ) {
        const deletedUrl = await this.urlService.deleteUrl(userId, id);

        return {
            success: true,
            data: deletedUrl,
            message: 'Url deleted successfully!',
        };
    }


    @Get(':id/analytics')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))

    async getAnalytics(
        @CurrentUser('id') userId: string,

        @Param('id') id: string,

        @Body() input: GetAnalyticsUrlDto
    ) {
        const analyticUrl = await this.urlService.getAnalyticsUrl(id, userId, input);

        return {
            success: true,
            data: analyticUrl,
            message: 'Url analyticed successfully!',
        };
    }

}