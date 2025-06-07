import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { UsersRepository } from '../src/users/repository/users.repository';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: '1111-2222-3333-4444',
    name: 'Test User',
    email: 'test@example.com',
    password: bcrypt.hashSync('password', 10),
  };

  const mockUsersRepo = {
    findOne: jest.fn(({ email }) =>
      email === mockUser.email
        ? Promise.resolve(mockUser)
        : Promise.resolve(null),
    ),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersRepository)
      .useValue(mockUsersRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) — credenciais corretas', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'password' })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(typeof res.body.access_token).toBe('string');
      });
  });

  it('/auth/login (POST) — credenciais inválidas', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: mockUser.email, password: 'wrongpassword' })
      .expect(401)
      .then((res) => {
        expect(res.body.statusCode).toBe(401);
        expect(res.body.message).toBe('Usuário ou senha inválidos');
        expect(res.body.error).toBe('Unauthorized');
      });
  });

  it('/auth/login (POST) — usuário não existe', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'noone@nowhere.com', password: 'whatever' })
      .expect(401)
      .then((res) => {
        expect(res.body.message).toBe('Usuário ou senha inválidos');
      });
  });
});
