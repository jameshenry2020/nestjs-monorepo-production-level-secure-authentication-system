import { Address } from "nodemailer/lib/mailer"


export type SendEmailDto={
    recipients: string,
    subject: string
    template: string
    text?:string
    contextItems?: Record<string, string>
}