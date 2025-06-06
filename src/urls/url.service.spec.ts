import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './services/url.service';
import { UrlRepository } from './repository/url.repository';
import { NotFoundException } from '@nestjs/common';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: UrlRepository;

  // const mockUrlRepository = {
  //   create: jest.fn(),
  //   save: jest.fn(),
  //   findOne: jest.fn(),
  //   findOneByOrFail: jest.fn(),
  //   updateOneMoreClickCount: jest.fn(),
  // };

  const mockUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneByOrFail: jest.fn(),
    updateOneMoreClickCount: jest.fn(),
    findOneForIdUser: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: UrlRepository,
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<UrlRepository>(UrlRepository);

    jest.clearAllMocks();
    process.env.PORT = '3000';
  });

  describe('shorten', () => {
    it('deve criar uma URL encurtada com sucesso', async () => {
      const dto = { originalUrl: 'https://example.com' };
      const fakeShortCode = 'abc123';

      jest
        .spyOn(service as any, 'generateCode')
        .mockResolvedValue(fakeShortCode);

      mockUrlRepository.create.mockReturnValue({
        originalUrl: dto.originalUrl,
        shortCode: fakeShortCode,
      });
      mockUrlRepository.save.mockResolvedValue({});

      const result = await service.shorten(dto);

      expect(mockUrlRepository.create).toHaveBeenCalled();
      expect(mockUrlRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        shortUrl: `http://localhost:3000/${fakeShortCode}`,
      });
    });
  });

  describe('redirect', () => {
    it('deve retornar a URL original se shortCode for válido', async () => {
      const fakeCode = 'abc123';
      const fakeUrl = { id: '1', originalUrl: 'https://example.com' };

      mockUrlRepository.findOneByOrFail.mockResolvedValue(fakeUrl);
      mockUrlRepository.updateOneMoreClickCount.mockImplementation(() => {});

      const result = await service.redirect(fakeCode);

      expect(repository.findOneByOrFail).toHaveBeenCalledWith({
        shortCode: fakeCode,
      });
      expect(repository.updateOneMoreClickCount).toHaveBeenCalledWith(
        fakeUrl.id,
      );
      expect(result).toBe(fakeUrl.originalUrl);
    });

    it('deve lançar NotFoundException se código não existir', async () => {
      mockUrlRepository.findOneByOrFail.mockRejectedValue(
        new Error('not found'),
      );

      await expect(service.redirect('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar a URL se encontrar o registro do usuário', async () => {
      const id = '1';
      const userId = 'user-123';
      const dto = { originalUrl: 'https://updated.com' };

      const foundUrl = { id, originalUrl: 'https://old.com' };

      mockUrlRepository.findOneForIdUser = jest
        .fn()
        .mockResolvedValue(foundUrl);
      mockUrlRepository.save.mockResolvedValue({
        ...foundUrl,
        originalUrl: dto.originalUrl,
      });

      const result = await service.update(id, dto, userId);

      expect(mockUrlRepository.findOneForIdUser).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(mockUrlRepository.save).toHaveBeenCalledWith({
        ...foundUrl,
        originalUrl: dto.originalUrl,
      });
      expect(result.originalUrl).toBe(dto.originalUrl);
    });

    it('deve lançar NotFoundException se não encontrar a URL do usuário', async () => {
      mockUrlRepository.findOneForIdUser = jest
        .fn()
        .mockResolvedValue(undefined);

      await expect(
        service.update('invalid', { originalUrl: 'x' }, 'user-x'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listByUser', () => {
    it('deve retornar a lista de URLs do usuário', async () => {
      const userId = 'user-123';
      const urls = [
        {
          id: '2215d396-0988-4670-aa4b-5882db8af1a2',
          originalUrl: 'https://www.speedtest.net/pt',
          shortCode: 'pcqa6X',
          clickCount: 2,
          updatedAt: '2025-06-06T12:37:19.249Z',
        },
      ];

      mockUrlRepository.findAll = jest.fn().mockResolvedValue(urls);

      const result = await service.listByUser(userId);

      expect(mockUrlRepository.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(urls);
    });

    it('deve lançar NotFoundException em caso de erro no repositório', async () => {
      mockUrlRepository.findAll = jest
        .fn()
        .mockRejectedValue(new Error('fail'));

      await expect(service.listByUser('user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deve chamar o repositório com o DTO de exclusão', async () => {
      const dto = { id: 'url-1', userId: 'user-123' };

      mockUrlRepository.delete = jest.fn().mockResolvedValue(undefined);

      await service.delete(dto);

      expect(mockUrlRepository.delete).toHaveBeenCalledWith(dto);
    });
  });
});
