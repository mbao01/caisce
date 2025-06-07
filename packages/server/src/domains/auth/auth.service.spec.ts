import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from "@/cache/cache.service";
import { SessionService } from '@/session/session.service';
import { UsersService } from '../users/users.service';

const mockCacheService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  ttl: jest.fn(),
} as unknown as CacheService;

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'JWT_ACCESS_SECRET':
        return 'test-secret';
      case 'JWT_ACCESS_TOKEN_TTL':
        return '1d';
      default:
        return null;
    }
  }),
} as unknown as ConfigService;

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
} as unknown as JwtService;

const mockSessionService = {
  createSession: jest.fn(),
  getSession: jest.fn(),
  destroySession: jest.fn(),
  updateSession: jest.fn(),
} as unknown as SessionService;

const mockUsersService = {
  getUser: jest.fn(),
  createUser: jest.fn(),
} as unknown as UsersService;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
