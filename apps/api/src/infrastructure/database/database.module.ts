import { Global, Module } from '@nestjs/common';
import { DatabaseService } from "./database.service";


@Global() // 👈 avoid re-import everywhere
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}