import { SessionService } from "@/session/session.service";
import { ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Request } from "express";
import { Profile } from "passport-google-oauth20";
import { GoogleStrategy } from "./google-oauth.strategy";

const mockConfigService = {
  get: jest.fn().mockReturnValue("test-secret"),
} as unknown as ConfigService;

const mockSessionService = {
  getSessionId: jest.fn(),
} as unknown as SessionService;

describe("GoogleStrategy", () => {
  let strategy: GoogleStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SessionService, useValue: mockSessionService },
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
        givenName: "test",
        familyName: "test",
      },
    } as Partial<Profile>;

    it("should validate successfully with matching session", async () => {
      (mockSessionService.getSessionId as jest.Mock).mockReturnValue("test-session");

      const result = await strategy.validate("test-access-token", "test-refresh-token", {
        ...mockPayload,
        _json: {
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
        },
      });

      expect(result).toEqual({
        id: "1",
        email: "test@example.com",
      });
    });

    it("should throw ForbiddenException for missing session", async () => {
      await expect(
        strategy.validate("test-access-token", "test-refresh-token", {})
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException for mismatched session", async () => {
      await expect(
        strategy.validate("test-access-token", "test-refresh-token", mockPayload)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
