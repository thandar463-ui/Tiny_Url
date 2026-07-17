import { Controller, Post, Body, Query, UseGuards, Get, Patch, Delete, Res, Param, Ip, Headers, UsePipes, ValidationPipe } from '@nestjs/common';
import type { Response } from 'express';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dtos/shortenUrl.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetUrlDto } from './dtos/get-url.dto';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { GetAnalyticsUrlDto } from './dtos/get-analytics.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiHeader, ApiExtension } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('URL -Shortener')
@UseGuards(AuthGuard)

@Controller('urls')
export class UrlController {
    constructor(
        private readonly urlService: UrlService,
    ) { }

    @Post('shorten')
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a shorten url' })
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
    @Public()
    @ApiExtension('x-token-bypass', true)
    @ApiOperation({ summary: 'Redirect short code to original URL and track analytics' })
    @ApiParam({ name: 'shortCode', description: 'The unique code of shortened URL' })
    @ApiHeader({
        name: 'user-agent',
        required: false,
    })
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
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get all URLs created by the current user' })

    async getUrlList(
        @CurrentUser('id') userId: string,
        @Query() input: GetUrlDto
    ) {
        const result = await this.urlService.getUrlList(userId, input);

        return {
            success: true,
            data: result,
            message: 'Fetched URLs successfully!',
        };
    }

    @Patch(':id')
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Update a shortened URL by ID' })
    @ApiParam({ name: 'id', description: 'URL Document ID' })

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
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Delete a shortened URL by ID' })
    @ApiParam({ name: 'id', description: 'URL Document ID' })

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
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get analytics data for a specific URL' })
    @ApiParam({ name: 'id', description: 'URL Document ID' })

    async getAnalytics(
        @CurrentUser('id') userId: string,

        @Param('id') id: string,

        @Query() input: GetAnalyticsUrlDto
    ) {
        const analyticUrl = await this.urlService.getAnalyticsUrl(id, userId, input);

        return {
            success: true,
            data: analyticUrl,
            message: 'Url analyticed successfully!',
        };
    }

}