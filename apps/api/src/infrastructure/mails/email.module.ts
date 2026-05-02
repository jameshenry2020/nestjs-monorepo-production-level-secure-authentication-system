import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from "@nestjs/common";
import * as path from 'path';
import { EmailConfiguration } from "src/config/app.config";
import { EMailService } from "./email.service";


@Module({
  imports: [MailerModule.forRootAsync({
        inject: [EmailConfiguration],
        useFactory: (config: EmailConfiguration)=> ({
            transport: {
            host: config.host,
            port: config.port,
            auth: {
            user: config.user,
            pass: config.password,
            },
        },
        defaults: {
            from: config.fromEmail,
         },
        template: {
            dir: path.resolve(process.cwd(), 'src', 'infrastructure', 'mails', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
            strict: true,
            },
        },
        })
        
       }),],
  providers: [EMailService],
  exports: [EMailService], 
})
export class EmailModule {}