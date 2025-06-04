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
import { ApiTags } from '@nestjs/swagger';
import { UrlDto } from '../dto/url.dto';
import { AuthGuard } from '@nestjs/passport';
import { UrlsService } from '../services/url.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/config/entities/user.entity';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly service: UrlsService) {}

  @Post('shorten')
  @UseGuards(OptionalAuthGuard)
  async shorten(@Body() dto: UrlDto, @CurrentUser() user: User | null) {
    console.log(user);
    return await this.service.shorten(dto, user?.id);
  }

  @Get(':code')
  @Redirect()
  async redirect(@Param('code') code: string) {
    const target = await this.service.redirect(code);
    return { url: target };
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('urls')
  async list(@CurrentUser('id') id: string) {
    return 'ok';
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('urls/:code')
  async update(
    @Param('code') code: string,
    @Body() dto: UrlDto,
    @CurrentUser('id') id: string,
  ) {
    return 'ok';
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('urls/:code')
  @HttpCode(204)
  async remove(@Param('code') code: string, @CurrentUser('id') id: string) {
    return 'ok';
  }
}
