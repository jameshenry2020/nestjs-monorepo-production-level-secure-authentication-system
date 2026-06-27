import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { BullModule } from '@nestjs/bullmq';
import { RedisConfiguration } from "src/config/app.config";
import { BackgroundJobModule } from "./messaging/queues/queue.module";
import { EmailModule } from "./mails/email.module";
import { EncryptionService } from "./crypto/encryption.service";

@Module({
    imports: [
        DatabaseModule,
        EmailModule,
        BullModule.forRootAsync({
            inject: [RedisConfiguration],
            useFactory: (config: RedisConfiguration) => ({
                connection: {
                    host: config.host || 'localhost',
                    port: config.port || 6379
                },
                defaultJobOptions: {
                    attempts: 3,
                    removeOnComplete: 100,
                    removeOnFail: true
                }
            })
        }),
        BackgroundJobModule
    ],
    exports: [EncryptionService],
    providers: [EncryptionService]
})
export class InfrastructureModule {

}
