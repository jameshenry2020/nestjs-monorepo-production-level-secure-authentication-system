import { Injectable, Logger } from "@nestjs/common";
import { SendEmailDto } from "./mail.interface";
import { MailerService } from "@nestjs-modules/mailer";


@Injectable()
export class EMailService {
    private readonly logger = new Logger(EMailService.name);
    constructor(private readonly mailerService: MailerService){}

    async sendEmail(payload:SendEmailDto){
        const {recipients, subject, template, contextItems} = payload
        
        try {
            await this.mailerService.sendMail({
                to: recipients,
                subject,
                template,
                context:{
                    ...contextItems
                }

             })
        } catch (error) {
            this.logger.error("Error Occur while sending email", error)
        }
        
    }
}