import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashingModule } from './modules/hashing/hashing.module';
import { UrlModule } from './modules/url/url.module';
import { RedisModule } from './modules/url/redis.module';


@Module({
  imports: [PrismaModule, AuthModule, HashingModule, UrlModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
