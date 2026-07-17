import { PartialType } from '@nestjs/swagger';
import { ShortenUrlDto } from './shortenUrl.dto';

export class UpdateUrlDto extends PartialType(ShortenUrlDto) { }