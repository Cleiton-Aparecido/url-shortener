import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user.entity';
@Module({
  imports: [forwardRef(() => usersModule), TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [],
})
export class usersModule {}
