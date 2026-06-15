import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty({ description: 'The email of the user to invite' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
