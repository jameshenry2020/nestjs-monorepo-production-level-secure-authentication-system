import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
    @ApiProperty({ description: 'Array of permission names' })
    @IsArray()
    @IsString({ each: true })
    permissions: string[];
}
