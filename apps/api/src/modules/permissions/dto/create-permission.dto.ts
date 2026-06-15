import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
    @ApiProperty({ description: 'The unique name of the permission (e.g. settings.read)' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The module name this permission belongs to (e.g. settings)' })
    @IsNotEmpty()
    @IsString()
    module: string;

    @ApiProperty({ description: 'Optional description of what this permission allows', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
