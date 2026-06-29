import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfiguration } from 'src/config/app.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';
import { GoogleStrategy } from './strategies/google.strategy';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [
    UsersModule,
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [JwtConfiguration],
      useFactory: (config: JwtConfiguration) => ({
        secret: config.secret,
        signOptions: {
          expiresIn: config.expire || '1h'
        }
      })
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, TwoFactorAuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService, TwoFactorAuthService]
})
export class AuthModule { }
