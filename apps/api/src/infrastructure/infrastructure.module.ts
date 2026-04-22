import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import path from 'path';
import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from '@nestjs/bullmq';
import { EmailConfiguration, RedisConfiguration } from "src/config/app.config";
import { EMailService } from "./mails/email.service";
import { BackgroundJobModule } from "./messaging/queues/queue.module";



@Module({
    imports:[
        DatabaseModule, 
        MailerModule.forRootAsync({
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
            dir:path.resolve(__dirname, 'mails', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
            strict: true,
            },
        },
        })
        
       }),
        BullModule.forRootAsync({
            inject:[RedisConfiguration],
            useFactory: (config: RedisConfiguration)=>({
                connection:{
                    host:config.host || 'redis',
                    port:config.port || 6379
                },
                defaultJobOptions: {
                    attempts: 3, 
                    removeOnComplete: 100,  
                    removeOnFail: true}
            })
        }),
        BackgroundJobModule
        ],
    exports:[EMailService],
    providers: [EMailService]
})
export class InfrastructureModule {

}