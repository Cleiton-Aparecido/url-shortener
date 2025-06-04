import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from 'src/config/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const { email, name, password } = createUserDto;

      const hashedPassword = await bcrypt.hash(password, 10);

      const userExists = await this.usersRepository.findOne({ email });
      if (userExists) {
        throw new ConflictException('E-mail já cadastrado');
      }

      const userCreated = this.usersRepository.create({
        email,
        name,
        password: hashedPassword,
      });
      await this.usersRepository.save(userCreated);

      return {
        statusCode: 201,
        message: 'Usuário criado com sucesso',
      };
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
