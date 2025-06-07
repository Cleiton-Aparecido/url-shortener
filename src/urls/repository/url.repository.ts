import { InjectRepository } from '@nestjs/typeorm';
import { Url } from 'src/config/entities/url.entity';
import { IsNull, Repository } from 'typeorm';
import { UrlDeleteDto } from '../dto/url-delete.dto';

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

  async findAll(userId: string) {
    return await this.urlRepository.find({
      where: { user: { id: userId }, deletedAt: IsNull() },
      select: ['id', 'originalUrl', 'shortCode', 'clickCount', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  create(data: Partial<Url>): any {
    return this.urlRepository.create(data);
  }

  async findOneForIdUser(id: string, userId: string) {
    const url = await this.urlRepository.findOne({
      where: { id, user: { id: userId }, deletedAt: IsNull() },
    });
    return url;
  }

  async delete(urlDelete: UrlDeleteDto) {
    return await this.urlRepository.update(
      { id: urlDelete.id, user: { id: urlDelete.userId } },
      { deletedAt: new Date() },
    );
  }
}
