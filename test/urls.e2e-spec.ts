import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { UrlRepository } from 'src/urls/repository/url.repository';
import { UrlsService } from 'src/urls/services/url.service';

describe('UrlsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let token: string;

  // URL “mockada”
  const mockUrl = {
    id: '1111-2222-3333-4444',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    clickCount: 0,
    updatedAt: new Date(),
  };

  // Mock do repositório
  const mockRepo = {
    findOne: jest.fn().mockResolvedValue(undefined),
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn().mockResolvedValue(mockUrl),
    findOneByOrFail: jest.fn().mockResolvedValue(mockUrl),
    updateOneMoreClickCount: jest.fn(),
    findAll: jest.fn().mockResolvedValue([mockUrl]),
    findOneForIdUser: jest.fn().mockResolvedValue(mockUrl),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    process.env.PORT = '3023';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UrlRepository)
      .useValue(mockRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Override do método privado generateCode usando cast para any
    const urlsService = app.get<UrlsService>(UrlsService) as any;
    jest
      .spyOn(urlsService, 'generateCode')
      .mockResolvedValue(mockUrl.shortCode);

    jwtService = app.get(JwtService);
    token = jwtService.sign({ sub: 'user-id', email: 'u@e.com' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /shorten → deve encurtar sem precisar de token', () => {
    return request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: mockUrl.originalUrl })
      .expect(201)
      .expect({
        shortUrl: `http://localhost:3023/${mockUrl.shortCode}`,
      });
  });

  it('GET /urls → deve listar urls do usuário (token obrigatório)', () => {
    return request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({
          id: mockUrl.id,
          originalUrl: mockUrl.originalUrl,
          shortCode: mockUrl.shortCode,
        });
      });
  });

  it('PUT /urls/:id → deve atualizar url (token obrigatório)', () => {
    const updated = { originalUrl: 'https://changed.com' };
    mockRepo.save.mockResolvedValue({ ...mockUrl, ...updated });
    return request(app.getHttpServer())
      .put(`/urls/${mockUrl.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updated)
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchObject({
          id: mockUrl.id,
          originalUrl: updated.originalUrl,
        });
      });
  });

  it('DELETE /urls/:id → deve remover url (token obrigatório)', () => {
    return request(app.getHttpServer())
      .delete(`/urls/${mockUrl.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  it('GET /:code → deve redirecionar para originalUrl', () => {
    return request(app.getHttpServer())
      .get(`/${mockUrl.shortCode}`)
      .expect(302)
      .expect('Location', mockUrl.originalUrl);
  });
});
