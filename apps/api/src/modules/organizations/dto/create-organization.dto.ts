import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'The name of the organization' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(256)
  name: string;
}
