import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { LocalStrategy } from "./local.strategy";

const mockAuthService = {
  validatePassword: jest.fn(),
} as unknown as AuthService;

describe("LocalStrategy", () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, { provide: AuthService, useValue: mockAuthService }],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      password: "hashed-password",
    };

    it("should validate successfully with correct credentials", async () => {
      (mockAuthService.validatePassword as jest.Mock).mockResolvedValue(mockUser);

      const result = await strategy.validate("test@example.com", "password");

      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      (mockAuthService.validatePassword as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate("invalid@example.com", "password")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
