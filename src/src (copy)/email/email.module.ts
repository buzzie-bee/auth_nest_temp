import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './email.service';
import {
  EmailTemplate,
  EmailTemplateSchema,
} from './schemas/emailTemplate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmailTemplate.name,
        schema: EmailTemplateSchema,
      },
    ]),
  ],
  providers: [EmailService],
  exports: [
    EmailService,
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
    ]),
  ],
})
export class EmailModule {}
