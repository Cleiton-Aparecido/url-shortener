import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ConflictException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from 'src/users/service/users.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const mockUsersService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users → deve criar usuário com dados válidos', () => {
    const dto = { email: 'user@example.com', name: 'user', password: '123456' };
    const successResponse = {
      statusCode: 201,
      message: 'Usuário criado com sucesso',
    };
    mockUsersService.create.mockResolvedValue(successResponse);

    return request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(201)
      .expect(successResponse);
  });

  it('POST /users → deve retornar conflito se email já existir', () => {
    const dto = {
      email: 'duplicate@example.com',
      name: 'user',
      password: '123456',
    };
    mockUsersService.create.mockRejectedValue(
      new ConflictException('E-mail já cadastrado'),
    );

    return request(app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(409)
      .then((res) => {
        expect(res.body).toEqual({
          statusCode: 409,
          message: 'E-mail já cadastrado',
          error: 'Conflict',
        });
      });
  });
});
