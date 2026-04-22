import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-dto';
import { LocalAuthGuard } from 'src/common/guards/local.auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { EmailVerificationDto } from './dto/email-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async createAccount(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto>{
    const user = await this.authService.registerUser(createUserDto)
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
  }

  @Post('otp-verification')
  async verifyUserEmail(@Body() requestDto:EmailVerificationDto){
      return await this.authService.verifyEmail(requestDto)
  }

  @Post('resend-otp')
  async resendOtpCode(@Body() reqDto: {email: string}){
      return await this.authService.resendOtp(reqDto.email)
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async login(@Request() req){
      return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req){
    return {
      user: req.user,
      message: "accessing protected endpoint"
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }
}
