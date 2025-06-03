import { User } from 'src/config/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {}
