import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from 'src/config/entities/url.entity';
import { UrlsService } from './services/url.service';
import { UrlsController } from './controllers/url.controller';
import { UrlRepository } from './repository/url.repository';
@Module({
  imports: [forwardRef(() => urlModule), TypeOrmModule.forFeature([Url])],
  controllers: [UrlsController],
  providers: [UrlsService, UrlRepository],
})
export class urlModule {}
