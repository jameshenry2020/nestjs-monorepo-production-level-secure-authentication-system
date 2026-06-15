import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'The new role name (e.g. owner, member)' })
  @IsNotEmpty()
  @IsString()
  roleName: string;
}
