import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import GeneratorController from './controllers/GeneratorController';
import GeneratorService from './services/GeneratorService';

@Module({
  imports: [],
  controllers: [AppController, GeneratorController],
  providers: [AppService, GeneratorService],
})
export class AppModule {}
