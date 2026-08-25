import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Factory Ltd' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'acme-factory' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  @MinLength(3)
  slug: string;

  @ApiProperty({ example: 'owner@acme.com' })
  @IsEmail()
  ownerEmail: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  ownerFirstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  ownerLastName: string;

  @ApiPropertyOptional({
    enum: ['STARTER', 'GROWTH', 'ENTERPRISE'],
    default: 'STARTER',
  })
  @IsOptional()
  @IsIn(['STARTER', 'GROWTH', 'ENTERPRISE'])
  planTier?: string = 'STARTER';
}
