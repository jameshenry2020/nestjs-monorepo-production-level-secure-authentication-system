import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from "argon2";
import { generateOtp, hashOtp } from 'src/common/utils/user.utils';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService:DatabaseService){}

    async createUser(createUserDto: CreateUserDto){
        const { password, confirm_password, ...userData } = createUserDto;
        if (password !== confirm_password) {
            throw new BadRequestException('Password and confirm password do not match');
        }
        const hashedPassword = await hash(password);
        const plainOtp = generateOtp();
        const hashedOtp = await hashOtp(plainOtp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const user = await this.databaseService.user.create({
            data: {
                ...userData,
                hashedPassword: hashedPassword,
                otp: {
                    create: {
                        hashedOtp,
                        expiresAt,
                    },
                },
            },
        });
        return { user, plainOtp };
    }


    async findUserByEmail(email:string){
        return await this.databaseService.user.findUnique({
            where:{
                email
            }
        })
    }

    async findUserById(userId:string){
        return await this.databaseService.user.findUnique({
            where:{
                id: userId
            }
        })
    }
    //to be used in the authService the resend in auth service gets the email, retrieve user and pass the userid get the otp and dispatch to to worker.
    async resendOtp(userId:string){
        let plainOtp:string = '';
        await this.databaseService.$transaction(async (tx) => {
            const otp = generateOtp()
            plainOtp = otp

            const hashedOtp = await hashOtp(otp)

            await tx.otpCode.updateMany({
            where: {
                userId,
                isUsed: false,
            },
            data: {
                isUsed: true,
            },
            })

            await tx.otpCode.create({
            data: {
                userId,
                hashedOtp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
            })     
        })
        return plainOtp
    }


    async verifyOtp(userId: string, inputOtp: string) {
        const otpRecord = await this.databaseService.otpCode.findFirst({
            where: {
            userId,
            isUsed: false,
            expiresAt: {
                gt: new Date(),
            },
            },
            orderBy: {
            createdAt: 'desc',
            },
        })
        if (!otpRecord) throw new BadRequestException('Invalid or expired OTP')
        const isHashMatch = await verify(otpRecord.hashedOtp, inputOtp)
        if (!isHashMatch) {
            throw new BadRequestException('Invalid OTP')
        }

        await this.databaseService.$transaction([
            this.databaseService.otpCode.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
            }),
            this.databaseService.user.update({
            where: { id: userId },
            data: { isEmailVerified: true, isActive: true },
            }),
        ])

        return true
    }
}
