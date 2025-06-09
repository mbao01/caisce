import { UsersService } from "@/domains/users/users.service";
import { ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ProviderType } from "@prisma/client";
import { Request } from "express";
import { Profile } from "passport-google-oauth20";
import { GoogleStrategy } from "./google-oauth.strategy";

const mockConfigService = {
  get: jest.fn().mockReturnValue("test-secret"),
} as unknown as ConfigService;

const mockUsersService = {
  getUser: jest.fn(),
  updateUser: jest.fn(),
  createUser: jest.fn(),
} as unknown as UsersService;

describe("GoogleStrategy", () => {
  let strategy: GoogleStrategy;
  const mockUser = {
    email: "test@example.com",
    firstName: "john",
    lastName: "doe",
    picture: "test-photo",
  };
  const mockUserWithId = {
    id: "1",
    ...mockUser,
  };
  const mockProvider = {
    providerId: "1",
    type: ProviderType.GOOGLE,
    emailVerified: false,
  };
  const tokenPayload = {
    sub: "1",
    iss: "test-iss",
    azp: "test-azp",
    aud: "test-aud",
    iat: 1,
    exp: 1,
    email: "test@example.com",
    email_verified: true,
    given_name: "test",
    family_name: "test",
    picture: "test-photo",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
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
      id: "1",
      emails: [{ value: "test@example.com", verified: true }],
      photos: [{ value: "test-photo" }],
      name: {
        givenName: "john",
        familyName: "doe",
      },
    } as Partial<Profile>;

    it("should validate successfully with matching session", async () => {
      (mockUsersService.getUser as jest.Mock).mockReturnValue({
        id: "1",
        email: "test@example.com",
        firstName: "john",
        lastName: "doe",
        picture: "test-photo",
      });

      const result = await strategy.validate("test-access-token", "test-refresh-token", {
        ...mockPayload,
        _json: tokenPayload,
      });

      expect(result).toEqual(mockUserWithId);
    });

    it("should validate successfully and update user adding a new provider", async () => {
      (mockUsersService.getUser as jest.Mock).mockReturnValueOnce(null);
      (mockUsersService.getUser as jest.Mock).mockReturnValueOnce(mockUserWithId);
      (mockUsersService.updateUser as jest.Mock).mockReturnValue(mockUserWithId);

      const result = await strategy.validate(
        "test-access-token",
        "test-refresh-token",
        mockPayload
      );

      expect(result).toEqual(mockUserWithId);
    });

    it("should throw ForbiddenException for missing id or email in payload", async () => {
      await expect(
        strategy.validate("test-access-token", "test-refresh-token", {
          emails: [{ value: "test@example.com", verified: true }],
        })
      ).rejects.toThrow(ForbiddenException);

      await expect(
        strategy.validate("test-access-token", "test-refresh-token", { id: "1" })
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw InternalServerErrorException when user is not found and could not be created", async () => {
      (mockUsersService.getUser as jest.Mock).mockReturnValue(null);
      (mockUsersService.createUser as jest.Mock).mockReturnValue(null);

      await expect(
        strategy.validate("test-access-token", "test-refresh-token", mockPayload)
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockUsersService.getUser).toHaveBeenCalledWith({
        email: "test@example.com",
        providers: { some: { providerId: "1" } },
      });
      expect(mockUsersService.getUser).toHaveBeenLastCalledWith({ email: "test@example.com" });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...mockUser,
        providers: {
          create: [mockProvider],
        },
      });
    });
  });
});
