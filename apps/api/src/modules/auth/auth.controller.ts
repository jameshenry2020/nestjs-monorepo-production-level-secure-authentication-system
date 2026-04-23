import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-dto';
import { LocalAuthGuard } from 'src/common/guards/local.auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.auth.guard';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { LoginResponseDto, SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request / User already exists' })
  @Post("signup")
  async createAccount(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto>{
    const user = await this.authService.registerUser(createUserDto)
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
  }

  @ApiOperation({ summary: 'Verify user email using OTP' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('otp-verification')
  async verifyUserEmail(@Body() requestDto:EmailVerificationDto){
      return await this.authService.verifyEmail(requestDto)
  }

  @ApiOperation({ summary: 'Resend OTP for email verification' })
  @ApiResponse({ status: 200, description: 'OTP successfully resent', schema: { example: true } })
  @ApiResponse({ status: 400, description: 'User account not found' })
  @ApiBody({ type: ResendOtpDto })
  @Post('resend-otp')
  async resendOtpCode(@Body() reqDto: ResendOtpDto) {
    return await this.authService.resendOtp(reqDto.email)
  }

  @ApiOperation({ summary: 'Login to the application' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 201, description: 'Successfully logged in', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req){
    return {
      user: req.user,
      message: "accessing protected endpoint"
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from the application' })
  @ApiResponse({ status: 201, description: 'Successfully logged out' })
  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }
}
