import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

// MongoDB
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schemas/auth.schema';
import {
  EmailVerification,
  EmailVerificationSchema,
} from './schemas/email_verify.schema';
import {
  ForgotPassword,
  ForgotPasswordSchema,
} from './schemas/forgot_password.schema';

// Passport strategies for auth
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

// Config imports
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '90d' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: Auth.name,
        schema: AuthSchema,
      },
      {
        name: EmailVerification.name,
        schema: EmailVerificationSchema,
      },
      {
        name: ForgotPassword.name,
        schema: ForgotPasswordSchema,
      },
    ]),
  ],
  providers: [AuthService, EmailService, JwtStrategy],
  exports: [
    AuthService,
    JwtModule,
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
