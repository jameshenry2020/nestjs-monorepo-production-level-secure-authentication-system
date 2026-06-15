import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from 'src/infrastructure/messaging/queues/queue.constant';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
