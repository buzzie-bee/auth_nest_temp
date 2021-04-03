import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EmailTemplate {
  @Prop({ required: true, maxlength: 100 })
  subject: string;

  @Prop({ required: true, maxlength: 100 })
  emailType: string;

  @Prop({ required: true, maxlength: 500 })
  dynamicParameters: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  status: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export type EmailTemplateDocument = EmailTemplate & Document;

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
