import { UrlDto } from '../dto/url.dto';
import { Injectable } from '@nestjs/common';
import { UrlRepository } from '../repository/url.repository';
import { nanoid } from 'nanoid';

@Injectable()
export class UrlsService {
  constructor(private readonly urlRepository: UrlRepository) {}

  private async generateCode(): Promise<string> {
    const nano = nanoid(6);
    const exists = await this.urlRepository.findOne({ shortCode: nano });
    return exists ? this.generateCode() : nano;
  }

  async shorten(dto: UrlDto, userId?: string) {
    console.log({ dto, userId });
    const shortCode = await this.generateCode();
    const url = this.urlRepository.create({
      originalUrl: dto.originalUrl,
      shortCode,
      user: userId ? ({ id: userId } as any) : undefined,
    });
    await this.urlRepository.save(url);
    return { shortUrl: `http://localhost:${process.env.PORT}/${shortCode}` };
  }

  async redirect(code: string): Promise<string> {
    const url = await this.urlRepository.findOneByOrFail({
      shortCode: code,
    });
    this.urlRepository.updateOneMoreClickCount(url.id);
    return url.originalUrl;
  }
}
