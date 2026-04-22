import { Processor, WorkerHost } from "@nestjs/bullmq";
import { EMAIL_JOBS, EMAIL_QUEUE } from "../queue.constant";
import { Job } from 'bullmq';
import { EMailService } from "src/infrastructure/mails/email.service";


@Processor(EMAIL_QUEUE)
export class EmailConsumerProcessor extends WorkerHost{
    constructor(private readonly emailService: EMailService){
        super()
    }
    async process(job:Job<any, any, string>): Promise<any> {
        switch (job.name) {
        case EMAIL_JOBS.SEND_VERIFICATION_EMAIL:
            return this.handleVerificationEmail(job)
        }
    }

    private async handleVerificationEmail(job: Job<{ email: string, otp:string }>) {
            await this.emailService.sendEmail({
                recipients: job.data.email,
                subject: 'Verify your account',
                template: 'email_verification',
                contextItems: {
                    otp: job.data.otp, 
                },
            })
    }
}