import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LogInDto {
  @IsDefined()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  password: string;
}
