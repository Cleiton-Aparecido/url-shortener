import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthDto } from '../dto/auth.dto';

describe('AuthService (unit)', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const testUser = {
    id: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: { findOne: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(
      UsersRepository,
    ) as jest.Mocked<UsersRepository>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;

    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    const dto: AuthDto = { email: testUser.email, password: 'plainPassword' };

    it('should return user data without password when credentials are valid', async () => {
      usersRepository.findOne.mockResolvedValue(testUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validateEmail(dto);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        email: dto.email,
      });
      expect(result).toEqual({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
      });
    });

    it('should return null if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.validateEmail(dto);
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      usersRepository.findOne.mockResolvedValue(testUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validateEmail(dto);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const dto: AuthDto = { email: testUser.email, password: 'plainPassword' };

    it('should return access_token when credentials are valid', async () => {
      jest.spyOn(service, 'validateEmail').mockResolvedValue({
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
      });
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.login(dto);
      expect(service.validateEmail).toHaveBeenCalledWith(dto);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { name: testUser.name, email: testUser.email, id: testUser.id },
        { expiresIn: '10h' },
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateEmail').mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha inválidos'),
      );
      expect(service.validateEmail).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if validateEmail throws', async () => {
      jest
        .spyOn(service, 'validateEmail')
        .mockRejectedValue(new Error('db error'));

      await expect(service.login(dto)).rejects.toThrow(
        new UnauthorizedException('db error'),
      );
    });
  });
});
