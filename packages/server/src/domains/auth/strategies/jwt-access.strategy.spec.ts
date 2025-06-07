import { SessionService } from "@/session/session.service";
import { ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { JwtAccessStrategy } from "./jwt-access.strategy";

const mockConfigService = {
  get: jest.fn().mockReturnValue("test-secret"),
} as unknown as ConfigService;

const mockSessionService = {
  getSessionId: jest.fn(),
} as unknown as SessionService;

describe("JwtAccessStrategy", () => {
  let strategy: JwtAccessStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAccessStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    strategy = module.get<JwtAccessStrategy>(JwtAccessStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    const mockReq = {
      headers: {
        authorization: "Bearer test-token",
      },
    } as Request;

    const mockPayload = {
      username: "test@example.com",
      sub: {
        sid: "test-session",
        uid: "1",
      },
    } as Express.JwtPayload;

    it("should validate successfully with matching session", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue("test-session");

      const result = await strategy.validate(mockReq, mockPayload);

      expect(result).toEqual({
        id: "1",
        email: "test@example.com",
      });
    });

    it("should throw ForbiddenException for missing session", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue(null);

      await expect(strategy.validate(mockReq, mockPayload)).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException for mismatched session", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue("different-session");

      await expect(strategy.validate(mockReq, mockPayload)).rejects.toThrow(ForbiddenException);
    });
  });
});
