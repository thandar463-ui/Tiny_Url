import { IsOptional, IsDateString } from 'class-validator';

export class GetAnalyticsUrlDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}