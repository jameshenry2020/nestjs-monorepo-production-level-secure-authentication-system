import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email address of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'P@ssword123!', description: 'The user password' })
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'uuid-1234-5678', description: 'The unique ID of the authenticated user' })
  userId: string;

  @ApiProperty({ example: 'eyJhbGci...', description: 'JWT access token for subsequent authenticated requests' })
  access_token: string;
}
