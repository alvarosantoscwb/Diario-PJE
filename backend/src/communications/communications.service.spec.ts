import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockCommunication = {
  id: 1,
  hash: 'hash-001',
  processNumber: '0001234-00.2025.8.26.0100',
  courtAcronym: 'TJSP',
  content: 'Fica intimada a parte autora para ciência da decisão.',
  availableAt: new Date('2025-01-10'),
  recipients: [],
};

const mockPrisma = {
  communication: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

const mockGroq = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => mockGroq);
});

describe('CommunicationsService', () => {
  let service: CommunicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated communications', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([mockCommunication]);
      mockPrisma.communication.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply tribunal filter', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, tribunal: 'TJSP' });

      const whereArg = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(whereArg.courtAcronym).toEqual({
        contains: 'TJSP',
        mode: 'insensitive',
      });
    });

    it('should apply date range filter', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        dataInicio: '2025-01-01',
        dataFim: '2025-01-31',
      });

      const whereArg = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(whereArg.availableAt).toEqual({
        gte: new Date('2025-01-01'),
        lte: new Date('2025-01-31'),
      });
    });

    it('should calculate correct totalPages', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findByProcess', () => {
    it('should return process details with communications', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([mockCommunication]);

      const result = await service.findByProcess('0001234-00.2025.8.26.0100');

      expect(result.processNumber).toBe('0001234-00.2025.8.26.0100');
      expect(result.courtAcronym).toBe('TJSP');
      expect(result.communications).toHaveLength(1);
    });

    it('should detect transitou em julgado in content', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([
        {
          ...mockCommunication,
          content: 'A sentença transitou em julgado em 05/01/2025.',
        },
      ]);

      const result = await service.findByProcess('0001234-00.2025.8.26.0100');

      expect(result.hasTransitadoEmJulgado).toBe(true);
    });

    it('should return hasTransitadoEmJulgado false when term is absent', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([mockCommunication]);

      const result = await service.findByProcess('0001234-00.2025.8.26.0100');

      expect(result.hasTransitadoEmJulgado).toBe(false);
    });

    it('should detect transitou em julgado case insensitively', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([
        {
          ...mockCommunication,
          content: 'TRANSITOU EM JULGADO conforme certidão.',
        },
      ]);

      const result = await service.findByProcess('0001234-00.2025.8.26.0100');

      expect(result.hasTransitadoEmJulgado).toBe(true);
    });
  });

  describe('generateSummary', () => {
    it('should return summary from Groq', async () => {
      mockPrisma.communication.findUnique.mockResolvedValue(mockCommunication);
      mockGroq.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Resumo gerado pela IA.' } }],
      });

      const result = await service.generateSummary(1);

      expect(result.summary).toBe('Resumo gerado pela IA.');
    });

    it('should throw NotFoundException when communication does not exist', async () => {
      mockPrisma.communication.findUnique.mockResolvedValue(null);

      await expect(service.generateSummary(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
