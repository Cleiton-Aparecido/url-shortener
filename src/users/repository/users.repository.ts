import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../config/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(user: Partial<User>) {
    return await this.userRepository.findOne({
      where: user,
    });
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  create(data: Partial<User>): any {
    return this.userRepository.create(data);
  }
}
