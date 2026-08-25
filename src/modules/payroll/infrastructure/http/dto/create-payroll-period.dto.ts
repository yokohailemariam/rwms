import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollPeriodDto {
  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ example: 'May 2024 Payroll' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-05-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-05-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: '2024-06-05' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  currency?: string;
}
