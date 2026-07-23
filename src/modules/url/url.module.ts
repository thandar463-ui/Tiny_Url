import { Module } from '@nestjs/common';

import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';

import { PrismaModule } from '../../prisma/prisma.module';
import { HashingModule } from '../hashing/hashing.module';
import { RedisService } from './redis.service';
import { URL_REPOSITORY } from './repository.interface';
import { CachedURLRepositoryDecorator } from './cache-url-repository.decorator';


@Module({

    imports: [PrismaModule, HashingModule,],

    controllers: [UrlController,],

    providers: [
        UrlService,
        UrlRepository,
        RedisService,
        { provide: URL_REPOSITORY, useClass: CachedURLRepositoryDecorator },
    ],


    exports: [UrlService, UrlRepository,],

})
export class UrlModule { }