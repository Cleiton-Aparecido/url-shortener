import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UsersRepository } from './repository/users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);

    jest.clearAllMocks();
  });

  it('deve criar um novo usuário com sucesso', async () => {
    const dto = {
      email: 'teste@email.com',
      name: 'Test User',
      password: '123456',
    };

    mockUsersRepository.findOne.mockResolvedValue(null);
    mockUsersRepository.create.mockImplementation((data) => data);
    mockUsersRepository.save.mockResolvedValue({});

    const result = await service.create(dto);

    expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
      email: dto.email,
    });
    expect(mockUsersRepository.create).toHaveBeenCalled();
    expect(mockUsersRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 201,
      message: 'Usuário criado com sucesso',
    });
  });

  it('deve lançar exceção se o e-mail já estiver cadastrado', async () => {
    const dto = {
      email: 'teste@email.com',
      name: 'Test User',
      password: '123456',
    };

    mockUsersRepository.findOne.mockResolvedValue({ id: 1, email: dto.email });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
      email: dto.email,
    });
    expect(mockUsersRepository.create).not.toHaveBeenCalled();
    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });
});
