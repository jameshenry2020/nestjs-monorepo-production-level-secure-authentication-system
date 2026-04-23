import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EMAIL_QUEUE } from "./queue.constant";
import { EmailConsumerProcessor } from "./processors/email.consumer.service";
import { EmailModule } from "src/infrastructure/mails/email.module";


@Module({
    imports:[
        EmailModule,
        BullModule.registerQueue({
            name: EMAIL_QUEUE,
            })],
    providers:[EmailConsumerProcessor]
})
export class BackgroundJobModule{}