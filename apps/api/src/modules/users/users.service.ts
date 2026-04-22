import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from "argon2";
import { generateOtp, hashOtp } from 'src/common/utils/user.utils';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService:DatabaseService){}

    async createUser(createUserDto: CreateUserDto){
        const {password }=createUserDto
        const hashedPassword = await hash(password)
        const plainOtp = generateOtp()
        const hashedOtp = await hashOtp(plainOtp)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
        const user = await this.databaseService.user.create({
            data:{
                hashedPassword: hashedPassword,
                ...createUserDto,
                otp:{
                    create:{
                        hashedOtp,
                        expiresAt
                    }
                }
            }
        })
        return { user, plainOtp }
    }

    async generateOtpforUser(){

    }

    async findUserByEmail(email:string){
        return await this.databaseService.user.findUnique({
            where:{
                email
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
        if (!otpRecord) throw new Error('Invalid or expired OTP')
        const hashedInput = await hashOtp(inputOtp)
        if (hashedInput !== otpRecord.hashedOtp) {
            throw new Error('Invalid OTP')
        }
    }
}
