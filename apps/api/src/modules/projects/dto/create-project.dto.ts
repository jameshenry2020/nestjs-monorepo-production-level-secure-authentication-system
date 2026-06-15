import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  name: string;

  @ApiProperty({ description: 'The description of the project', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  description?: string;
}
