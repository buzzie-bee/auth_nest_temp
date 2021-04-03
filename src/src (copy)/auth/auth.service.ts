import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Services
import { UsersService } from '../users/users.service';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';

// Mongo
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Auth, AuthDocument } from './schemas/auth.schema';
import {
  EmailVerification,
  EmailVerificationDocument,
} from './schemas/email_verify.schema';
import { User } from '../users/schemas/user.schema';
import {
  ForgotPassword,
  ForgotPasswordDocument,
} from './schemas/forgot_password.schema';

// DTOs
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JWT } from './interfaces/jwt.interface';
import { AuthData } from './interfaces/authData.interface';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { LogInDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private jwtService: JwtService,
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @InjectModel(EmailVerification.name)
    private emailVerificationModel: Model<EmailVerificationDocument>,
    @InjectModel(ForgotPassword.name)
    private forgotPasswordModel: Model<ForgotPasswordDocument>,
  ) {}

  // Checks user with these credentials exists in db
  async validateUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<null | AuthData> {
    const authDoc = await this.authModel.findOne({ email }).exec();
    const passwordMatch = await bcrypt.compare(password, authDoc.password);

    if (authDoc && passwordMatch) {
      // Intentionally removing the password field from the auth Doc
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...authData } = authDoc;
      this.catchNotEmailVerified(authDoc.isEmailVerified);
      return authData;
    }
    return null;
  }

  private catchNotEmailVerified(emailVerified: boolean): void {
    if (!emailVerified) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'EMAIL_NOT_VERIFIED',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return;
  }

  // If validateUser guard passes, then return jwt token
  async login({ email, password }: LogInDto): Promise<JWT> {
    const authData = await this.validateUser({
      email: email,
      password,
    });

    if (!authData) {
      throw new UnauthorizedException();
    }

    const jwt = await this.generateJWT({ email, authId: authData._id });
    return jwt;
  }

  private async generateJWT({
    email,
    authId,
  }: {
    email: string;
    authId: any;
  }): Promise<JWT> {
    const payload = { email, sub: authId };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    signUpDto.password = await this.encryptPassword(signUpDto.password);

    const newAuth = new this.authModel(signUpDto);
    const authDoc = await newAuth.save();

    if (!authDoc._id) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unknown Error creating Auth Document',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const userDoc = await this.usersService.signUp({
      authId: authDoc._id,
      ...signUpDto,
    });

    const { email } = signUpDto;
    const name = await this.usersService.getUserFullNameFromAuthId(authDoc._id);

    const token = this.generateRandomToken();
    await this.createEmailVerificationDoc({
      email,
      token,
    });

    const result = await this.sendEmailVerificationCode({ email, token, name });

    if (result === 'error') {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error sending Email Verification email for ${email}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return userDoc;
  }

  private async encryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedAndSaltedPassword = await bcrypt.hash(password, salt);
    return hashedAndSaltedPassword;
  }

  private generateRandomToken(): string {
    const randomToken = Math.floor(Math.random() * 1000000);
    return `${randomToken}`.padStart(6, '0');
  }

  private async createEmailVerificationDoc({
    email,
    token,
  }: {
    email: string;
    token: string;
  }): Promise<void> {
    const newEmailVerification = new this.emailVerificationModel({
      token,
      email,
    });
    const emailVerificationDoc = await newEmailVerification.save();

    if (!emailVerificationDoc._id) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unknown Error creating Email Verification Document',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return;
  }

  private async sendEmailVerificationCode({
    email,
    token,
    name,
  }: {
    email: string;
    token: string;
    name: string;
  }): Promise<'success' | 'error'> {
    const emailData = {
      token,
      email,
      name,
    };

    const result = await this.emailService.sendEmail({
      emailType: 'emailverify-token-created',
      input: emailData,
    });

    return result;
  }

  async resendEmailVerificationCode(
    email: string,
  ): Promise<'success' | 'error'> {
    const authDoc = await this.authModel.findOne({ email }).exec();

    if (!authDoc) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'NO_AUTH_DOC_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (authDoc.isEmailVerified) {
      throw new HttpException(
        {
          status: HttpStatus.FOUND,
          message: 'ALREADY_VERIFIED',
        },
        HttpStatus.FOUND,
      );
    }

    // create or update token
    const verificationDoc = await this.emailVerificationModel
      .findOne({ email })
      .exec();

    const token = this.generateRandomToken();
    if (verificationDoc) {
      await this.emailVerificationModel.updateOne({ email }, { token }).exec();
    } else {
      await this.createEmailVerificationDoc({ email, token });
    }

    // get user name
    const name = await this.usersService.getUserFullNameFromAuthId(authDoc._id);

    const result = await this.sendEmailVerificationCode({
      token,
      email,
      name,
    });

    return result;
  }

  async verifyEmail({ email, code }: VerifyEmailDto): Promise<JWT> {
    const authDoc = await this.authModel.findOne({ email }).exec();

    if (authDoc && authDoc?.isEmailVerified) {
      throw new HttpException(
        {
          status: HttpStatus.FOUND,
          message: 'EMAIL_ALREADY_VERIFIED',
        },
        HttpStatus.FOUND,
      );
    }

    const emailVerificationDoc = await this.emailVerificationModel
      .findOne({ email })
      .exec();

    if (emailVerificationDoc === null || emailVerificationDoc?.token !== code) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'EMAIL_VERIFICATION_ERROR',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.authModel
      .findOneAndUpdate(
        { email },
        { isEmailVerified: true, lastLogin: new Date() },
      )
      .exec();

    await this.emailVerificationModel.findOneAndDelete({ email }).exec();

    return this.generateJWT({ email, authId: authDoc._id });
  }

  private async sendForgotPasswordCode(emailData: {
    email: string;
    token: string;
    name: string;
  }): Promise<'success' | 'error'> {
    const result = await this.emailService.sendEmail({
      emailType: 'reset-token-created',
      input: emailData,
    });

    return result;
  }

  async forgotPassword(email: string): Promise<string> {
    const authDoc = await this.authModel.findOne({ email }).exec();

    if (!authDoc) {
      // TODO: Should we inform the user that an account with that email doesn't exist?
      return;
    }

    const token = this.generateRandomToken();

    const existingDoc = await this.forgotPasswordModel
      .findOne({ email })
      .exec();

    if (existingDoc) {
      await this.forgotPasswordModel
        .findOneAndUpdate({ email }, { token })
        .exec();
    } else {
      const newForgotPassword = new this.forgotPasswordModel({ email, token });
      await newForgotPassword.save();
    }

    const name = await this.usersService.getUserFullNameFromAuthId(authDoc._id);

    this.sendForgotPasswordCode({ email, token, name });

    return 'FORGOT_PASSWORD_SUCCESS';
  }

  private async sendForgotPasswordResetSuccessEmail(emailData: {
    email: string;
    name: string;
  }): Promise<'success' | 'error'> {
    const result = await this.emailService.sendEmail({
      emailType: 'password-reset-successful',
      input: emailData,
    });

    return result;
  }

  async forgotPasswordReset({
    email,
    password,
    code,
  }: ForgotPasswordResetDto): Promise<string> {
    const forgotPasswordDoc = await this.forgotPasswordModel.findOne({ email });

    if (!forgotPasswordDoc) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'PASSWORD_RESET_DOC_NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (forgotPasswordDoc.token !== code) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: 'ERROR_TOKEN_DOES_NOT_MATCH',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const encryptedPassword = await this.encryptPassword(password);

    const authDoc = await this.authModel
      .findOneAndUpdate({ email }, { password: encryptedPassword })
      .exec();

    const name = await this.usersService.getUserFullNameFromAuthId(authDoc._id);

    this.sendForgotPasswordResetSuccessEmail({ name, email });

    await this.forgotPasswordModel.findOneAndDelete({ email });

    return 'FORGOT_PASSWORD_RESET_SUCCESS';
  }
}
