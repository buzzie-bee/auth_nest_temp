import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ForgotPassword {
  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  token: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;
}

export type ForgotPasswordDocument = ForgotPassword & Document;

export const ForgotPasswordSchema = SchemaFactory.createForClass(
  ForgotPassword,
);
