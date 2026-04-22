import { IsEmail, IsNotEmpty } from "class-validator"

export class EmailVerificationDto{
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    otp: string
}