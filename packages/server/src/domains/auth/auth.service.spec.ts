import { CacheService } from "@/cache/cache.service";
import { SessionModule } from "@/session/session.module";
import { SessionService } from "@/session/session.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as argon2 from "argon2";
import { Cache } from "cache-manager";
import { Express, Request, Response } from "express";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

const mockCacheService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  ttl: jest.fn(),
} as unknown as CacheService;

// Mock Express user type for testing
interface TestUser extends Express.User {
  id: string;
  email: string;
  name: string | null;
  refreshToken?: string;
}

// Mock user for testing
const mockUser: TestUser = {
  id: "1",
  email: "test@example.com",
  name: null,
  refreshToken: undefined,
};

// Mock UsersService for testing
type MockUsersService = {
  getUser: jest.Mock<Promise<TestUser | null>, [any]>;
  createUser: jest.Mock<Promise<TestUser>, [any]>;
};

const mockUsersService: MockUsersService = {
  getUser: jest.fn(),
  createUser: jest.fn(),
} as unknown as MockUsersService;

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case "JWT_ACCESS_SECRET":
        return "test-secret";
      case "JWT_ACCESS_TOKEN_TTL":
        return "1d";
      case "JWT_REFRESH_SECRET":
        return "refresh-secret";
      case "JWT_REFRESH_TOKEN_TTL":
        return "7d";
      default:
        return null;
    }
  }),
} as unknown as ConfigService;

const mockJwtService = {
  signAsync: jest.fn(),
  verify: jest.fn(),
} as unknown as JwtService;

// Mock implementations will be set in tests as needed

const mockSessionService = {
  createSession: jest.fn(),
  getSession: jest.fn(),
  destroySession: jest.fn(),
  updateSession: jest.fn(),
} as unknown as SessionService;

describe("AuthService", () => {
  let service: AuthService;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    // Initialize mocks
    mockReq = {
      user: null,
      headers: {},
      session: {
        sid: null,
        refresh_token: null,
        cookie: { originalMaxAge: 86400000 },
      },
    } as unknown as Partial<Request>;

    mockRes = {
      cookie: jest.fn(),
      setHeader: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Partial<Response>;

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

  describe("updateRefreshToken", () => {
    it("should update session with hashed refresh token", async () => {
      const sessionId = "test-session";
      const refreshToken = "test-refresh-token";
      const hashedRefreshToken = "hashed-refresh-token";

      jest.spyOn(argon2, "hash").mockResolvedValue(hashedRefreshToken);

      await service.updateRefreshToken(sessionId, refreshToken, mockRes as Response);

      expect(argon2.hash).toHaveBeenCalledWith(refreshToken);
      expect(mockSessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        { refresh_token: hashedRefreshToken },
        mockRes as Response
      );
    });
  });

  describe("signTokens", () => {
    it("should sign both access and refresh tokens", async () => {
      const sessionId = "test-session";
      const accessToken = "test-access-token";
      const refreshToken = "test-refresh-token";

      (mockJwtService.signAsync as jest.Mock).mockImplementation(async (payload, options) => {
        if (options?.secret === "refresh-secret") {
          return refreshToken;
        }
        return accessToken;
      });

      const tokens = await service.signTokens(sessionId, mockUser);

      expect(tokens).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully", async () => {
      const sessionId = "test-session";
      const sessionRefreshToken = "session-refresh-token";
      const userRefreshToken = "user-refresh-token";
      const accessToken = "new-access-token";
      const refreshToken = "new-refresh-token";

      mockReq.user = mockUser;
      mockReq.session = {
        sid: sessionId,
        refresh_token: sessionRefreshToken,
        cookie: {},
      };
      mockUser.refreshToken = userRefreshToken;

      jest.spyOn(argon2, "verify").mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.refreshTokens(mockReq as Request, mockRes as Response);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(mockSessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        { refresh_token: expect.any(String) },
        mockRes as Response
      );
    });

    it("should throw ForbiddenException for missing session data", async () => {
      mockReq.user = mockUser;
      mockReq.session = null;

      await expect(service.refreshTokens(mockReq as Request, mockRes as Response)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw ForbiddenException for token mismatch", async () => {
      mockReq.user = mockUser;
      mockReq.session = {
        sid: "test-session",
        refresh_token: "session-refresh-token",
        cookie: {},
      };
      mockUser.refreshToken = "different-refresh-token";

      jest.spyOn(argon2, "verify").mockResolvedValue(false);

      await expect(service.refreshTokens(mockReq as Request, mockRes as Response)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("validatePassword", () => {
    it("should validate correct credentials", async () => {
      const credentials = {
        email: "test@example.com",
      };

      mockUsersService.getUser.mockResolvedValue(mockUser);

      await expect(service.validatePassword(credentials)).resolves.toEqual(mockUser);
    });

    it("should throw BadRequestException for invalid credentials", async () => {
      const credentials = {
        email: "test@example.com",
        password: "wrong-pass-word",
      };

      mockUsersService.getUser.mockResolvedValue(mockUser);

      await expect(service.validatePassword(credentials)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for schema validation error", async () => {
      const invalidCredentials = {
        email: "invalid-email",
        password: "",
      };

      await expect(service.validatePassword(invalidCredentials)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw BadRequestException if user not found", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "password",
      };

      mockUsersService.getUser.mockResolvedValue(null);

      await expect(service.validatePassword(credentials)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if email and password mismatch", async () => {
      const credentials = {
        email: "test@example.com",
        password: "different-password",
      };

      mockUsersService.getUser.mockResolvedValue({
        ...mockUser,
        email: "different@example.com",
      });

      await expect(service.validatePassword(credentials)).rejects.toThrow(BadRequestException);
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const sessionId = "test-session";
      const accessToken = "test-access-token";
      const refreshToken = "test-refresh-token";

      mockReq.user = mockUser;
      mockSessionService.createSession = jest.fn().mockResolvedValue({ sessionId });
      (mockJwtService.signAsync as jest.Mock).mockImplementation(async (payload, options) => {
        if (options?.secret === "refresh-secret") {
          return refreshToken;
        }
        return accessToken;
      });
      jest.spyOn(argon2, "hash").mockResolvedValue(refreshToken);

      const result = await service.login(mockReq as Request, mockRes as Response);

      expect(result).toEqual({
        ...mockUser,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(mockSessionService.destroySession).toHaveBeenCalledWith(
        mockReq as Request,
        mockRes as Response
      );
      expect(mockSessionService.createSession).toHaveBeenCalledWith(mockRes as Response, mockUser);
      expect(mockSessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        { refresh_token: expect.any(String) },
        mockRes as Response
      );
    });

    it("should throw BadRequestException if user is not provided", async () => {
      mockReq.user = null;

      await expect(service.login(mockReq as Request, mockRes as Response)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("updateRefreshToken", () => {
    it("should update session with hashed refresh token", async () => {
      const sessionId = "test-session";
      const refreshToken = "test-refresh-token";
      const hashedRefreshToken = "hashed-refresh-token";

      jest.spyOn(argon2, "hash").mockResolvedValue(hashedRefreshToken);

      await service.updateRefreshToken(sessionId, refreshToken, mockRes as Response);

      expect(argon2.hash).toHaveBeenCalledWith(refreshToken);
      expect(mockSessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        { refresh_token: hashedRefreshToken },
        mockRes as Response
      );
    });
  });

  describe("signTokens", () => {
    it("should sign both access and refresh tokens", async () => {
      const sessionId = "test-session";
      const accessToken = "test-access-token";
      const refreshToken = "test-refresh-token";

      mockJwtService.signAsync = jest.fn().mockImplementation(async (payload, options) => {
        if (options?.secret === "refresh-secret") {
          return refreshToken;
        }
        return accessToken;
      });

      const tokens = await service.signTokens(sessionId, mockUser as any);

      expect(tokens).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully", async () => {
      const sessionId = "test-session";
      const sessionRefreshToken = "session-refresh-token";
      const userRefreshToken = "user-refresh-token";
      const accessToken = "new-access-token";
      const refreshToken = "new-refresh-token";

      mockReq.user = mockUser;
      mockReq.session = {
        sid: sessionId,
        refresh_token: sessionRefreshToken,
        cookie: { originalMaxAge: 86400000 },
      };
      mockUser.refreshToken = userRefreshToken;

      jest.spyOn(argon2, "verify").mockResolvedValue(true);
      mockJwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.refreshTokens(mockReq as Request, mockRes as Response);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(mockSessionService.updateSession).toHaveBeenCalledWith(
        sessionId,
        { refresh_token: expect.any(String) },
        mockRes as Response
      );
    });

    it("should throw ForbiddenException for missing session data", async () => {
      mockReq.user = mockUser;
      mockReq.session = null;

      await expect(service.refreshTokens(mockReq as Request, mockRes as Response)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw ForbiddenException for token mismatch", async () => {
      mockReq.user = mockUser;
      mockReq.session = {
        sid: "test-session",
        cookie: {
          maxAge: 1000,
          expires: new Date(),
        },
        refresh_token: "session-refresh-token",
      };
      mockUser.refreshToken = "different-refresh-token";

      jest.spyOn(argon2, "verify").mockResolvedValue(false);

      await expect(service.refreshTokens(mockReq as Request, mockRes as Response)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("logout", () => {
    let service: AuthService;
    let mockCache: Cache;

    beforeEach(async () => {
      mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        ttl: jest.fn(),
      } as unknown as Cache;
      const module: TestingModule = await Test.createTestingModule({
        imports: [SessionModule],
        providers: [
          AuthService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: JwtService, useValue: mockJwtService },
          { provide: UsersService, useValue: mockUsersService },
        ],
      })
        .overrideProvider(CACHE_MANAGER)
        .useValue(mockCache)
        .compile();
      service = module.get<AuthService>(AuthService);
    });

    it("should set logout cookie when session exist", async () => {
      const sessionId = "test-session";
      mockReq.headers = { cookie: `sessionId=${sessionId}; other=cookie` };

      await service.logout(mockReq as Request, mockRes as Response);

      await expect(mockCache.del).toHaveBeenCalledWith(`session::${sessionId}`);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "sessionId=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"
      );
    });

    it("should set logout cookie when session does not exist", async () => {
      await service.logout(mockReq as Request, mockRes as Response);

      await expect(mockCache.del).not.toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "sessionId=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"
      );
    });
  });

  describe("googleComplete", () => {
    let service: AuthService;
    let mockPayload: { state?: string; accessToken: string };
    const accessToken = "test-access-token";

    beforeEach(async () => {
      mockPayload = {
        state: Buffer.from(
          JSON.stringify({ redirectUrl: "http://localhost/redirect-url" })
        ).toString("base64"),
        accessToken,
      };
      const module: TestingModule = await Test.createTestingModule({
        imports: [SessionModule],
        providers: [
          AuthService,
          { provide: ConfigService, useValue: mockConfigService },
          { provide: JwtService, useValue: mockJwtService },
          { provide: UsersService, useValue: mockUsersService },
        ],
      }).compile();
      service = module.get<AuthService>(AuthService);
    });

    it("should complete successfully", async () => {
      await service.googleComplete(mockPayload, mockRes as Response);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        "http://localhost/redirect-url?access_token=test-access-token"
      );
    });

    it("should throw BadRequestException when state does not include redirectUrl", async () => {
      await expect(
        service.googleComplete({ ...mockPayload, state: "" }, mockRes as Response)
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid state", async () => {
      await expect(
        service.googleComplete({ ...mockPayload, state: "some-invalid-state" }, mockRes as Response)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
