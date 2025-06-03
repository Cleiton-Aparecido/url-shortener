import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './service/users.service';
import { UsersRepository } from './repository/users.repository';
import { User } from 'src/config/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UsersRepository])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
