import { ObjectId } from 'mongoose';

export type AuthData = {
  _id?: ObjectId;
  email: string;
  isEmailVerified: boolean;
  talksType: number;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
};
