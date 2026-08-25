import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ClockInDto {
  @ApiProperty({ example: 'worker-uuid-001' })
  @IsString()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ enum: ['MANUAL', 'KIOSK', 'MOBILE', 'NFC'] })
  @IsIn(['MANUAL', 'KIOSK', 'MOBILE', 'NFC'])
  source: string;

  @ApiPropertyOptional({ example: '2024-05-12T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftId?: string;

  @ApiPropertyOptional({ example: 9.0249 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 38.7468 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kioskDeviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nfcCardId?: string;
}

export class ClockOutDto {
  @ApiProperty({ example: 'worker-uuid-001' })
  @IsString()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ enum: ['MANUAL', 'KIOSK', 'MOBILE', 'NFC'] })
  @IsIn(['MANUAL', 'KIOSK', 'MOBILE', 'NFC'])
  source: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kioskDeviceId?: string;
}
