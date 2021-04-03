import {
  Body,
  Controller,
  Post,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { MongoExceptionFilter } from 'src/filters/mongo-error.filter';

// Dtos
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { LogInDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginDto: LogInDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post('/signUp')
  @UseFilters(MongoExceptionFilter)
  async signUp(
    @Body(new ValidationPipe({ transform: true })) signUpDto: SignUpDto,
  ) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/verifyEmail/verify')
  @UseFilters(MongoExceptionFilter)
  async verifyEmail(
    @Body(new ValidationPipe({ transform: true }))
    verifyEmailDto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('/verifyEmail/resend')
  @UseFilters(MongoExceptionFilter)
  async resendVerifyEmail(
    @Body(new ValidationPipe({ transform: true }))
    resendVerificationEmailDto: ResendVerificationEmailDto,
  ) {
    return this.authService.resendEmailVerificationCode(
      resendVerificationEmailDto.email.toLowerCase(),
    );
  }

  @Post('/password/forgot')
  @UseFilters(MongoExceptionFilter)
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true }))
    forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('/password/reset')
  @UseFilters(MongoExceptionFilter)
  async forgotPasswordReset(
    @Body(new ValidationPipe({ transform: true }))
    forgotPasswordResetDto: ForgotPasswordResetDto,
  ) {
    return this.authService.forgotPasswordReset(forgotPasswordResetDto);
  }
}
