import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Auth {
  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 10,
  })
  password: string;

  @Prop({
    required: true,
    default: false,
  })
  isEmailVerified: boolean;

  @Prop({
    required: true,
    default: 2,
    max: 10,
    min: 1,
  })
  talksType: number;

  @Prop({
    type: Date,
    default: Date.now,
  })
  lastLogin: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

export type AuthDocument = Auth & Document;

export const AuthSchema = SchemaFactory.createForClass(Auth);
