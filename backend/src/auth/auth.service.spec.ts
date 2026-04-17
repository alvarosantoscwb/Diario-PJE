import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: hashedPassword,
      });

      const result = await service.login('user@test.com', 'password123');

      expect(result).toEqual({ token: 'mock-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'user@test.com' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('notfound@test.com', 'any')).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: hashedPassword,
      });

      await expect(service.login('user@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return success message', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1 });

      const result = await service.register('John', 'john@test.com', 'password123');

      expect(result).toEqual({ message: 'User created successfully' });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'john@test.com' });

      await expect(service.register('John', 'john@test.com', 'password123')).rejects.toThrow(ConflictException);
    });

    it('should hash the password before saving', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1 });

      await service.register('John', 'john@test.com', 'plainpassword');

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('plainpassword');
      expect(await bcrypt.compare('plainpassword', createCall.data.password)).toBe(true);
    });
  });
});
