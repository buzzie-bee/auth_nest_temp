import { IsDefined, IsEmail, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyEmailDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsDefined()
  @IsString()
  @Length(6)
  code: string;
}
