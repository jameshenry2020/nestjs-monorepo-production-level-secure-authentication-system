import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class UserEmailDto {

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class CreateUserDto extends UserEmailDto {
  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'P@ssword123!', description: 'A strong password for the account' })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string

  @ApiProperty({ example: 'P@ssword123!', description: 'Confirmation of the password' })
  @IsNotEmpty()
  @IsStrongPassword()
  confirm_password: string
}