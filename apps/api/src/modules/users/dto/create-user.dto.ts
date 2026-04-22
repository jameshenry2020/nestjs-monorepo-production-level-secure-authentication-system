import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class UserEmailDto{

    @IsEmail()
    @IsNotEmpty()
    email: string
}

export class CreateUserDto extends UserEmailDto{  
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsStrongPassword()
    password: string

    @IsNotEmpty()
    @IsStrongPassword()
    confirm_password: string 
}