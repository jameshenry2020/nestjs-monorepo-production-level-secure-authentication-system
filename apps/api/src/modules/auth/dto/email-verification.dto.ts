import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator"

export class EmailVerificationDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email address of the user to verify' })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({ example: '123456', description: 'The OTP sent to the user email' })
    @IsNotEmpty()
    otp: string
}