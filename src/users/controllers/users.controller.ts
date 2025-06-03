import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
