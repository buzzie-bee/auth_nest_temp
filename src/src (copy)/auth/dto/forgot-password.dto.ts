import { IsDefined, IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
