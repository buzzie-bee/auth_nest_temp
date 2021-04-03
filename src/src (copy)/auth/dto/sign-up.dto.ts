import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
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
  firstName: string;

  @IsDefined()
  @IsString()
  lastName: string;
}
