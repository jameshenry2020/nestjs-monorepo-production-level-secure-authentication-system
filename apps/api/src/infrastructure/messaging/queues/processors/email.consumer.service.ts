import { Processor, WorkerHost } from "@nestjs/bullmq";
import { EMAIL_JOBS, EMAIL_QUEUE } from "../queue.constant";
import { Job } from 'bullmq';
import { EMailService } from "src/infrastructure/mails/email.service";


@Processor(EMAIL_QUEUE)
export class EmailConsumerProcessor extends WorkerHost {
    constructor(private readonly emailService: EMailService) {
        super()
    }
    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case EMAIL_JOBS.SEND_VERIFICATION_EMAIL:
                return this.handleVerificationEmail(job)
            case EMAIL_JOBS.SEND_FORGOT_PASSWORD_EMAIL:
                return this.handleForgotPasswordEmail(job)
            case EMAIL_JOBS.SEND_WELCOME_EMAIL:
                return this.handleWelcomeEmail(job)
        }
    }

    private async handleVerificationEmail(job: Job<{ email: string, otp: string }>) {
        await this.emailService.sendEmail({
            recipients: job.data.email,
            subject: 'Verify your account',
            template: 'email_verification',
            contextItems: {
                otp: job.data.otp,
                year: String(new Date().getFullYear()),
                appName: 'Secure Auth System'
            },
        })
    }

    private async handleForgotPasswordEmail(job: Job<{ email: string, token: string }>) {
        await this.emailService.sendEmail({
            recipients: job.data.email,
            subject: 'Reset your password',
            template: 'forgot_password', // assuming this template will be created
            contextItems: {
                resetLink: `http://localhost:3000/reset-password?token=${job.data.token}`,
                year: String(new Date().getFullYear()),
                appName: 'Secure Auth System'
            },
        })
    }

    private async handleWelcomeEmail(job: Job<{ email: string, name: string }>) {
        await this.emailService.sendEmail({
            recipients: job.data.email,
            subject: 'Welcome to our platform',
            template: 'welcome_email', // assuming this template will be created
            contextItems: {
                name: job.data.name,
                year: String(new Date().getFullYear()),
                appName: 'Secure Auth System'
            },
        })
    }
}