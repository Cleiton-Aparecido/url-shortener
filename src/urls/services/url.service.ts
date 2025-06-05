import { UrlDto } from '../dto/url.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UrlRepository } from '../repository/url.repository';
import { nanoid } from 'nanoid';
import { Url } from 'src/config/entities/url.entity';
import { UrlDeleteDto } from '../dto/url-delete.dto';

@Injectable()
export class UrlsService {
  constructor(private readonly urlRepository: UrlRepository) {}

  private async generateCode(): Promise<string> {
    const nano = nanoid(6);
    const exists = await this.urlRepository.findOne({ shortCode: nano });
    return exists ? this.generateCode() : nano;
  }

  async shorten(dto: UrlDto, userId?: string) {
    try {
      const shortCode = await this.generateCode();
      const url = this.urlRepository.create({
        originalUrl: dto.originalUrl,
        shortCode,
        user: userId ? ({ id: userId } as any) : undefined,
      });
      await this.urlRepository.save(url);
      return { shortUrl: `http://localhost:${process.env.PORT}/${shortCode}` };
    } catch (error) {
      console.log(error);
      throw new error();
    }
  }

  async redirect(code: string): Promise<any> {
    try {
      const url = await this.urlRepository.findOneByOrFail({
        shortCode: code,
      });
      this.urlRepository.updateOneMoreClickCount(url.id);
      return url.originalUrl;
    } catch (error) {
      Logger.error(error);
      throw new NotFoundException();
    }
  }
  async listByUser(userId: string): Promise<Url[]> {
    try {
      return await this.urlRepository.findAll(userId);
    } catch (error) {
      Logger.error(error);
      throw new NotFoundException();
    }
  }

  async update(id: string, urlNew: UrlDto, userId: string) {
    try {
      const url = await this.urlRepository.findOneForIdUser(id, userId);
      if (!url) {
        throw new NotFoundException();
      }
      url.originalUrl = urlNew.originalUrl;
      return this.urlRepository.save(url);
    } catch (error) {
      Logger.error(error);
      throw new NotFoundException();
    }
  }

  async delete(urlDelete: UrlDeleteDto) {
    await this.urlRepository.delete(urlDelete);
  }
}
