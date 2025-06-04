import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dto/auth.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Autentica um usuário usando email e Senha',
    description: 'Este endpoint realiza a autenticação do usuário. ',
  })
  @ApiBody({
    description: 'realizar login para gerar token de acesso',
    type: AuthDto,
    examples: {
      exemplo: {
        summary: 'Exemplo de login',
        value: {
          email: 'user@email.com',
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Login inválido',
    example: {
      message: 'Usuário ou senha inválidos',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso',
    example: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNsZWl0b25AZW1haWwuY29tIiwic3ViIjoiMDFhZmE4MTUtODgxNy00OGNkLWFjYzAtOGFmYjE1MTU1NmViIiwiaWF0IjoxNzQ5MDQyMTc1LCJleHAiOjE3NDkwNDI3NzV9.E90eZjxs8zXJ04mT8unmz1-CI5oZu5q1cTgT14i_DFU',
    },
  })
  async login(@Body() auth: AuthDto): Promise<{ access_token: string }> {
    return await this.authService.login(auth);
  }
}
