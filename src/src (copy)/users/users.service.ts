import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from './dto/user-create.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async signUp(userCreateDto: UserCreateDto): Promise<User> {
    const newUser = new this.userModel(userCreateDto);
    const newUserDoc = await newUser.save();

    if (!newUserDoc._id) {
      console.error(
        `Unknown Error creating User Document for AuthID: ${userCreateDto.authId}`,
      );
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Unknown Error creating User Document for AuthID: ${userCreateDto.authId}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newUserDoc;
  }

  async getUserByAuthId(authId: any): Promise<User> {
    const userDoc = await this.userModel.findOne({ authId }).exec();

    if (!userDoc) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `NO_USER_DOC_FOUND`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return userDoc;
  }

  async getUserFullNameFromAuthId(authId: any): Promise<string> {
    const userDoc = await this.userModel.findOne({ authId }).exec();

    if (!userDoc) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `NO_USER_DOC_FOUND`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const { firstName, lastName } = userDoc;
    return `${firstName} ${lastName}`;
  }
}
