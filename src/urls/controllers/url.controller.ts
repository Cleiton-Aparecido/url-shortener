import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UrlDto } from '../dto/url.dto';
import { AuthGuard } from '@nestjs/passport';
import { UrlsService } from '../services/url.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/config/entities/user.entity';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Url } from 'src/config/entities/url.entity';

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly service: UrlsService) {}

  @ApiOperation({
    summary: 'Endpoint para encurtar url',
    description:
      'Api ira encurtar e retornar o link encurtado, token de autenticação é opcional',
  })
  @ApiBody({
    description: 'Exemplo de url para encurtar',
    type: UrlDto,
    examples: {
      exemplo: {
        summary: 'Exemplo de url para encurtar',
        value: {
          originalUrl: 'https://www.youtube.com/',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Encurtado com sucesso',
    example: {
      shortUrl: 'http://localhost:3023/is2uvK',
    },
  })
  @Post('shorten')
  @UseGuards(OptionalAuthGuard)
  async shorten(@Body() dto: UrlDto, @CurrentUser() user: User | null) {
    return await this.service.shorten(dto, user?.id);
  }

  @ApiOperation({
    summary: 'Listar urls encurtadas pelo usuário',
    description: 'token de autenticação é obrigatorio',
  })
  @ApiResponse({
    status: 201,
    description: 'lista de url encurtados ativos pelo usuário',
    example: [
      {
        id: 'a90b3ad4-4c98-453e-b500-2a9d7503c9f2',
        originalUrl: 'https://web.whatsapp.com/',
        shortCode: 'S7ZcdI',
        clickCount: 0,
        updatedAt: '2025-06-05T06:03:03.312Z',
      },
      {
        id: '41497123-e969-47a6-8c0b-59d9b5fb915f',
        originalUrl: 'https://www.speedtest.net/pt',
        shortCode: 'q2Hai1',
        clickCount: 2,
        updatedAt: '2025-06-05T19:07:08.478Z',
      },
    ],
  })
  @UseGuards(JwtAuthGuard)
  @Get('urls')
  async list(@CurrentUser() user: User): Promise<Url[]> {
    return this.service.listByUser(user.id);
  }

  @ApiOperation({
    summary: 'Endpoint para atualizar a url encurtada',
    description:
      'Api ira editar e retornar o link encurtado, token de autenticação é obrigatorio',
  })
  @ApiParam({
    name: 'id',
    description: 'identificacao da url',
    required: true,
    schema: {
      type: 'string',
      example: '655ffc21-9c51-4cdc-a046-5b59b7d24d75',
    },
  })
  @ApiBody({
    description: 'Exemplo de url para atualizacao',
    type: UrlDto,
    examples: {
      exemplo: {
        summary: 'Exemplo de url para atualizacao',
        value: {
          originalUrl: 'https://www.youtube.com/',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Encurtado atualizado com sucesso',
    example: {
      shortUrl: 'http://localhost:3023/is2uvK',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Erro ao localizar url',
    example: {
      message: 'Not Found',
      statusCode: 404,
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('urls/:id')
  async update(
    @Param('id') id: string,
    @Body() data: UrlDto,
    @CurrentUser() user: User,
  ) {
    return await this.service.update(id, data, user.id);
  }

  @ApiOperation({
    summary: 'Deletar url encurtada',
    description:
      'Irá deletar a url encurtada, token de autenticação é obrigatorio',
  })
  @ApiParam({
    name: 'id',
    description: 'identificacao da url',
    required: true,
    schema: {
      type: 'string',
      example: '655ffc21-9c51-4cdc-a046-5b59b7d24d75',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Erro ao localizar url',
    example: {
      message: 'Not Found',
      statusCode: 404,
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete('urls/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.service.delete({ id, userId: user.id });
  }

  @ApiOperation({
    summary: 'Endpoint para redirecionar ao url original',
    description:
      'seguindo a o localhost:3023/ o endpoint ira redirecionar para o url original',
  })
  @ApiParam({
    name: 'code',
    description: 'code encurtado',
    required: true,
    schema: {
      type: 'string',
      example: 'q2Hai1',
    },
  })
  @Get(':code')
  @Redirect()
  async redirect(@Param('code') code: string) {
    console.log(code);
    const target = await this.service.redirect(code);
    return { url: target };
  }
}
