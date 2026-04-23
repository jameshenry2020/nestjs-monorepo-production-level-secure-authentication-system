import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { DatabaseConfiguration } from 'src/config/app.config';


@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: DatabaseConfiguration,) {
    const adapter = new PrismaPg({
      connectionString: config.database_url as string,
    });
   super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
