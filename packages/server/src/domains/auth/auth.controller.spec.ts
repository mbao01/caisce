import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./guards/jwt-access.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CredentialDto } from "./schema/login.schema";

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  googleComplete: jest.fn(),
  refreshTokens: jest.fn(),
} as unknown as AuthService;

const mockLocalAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
} as unknown as LocalAuthGuard;

const mockJwtAccessGuard = {
  canActivate: jest.fn().mockReturnValue(true),
} as unknown as JwtAccessGuard;

const mockJwtRefreshGuard = {
  canActivate: jest.fn().mockReturnValue(true),
} as unknown as JwtRefreshGuard;

const mockReq = {
  user: {
    id: "1",
    email: "test@example.com",
  },
} as unknown as Request;

const mockRes = {
  cookie: jest.fn(),
} as unknown as Response;

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LocalAuthGuard, useValue: mockLocalAuthGuard },
        { provide: JwtAccessGuard, useValue: mockJwtAccessGuard },
        { provide: JwtRefreshGuard, useValue: mockJwtRefreshGuard },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    const mockCredential: CredentialDto = {
      email: "test@example.com",
    };

    it("should call authService.login with correct parameters", async () => {
      await controller.login(mockCredential, mockReq, mockRes);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });

  describe("refreshTokens", () => {
    it("should call authService.refreshTokens with correct parameters", async () => {
      await controller.refreshTokens(mockReq, mockRes);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });

  describe("getProfile", () => {
    it("should return user profile", () => {
      const result = controller.getProfile(mockReq);
      expect(result).toEqual(mockReq.user);
    });
  });

  describe("logout", () => {
    it("should call authService.logout with correct parameters", async () => {
      await controller.logout(mockReq, mockRes);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockReq, mockRes);
    });
  });

  describe("googleCallback", () => {
    it("should call authService.googleComplete with correct parameters", async () => {
      const state = "test-state";
      const accessToken = "test-access-token";

      (mockAuthService.login as jest.Mock).mockResolvedValue({ access_token: accessToken });

      await controller.googleCallback(mockReq, mockRes, state);
      expect(mockAuthService.googleComplete).toHaveBeenCalledWith({ state, accessToken }, mockRes);
    });
  });
});
