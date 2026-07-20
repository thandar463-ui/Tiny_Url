import { Module } from '@nestjs/common';

import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';

import { PrismaModule } from '../../prisma/prisma.module';
import { HashingModule } from '../hashing/hashing.module';


@Module({

    imports: [PrismaModule, HashingModule,],

    controllers: [UrlController,],

    providers: [UrlService, UrlRepository,],


    exports: [UrlService, UrlRepository,],

})
export class UrlModule { }