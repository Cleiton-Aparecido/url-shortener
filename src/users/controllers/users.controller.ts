import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'cadastrar usuários',
  })
  @ApiBody({
    description: 'Cadastrar novo usuário, e email não deve ser duplicado',
    type: CreateUserDto,
    examples: {
      exemplo: {
        summary: 'exemplo de dados para cadastro de usuário',
        value: {
          email: 'user@email.com',
          name: 'user',
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    example: { statusCode: 201, message: 'Usuário criado com sucesso' },
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário criado com sucesso',
    example: {
      message: 'E-mail já cadastrado',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }
}
