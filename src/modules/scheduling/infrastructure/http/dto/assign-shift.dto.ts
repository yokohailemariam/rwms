import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignShiftDto {
  @ApiProperty({ example: 'worker-uuid-001' })
  @IsString()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({ example: 'shift-uuid-001' })
  @IsString()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({ example: 'factory-uuid-001' })
  @IsString()
  @IsNotEmpty()
  factoryId: string;

  @ApiProperty({ example: '2024-05-13' })
  @IsDateString()
  date: string;
}
