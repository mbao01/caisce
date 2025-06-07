import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Test, TestingModule } from "@nestjs/testing";
import { Cache } from "cache-manager";
import { Request, Response } from "express";
import { SessionMiddleware } from "./session.midleware";
import { SessionModule } from "./session.module";

describe("SessionMiddleware", () => {
  let middleware: SessionMiddleware;
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
      providers: [SessionMiddleware],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCache)
      .compile();

    middleware = module.get<SessionMiddleware>(SessionMiddleware);
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  describe("use", () => {
    const sessionId = "test-session-id";
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      mockReq = {
        headers: {
          cookie: `sessionId=${sessionId}`,
        },
      } as Partial<Request>;
      mockRes = {
        cookie: jest.fn(),
      } as Partial<Response>;
      next = jest.fn();
    });

    it("should have null session if session ID cookie is missing", async () => {
      (mockCache.get as jest.Mock).mockResolvedValue({ sid: sessionId });
      const mockReq = {
        headers: {},
        cookies: {},
      } as unknown as Request;

      await middleware.use(mockReq, mockRes as Response, next);

      expect(mockReq.session).toBeNull();
      await expect(mockCache.get).not.toHaveBeenCalled();
      await expect(next).toHaveBeenCalled();
    });

    it("should create new session if none exists", async () => {
      (mockCache.get as jest.Mock).mockResolvedValue({ sid: sessionId });

      await middleware.use(mockReq as Request, mockRes as Response, next);

      expect(mockReq.session).toEqual({ sid: sessionId });
      expect(mockCache.get).toHaveBeenCalledWith(`session::${sessionId}`);
      expect(next).toHaveBeenCalled();
    });

    it("should use existing session", async () => {
      const sessionData = { user: { id: "1" } };
      (mockCache.get as jest.Mock).mockResolvedValue(sessionData);

      await middleware.use(mockReq as Request, mockRes as Response, next);

      expect(mockReq.session).toEqual(sessionData);
      expect(mockCache.get).toHaveBeenCalledWith(`session::${sessionId}`);
      expect(next).toHaveBeenCalled();
    });

    it("should handle invalid session cookie", async () => {
      mockReq.headers = {
        cookie: `sessionId=invalid-session`,
      };
      (mockCache.get as jest.Mock).mockResolvedValue(null);

      await middleware.use(mockReq as Request, mockRes as Response, next);

      expect(mockReq.session).toBeNull();
      expect(mockCache.get).toHaveBeenCalledWith(`session::invalid-session`);
      expect(next).toHaveBeenCalled();
    });

    it("should handle error", async () => {
      (mockCache.get as jest.Mock).mockRejectedValue(new Error("test error"));

      await expect(() =>
        middleware.use(mockReq as Request, mockRes as Response, next)
      ).rejects.toThrow("test error");

      expect(next).not.toHaveBeenCalled();
    });
  });
});
