import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendOtpDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email address to resend the OTP to' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
