import { InjectRepository } from '@nestjs/typeorm';
import { Url } from 'src/config/entities/url.entity';
import { IsNull, Repository } from 'typeorm';

export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
  ) {}

  async findOne(filter: Partial<Url>) {
    return await this.urlRepository.findOne({
      where: filter,
    });
  }

  async updateOneMoreClickCount(id) {
    return await this.urlRepository.update(id, {
      clickCount: () => '"clickCount" + 1',
    });
  }

  async findOneByOrFail(filter: Partial<Url>) {
    const url = await this.urlRepository.findOneByOrFail({
      shortCode: filter.shortCode,
      deletedAt: IsNull(),
    });
    return url;
  }

  async save(url: Url): Promise<Url> {
    return await this.urlRepository.save(url);
  }

  create(data: Partial<Url>): any {
    return this.urlRepository.create(data);
  }
}
