import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Auth } from 'src/auth/schemas/auth.schema';

@Schema()
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Auth' })
  authId: Auth;

  @Prop({
    required: true,
  })
  firstName: string;

  @Prop({
    required: true,
  })
  lastName: string;

  @Prop()
  type: string;

  // @Prop()
  // company

  // @Prop()
  // courses

  // @Prop()
  // progress

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

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
