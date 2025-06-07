import { CacheModule } from "@/cache/cache.module";
import { SessionMiddleware } from "@/session/session.midleware";
import { SessionModule } from "@/session/session.module";
import { MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "./auth/auth.module";
import { DomainsModule } from "./domains.module";
import { UsersModule } from "./users/users.module";

describe("DomainsModule", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DomainsModule],
    }).compile();
    expect(module).toBeDefined();
  });

  it("should provide required modules", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DomainsModule],
    }).compile();

    const authModule = module.get(AuthModule);
    const cacheModule = module.get(CacheModule);
    const configModule = module.get(ConfigModule);
    const sessionModule = module.get(SessionModule);
    const usersModule = module.get(UsersModule);

    expect(authModule).toBeInstanceOf(AuthModule);
    expect(cacheModule).toBeInstanceOf(CacheModule);
    expect(configModule).toBeInstanceOf(ConfigModule);
    expect(sessionModule).toBeInstanceOf(SessionModule);
    expect(usersModule).toBeInstanceOf(UsersModule);
  });

  describe("DomainsModule (configure)", () => {
    it("should apply middleware correctly", async () => {
      const apply = jest.fn().mockReturnThis();
      const forRoutes = jest.fn();
      const consumer: MiddlewareConsumer = { apply, forRoutes } as any;

      const testingModule = await Test.createTestingModule({
        providers: [DomainsModule],
      }).compile();

      const moduleInstance = new DomainsModule();
      moduleInstance.configure(consumer);

      expect(apply).toHaveBeenCalledWith(SessionMiddleware);
      expect(forRoutes).toHaveBeenCalledWith({
        path: "/auth/refresh",
        method: RequestMethod.GET,
      });
    });
  });
});
