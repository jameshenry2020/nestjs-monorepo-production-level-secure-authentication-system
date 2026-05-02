import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { InjectQueue } from '@nestjs/bullmq';
import { EMAIL_JOBS, EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';
import { Queue } from 'bullmq';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationDto } from './dto/email-verification.dto';

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
            name: user.name,
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
            email: user.email
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
}
