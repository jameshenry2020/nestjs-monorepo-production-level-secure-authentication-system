import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorCodeDto {
  @ApiProperty({ description: 'The 6-digit TOTP code or recovery code', example: '123456' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class AuthenticateTwoFactorDto {
  @ApiProperty({ description: 'Temporary short-lived JWT token returned after credential login' })
  @IsNotEmpty()
  @IsString()
  twoFactorToken: string;

  @ApiProperty({ description: 'The 6-digit TOTP code or recovery code', example: '123456' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
