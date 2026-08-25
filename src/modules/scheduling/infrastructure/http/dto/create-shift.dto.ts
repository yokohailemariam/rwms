import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShiftDto {
  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ example: 'Morning Shift' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '06:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:mm' })
  startTime: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:mm' })
  endTime: string;

  @ApiProperty({ example: 480 })
  @IsNumber()
  @Type(() => Number)
  durationMinutes: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  overnightShift?: boolean;

  @ApiPropertyOptional({ example: '#3498db' })
  @IsOptional()
  @IsString()
  color?: string;
}
