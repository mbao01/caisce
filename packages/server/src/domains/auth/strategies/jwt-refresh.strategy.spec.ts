import { UsersService } from "@/domains/users/users.service";
import { SessionService } from "@/session/session.service";
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";

const mockConfigService = {
  get: jest.fn().mockReturnValue("refresh-secret"),
} as unknown as ConfigService;

const mockSessionService = {
  getSessionId: jest.fn(),
} as unknown as SessionService;

const mockUsersService = {
  getUser: jest.fn(),
} as unknown as UsersService;

describe("JwtRefreshStrategy", () => {
  let strategy: JwtRefreshStrategy;
  const mockUser = {
    id: "1",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    picture: "https://example.com/picture.jpg",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    const mockReq = {
      headers: {
        authorization: "Bearer refresh-token",
      },
      get: jest.fn(),
    } as unknown as Request;

    const mockPayload = {
      username: "test@example.com",
      sub: "1",
      sid: "test-session",
    } as Express.JwtPayload;

    it("should validate successfully with matching session", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue("test-session");
      (mockReq.get as jest.Mock).mockReturnValue("Bearer refresh-token");
      (mockUsersService.getUser as jest.Mock).mockReturnValue(mockUser);

      const result = await strategy.validate(mockReq, mockPayload);

      expect(result).toEqual({
        ...mockUser,
        refreshToken: "refresh-token",
      });
    });

    it("should throw InternalServerErrorException when user is not found", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue("test-session");
      (mockReq.get as jest.Mock).mockReturnValue("Bearer refresh-token");
      (mockUsersService.getUser as jest.Mock).mockReturnValue(null);

      await expect(strategy.validate(mockReq, mockPayload)).rejects.toThrow(
        InternalServerErrorException
      );
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
