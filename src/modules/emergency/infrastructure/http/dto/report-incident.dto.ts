import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReportIncidentDto {
  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ example: 'Fire in Warehouse B' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Small fire detected in warehouse B, section 3' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: string;

  @ApiPropertyOptional({
    enum: ['FIRE', 'INJURY', 'EVACUATION', 'MEDICAL', 'SECURITY', 'OTHER'],
    default: 'OTHER',
  })
  @IsOptional()
  @IsIn(['FIRE', 'INJURY', 'EVACUATION', 'MEDICAL', 'SECURITY', 'OTHER'])
  incidentType?: string;

  @ApiPropertyOptional({ example: 'Warehouse B, Section 3' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  affectedWorkers?: number;

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
}

export class ResolveIncidentDto {
  @ApiPropertyOptional({ example: 'Fire extinguished, area secured' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
