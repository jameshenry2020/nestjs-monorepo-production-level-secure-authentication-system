import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The secure token sent via email',
    example: 'abcd-1234-token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewStrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;
}
