import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterKioskDto {
  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ example: 'KIOSK-SN-00001' })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ example: 'Gate A Kiosk' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Factory Floor - Gate A' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '2.1.0' })
  @IsOptional()
  @IsString()
  firmwareVersion?: string;
}
