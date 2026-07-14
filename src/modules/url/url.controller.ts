import {
    Body,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UrlService } from './url.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { ShortenUrlDto } from './dtos/shortenUrl.dto';

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
}