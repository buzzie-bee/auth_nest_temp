import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from './schemas/emailTemplate.schema';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  private APP_NAME = this.configService.get<string>('APP_NAME');
  private APP_URL = this.configService.get<string>('APP_URL');
  private MAIL_HOST = this.configService.get<string>('MAIL_HOST');
  private MAIL_PORT = this.configService.get<number>('MAIL_PORT');
  private MAIL_USERNAME = this.configService.get<string>('MAIL_USERNAME');
  private MAIL_PASSWORD = this.configService.get<string>('MAIL_PASSWORD');
  private MAIL_FROM_ADDRESS = this.configService.get<string>(
    'MAIL_FROM_ADDRESS',
  );

  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
    private configService: ConfigService,
  ) {
    this.nodemailerTransport = createTransport({
      host: this.MAIL_HOST,
      port: this.MAIL_PORT,
      secure: false,
      auth: {
        user: this.MAIL_USERNAME,
        pass: this.MAIL_PASSWORD,
      },
    });
  }

  // TODO: convert mailer to use @nestjs-modules/mailer and Pug/Handlebars templates
  async sendEmail({
    emailType,
    input,
  }: {
    emailType: string;
    input: any;
  }): Promise<'success' | 'error'> {
    input.app_name = this.APP_NAME;
    input.app_url = this.APP_URL;
    input.copyright_year = new Date().getFullYear();

    emailType = emailType.toLowerCase().replace(/\s/g, '');

    const template = await this.emailTemplateModel
      .findOne({
        emailType,
        status: 1,
      })
      .select([
        'subject',
        'emailType',
        'dynamicParameters',
        'content',
        'status',
      ]);

    if (template === null) {
      return 'error';
    }

    let emailSubject = template.subject;
    emailSubject = emailSubject.replace('{{app_name}}', input.app_name);
    let emailBody = template.content;
    const dynamicParameters = template.dynamicParameters;

    const dynamicParametersArr = dynamicParameters
      .replace(/\s/g, '')
      .split(',');
    dynamicParametersArr.push('app_name');
    dynamicParametersArr.push('app_url');
    dynamicParametersArr.push('copyright_year');
    dynamicParametersArr.push('link');
    dynamicParametersArr.forEach((value) => {
      const replace_string = new RegExp('{{' + value + '}}', 'g');
      emailBody = emailBody.replace(replace_string, input[value]);
    });

    const mailOptions = {
      from: this.MAIL_FROM_ADDRESS,
      to: input.email,
      subject: emailSubject,
      html: emailBody,
    };

    try {
      const info = await this.nodemailerTransport.sendMail(mailOptions);
      console.log('Email sent: ', info);
      return 'success';
    } catch (error) {
      console.log('Email Error => ', error);
      return 'error';
    }
  }
}
