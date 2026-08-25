import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SyncRecordDto {
  @ApiPropertyOptional() @IsOptional() @IsString() workerId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nfcCardId?: string;

  @ApiProperty({ enum: ['CLOCK_IN', 'CLOCK_OUT'] })
  @IsIn(['CLOCK_IN', 'CLOCK_OUT'])
  type: 'CLOCK_IN' | 'CLOCK_OUT';

  @ApiProperty({ example: '2024-05-12T06:00:00Z' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ example: 'local-id-001' })
  @IsString()
  @IsNotEmpty()
  localId: string;
}

export class SyncBatchDto {
  @ApiProperty({ example: 'batch-uuid-001' })
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ type: [SyncRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncRecordDto)
  records: SyncRecordDto[];
}
