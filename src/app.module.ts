import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { urlModule } from './url/url.module';
@Module({
  imports: [urlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
