import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfiguration } from 'src/config/app.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';

@Module({
  imports: [
    UsersModule,
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
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule { }
