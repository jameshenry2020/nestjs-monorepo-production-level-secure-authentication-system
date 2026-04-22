import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocalModules } from './modules/local.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [LocalModules, InfrastructureModule, ConfigifyModule.forRootAsync()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
