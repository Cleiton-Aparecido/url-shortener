import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from 'src/typeorm/entities/url.entity';
@Module({
  imports: [forwardRef(() => urlModule), TypeOrmModule.forFeature([Url])],
  controllers: [],
  providers: [],
})
export class urlModule {}
