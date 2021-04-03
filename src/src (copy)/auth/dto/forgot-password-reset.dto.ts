import {
  IsDefined,
  IsEmail,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordResetDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  password: string;

  @IsDefined()
  @IsString()
  @Length(6)
  code: string;
}
