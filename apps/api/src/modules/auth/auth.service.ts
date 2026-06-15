import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { InjectQueue } from '@nestjs/bullmq';
import { EMAIL_JOBS, EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';
import { Queue } from 'bullmq';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationDto } from './dto/email-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
        private readonly userService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new UnauthorizedException("incorrect credentials");

        const isMatch = await verify(user.hashedPassword, password);
        if (!isMatch) throw new UnauthorizedException("incorrect credentials");;

        const validatedUser = {
            id: user.id,
            email: user.email,
            is_active: user.isActive
        }
        return validatedUser;
    }

    async registerUser(dto: CreateUserDto) {
        const { email } = dto
        const isUserExist = await this.userService.findUserByEmail(email)
        if (isUserExist) {
            throw new BadRequestException("User with this email already exist! please login")
        }
        const { user, plainOtp } = await this.userService.createUser(dto)
        await this.emailQueue.add(
            EMAIL_JOBS.SEND_VERIFICATION_EMAIL,
            {
                email: user.email,
                otp: plainOtp,
            },
        )
        return user
    }


    async verifyEmail(dto: EmailVerificationDto) {
        const user = await this.userService.findUserByEmail(dto.email)
        if (!user) throw new BadRequestException("user account not found")
        return this.userService.verifyOtp(user.id, dto.otp)
    }

    async resendOtp(email: string) {
        const user = await this.userService.findUserByEmail(email)
        if (!user) throw new BadRequestException("user account not found")
        const otp = await this.userService.resendOtp(user.id)
        await this.emailQueue.add(EMAIL_JOBS.SEND_VERIFICATION_EMAIL,
            {
                email: user.email,
                otp: otp,
            },
        )
        return true
    }

    async login(user: any) {
        const payload = { sub: user.id };
        return {
            userId: user.id,
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateJWT(userId: any) {
        const user = await this.userService.findUserById(userId)
        if (!user) throw new UnauthorizedException("User not found")
        if (!user.isActive) throw new ForbiddenException("you are not permitted to access this service")
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            permissions: user.role.rolePermissions.map((rp: any) => rp.permission.name),
            userPermissions: user.userPermissions.map((up: any) => up.permission.name)
        }
        return currentUser
    }

    async googleLogin(req) {
        if (!req.user) {
            throw new BadRequestException('No user from google');
        }

        const { email, firstName, lastName } = req.user;
        const name = `${firstName} ${lastName}`;

        let user = await this.userService.findUserByEmail(email);

        if (user) {
            if (user.provider !== 'google') {
                throw new BadRequestException('This email is already registered with another provider');
            }
            // User exists and is google user, proceed to login

        } else {
            // User does not exist, create new google user
            user = await this.userService.createOAuthUser({
                email,
                name,
                provider: 'google',
            });
        }

        return this.login(user);
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.userService.findUserByEmail(dto.email);

        // Prevent user enumeration: always return success
        if (!user) {
            return { message: 'If an account with that email exists, a reset link has been sent.' };
        }

        const token = await this.userService.generatePasswordResetToken(user.id);

        await this.emailQueue.add(
            EMAIL_JOBS.SEND_FORGOT_PASSWORD_EMAIL,
            {
                email: user.email,
                token: token,
            },
        );

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const resetTokenRecord = await this.userService.verifyResetToken(dto.token);
        if (!resetTokenRecord) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        await this.userService.updatePassword(resetTokenRecord.userId, dto.new_password, resetTokenRecord.id);
        return { message: 'Password has been successfully reset.' };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isMatch = await verify(user.hashedPassword, dto.current_password);
        if (!isMatch) {
            throw new BadRequestException('Incorrect current password');
        }

        await this.userService.updatePassword(userId, dto.new_password);
        return { message: 'Password has been successfully changed.' };
    }
}
