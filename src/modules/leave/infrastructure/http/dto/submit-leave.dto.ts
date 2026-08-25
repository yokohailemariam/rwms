import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitLeaveDto {
  @ApiProperty({ example: 'leave-type-uuid-001' })
  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: '2024-06-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-05' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  daysRequested: number;

  @ApiPropertyOptional({ example: 'Annual vacation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewLeaveDto {
  @ApiPropertyOptional({ example: 'Approved - enjoy your vacation' })
  @IsOptional()
  @IsString()
  notes?: string;
}
