import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infrastructure/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, verify } from "argon2";
import { generateOtp, hashOtp } from 'src/common/utils/user.utils';
import { ServerConfiguration } from 'src/config/app.config';

@Injectable()
export class UsersService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly serverConfig: ServerConfiguration
    ) { }

    async createUser(createUserDto: CreateUserDto) {
        const { password, confirm_password, ...userData } = createUserDto;
        if (password !== confirm_password) {
            throw new BadRequestException('Password and confirm password do not match');
        }
        const hashedPassword = await hash(password);
        const plainOtp = generateOtp();
        const hashedOtp = await hashOtp(plainOtp);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const userRole = await this.getRoleByName('user');
        const user = await this.databaseService.user.create({
            data: {
                ...userData,
                hashedPassword: hashedPassword,
                roleId: userRole?.id,
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


    async findUserByEmail(email: string) {
        return await this.databaseService.user.findUnique({
            where: {
                email
            }
        })
    }

    async findUserById(userId: string) {
        return await this.databaseService.user.findUnique({
            where: {
                id: userId
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true
                            }
                        },

                    }
                },
                userPermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        })
    }

    async getRoleByName(name: string) {
        return await this.databaseService.role.findUnique({
            where: {
                name_organizationId: {
                    name,
                    organizationId: null,
                },
            },
        });
    }
    //to be used in the authService the resend in auth service gets the email, retrieve user and pass the userid get the otp and dispatch to to worker.
    async resendOtp(userId: string) {
        let plainOtp: string = '';
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

    async createOAuthUser(data: { email: string; name: string; provider: 'google' | 'email'; password?: string }) {
        const hashedPassword = await hash(data.password || this.serverConfig.serverPassword);
        const userRole = await this.getRoleByName('user');
        return await this.databaseService.user.create({
            data: {
                email: data.email,
                name: data.name,
                hashedPassword: hashedPassword,
                provider: data.provider,
                roleId: userRole?.id,
                isEmailVerified: true,
                isActive: true,
            },
        });
    }

    async generatePasswordResetToken(userId: string) {
        const { randomBytes } = await import('crypto');
        const token = randomBytes(32).toString('hex');
        const hashedToken = await hash(token);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

        await this.databaseService.passwordResetToken.create({
            data: {
                userId,
                hashedToken,
                expiresAt,
            },
        });

        return token;
    }

    async verifyResetToken(token: string) {
        const resetTokens = await this.databaseService.passwordResetToken.findMany({
            where: {
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        for (const record of resetTokens) {
            const isMatch = await verify(record.hashedToken, token);
            if (isMatch) {
                return record;
            }
        }
        return null;
    }

    async updatePassword(userId: string, newPassword: string, tokenId?: number) {
        const hashedPassword = await hash(newPassword);

        const operations: any[] = [
            this.databaseService.user.update({
                where: { id: userId },
                data: { hashedPassword },
            }),
        ];

        if (tokenId) {
            operations.push(
                this.databaseService.passwordResetToken.update({
                    where: { id: tokenId },
                    data: { isUsed: true },
                })
            );
        }

        await this.databaseService.$transaction(operations);
    }

    async findAll() {
        return await this.databaseService.user.findMany({
            include: {
                role: true,
            },
        });
    }

    async createAdmin(createUserDto: CreateUserDto) {
        const { password, confirm_password, ...userData } = createUserDto;
        if (password !== confirm_password) {
            throw new BadRequestException('Password and confirm password do not match');
        }
        const hashedPassword = await hash(password);
        const adminRole = await this.getRoleByName('admin');

        return await this.databaseService.user.create({
            data: {
                ...userData,
                hashedPassword: hashedPassword,
                roleId: adminRole?.id,
                isEmailVerified: true,
                isActive: true,
            },
        });
    }

    async deleteUser(userId: string) {
        const user = await this.findUserById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return await this.databaseService.user.delete({
            where: { id: userId },
        });
    }
}
