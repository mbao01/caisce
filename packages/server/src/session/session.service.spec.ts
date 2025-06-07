import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CacheService } from "../cache/cache.service";
import { SessionService } from "./session.service";

const mockCacheService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  ttl: jest.fn(),
} as unknown as CacheService;

describe("SessionService", () => {
  let service: SessionService;
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, { provide: CacheService, useValue: mockCacheService }],
    }).compile();

    service = module.get<SessionService>(SessionService);

    mockReq = {
      headers: {},
    } as Request;

    mockRes = {
      setHeader: jest.fn().mockImplementation((key, value) => {
        if (key === "Set-Cookie") {
          return value;
        }
        return undefined;
      }),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      getHeader: jest.fn().mockReturnValue(undefined),
      clearCookie: jest.fn().mockImplementation((name) => {
        return `sessionId=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
      }),
    } as unknown as Response;
  });

  describe("getSessionId", () => {
    it("should return null if no cookie header", () => {
      expect(service.getSessionId(mockReq)).toBeNull();
    });

    it("should return null if cookie header has no session cookie", () => {
      mockReq.headers.cookie = "other=cookie; value=123";
      expect(service.getSessionId(mockReq)).toBeNull();
    });

    it("should return session ID from cookie", () => {
      const sessionId = uuidv4();
      mockReq.headers.cookie = `sessionId=${sessionId}; other=cookie`;
      expect(service.getSessionId(mockReq)).toBe(sessionId);
    });
  });

  describe("getSession", () => {
    it("should return null if no session ID", async () => {
      expect(await service.getSession(mockReq)).toBeNull();
    });

    it("should return session from cache", async () => {
      const sessionId = uuidv4();
      const mockSession = { sid: sessionId, cookie: { maxAge: 3600 } };
      (mockCacheService.get as jest.Mock).mockResolvedValue(mockSession);

      mockReq.headers.cookie = `sessionId=${sessionId}`;
      const result = await service.getSession(mockReq);
      expect(result).toEqual(mockSession);
    });
  });

  describe("createSession", () => {
    it("should create new session with user", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      const result = await service.createSession(mockRes, mockUser);

      expect(result).toHaveProperty("sessionId");
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it("should create new session without user", async () => {
      const result = await service.createSession(mockRes);
      expect(result).toHaveProperty("sessionId");
      expect(mockCacheService.set).toHaveBeenCalled();
      expect(mockRes.setHeader).toHaveBeenCalled();
    });
  });

  describe("destroySession", () => {
    it("should destroy session and clear cookie", async () => {
      const sessionId = uuidv4();
      mockReq.headers.cookie = `sessionId=${sessionId}`;

      await service.destroySession(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        `sessionId=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
      );
    });

    it("should clear cookie even if session not found", async () => {
      await service.destroySession(mockReq, mockRes);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sessionId=;")
      );
    });
  });

  describe("updateSession", () => {
    it("should update session with new data", async () => {
      const sessionId = uuidv4();
      const mockSession = {
        sid: sessionId,
        cookie: { maxAge: 3600, expires: new Date(Date.now() + 3600) },
      };
      (mockCacheService.get as jest.Mock).mockResolvedValue(mockSession);

      await service.updateSession(sessionId, { data: "new" }, mockRes);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining("session::"),
        {
          cookie: expect.objectContaining({ maxAge: 3600000 }),
          data: "new",
          sid: sessionId,
        },
        3660000
      );
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it("should set cookie header and update session with new data", async () => {
      const mockSession = {
        cookie: { maxAge: 3600, expires: new Date(Date.now() + 3600) },
      };
      (mockCacheService.get as jest.Mock).mockResolvedValue(mockSession);

      await service.updateSession("sessionId", { data: "new" }, mockRes);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining("session::"),
        {
          cookie: expect.objectContaining({ maxAge: 3600000 }),
          data: "new",
          sid: expect.stringContaining(""),
        },
        3660000
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        expect.stringContaining("sessionId=")
      );
    });

    it("should not update if session not found", async () => {
      (mockCacheService.get as jest.Mock).mockResolvedValue(null);
      await service.updateSession(uuidv4(), { data: "new" }, mockRes);
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });
  });
});
