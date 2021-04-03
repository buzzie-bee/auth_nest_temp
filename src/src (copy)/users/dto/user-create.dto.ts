import {
  IsDefined,
  IsEmail,
  IsMongoId,
  IsString,
  MinLength,
} from 'class-validator';
import { ObjectId } from 'mongoose';

export class UserCreateDto {
  @IsDefined()
  @IsMongoId()
  authId: ObjectId;

  @IsDefined()
  @IsString()
  @IsEmail()
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
