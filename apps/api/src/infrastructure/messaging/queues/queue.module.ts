import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { EMAIL_QUEUE } from "./queue.constant";
import { EmailConsumerProcessor } from "./processors/email.consumer.service";


@Module({
    imports:[
        // possible registeration of multiple queues
        BullModule.registerQueue({
            name: EMAIL_QUEUE,
            })],
    providers:[EmailConsumerProcessor]
})
export class BackgroundJobModule{}