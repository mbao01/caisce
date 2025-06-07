import { SessionModule } from "@/session/session.module";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";
import { JwtAccessGuard } from "./guards/jwt-access.guard";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

describe("AuthModule", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    expect(module).toBeDefined();
  });

  it("should provide required modules", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const configModule = module.get(ConfigModule);
    const jwtModule = module.get(JwtModule);
    const passportModule = module.get(PassportModule);
    const sessionModule = module.get(SessionModule);
    const usersModule = module.get(UsersModule);

    expect(configModule).toBeInstanceOf(ConfigModule);
    expect(jwtModule).toBeInstanceOf(JwtModule);
    expect(passportModule).toBeInstanceOf(PassportModule);
    expect(sessionModule).toBeInstanceOf(SessionModule);
    expect(usersModule).toBeInstanceOf(UsersModule);
  });

  it("should provide required services", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const authService = module.get(AuthService);
    expect(authService).toBeInstanceOf(AuthService);
  });

  it("should provide required controllers", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const authController = module.get(AuthController);
    expect(authController).toBeInstanceOf(AuthController);
  });

  it("should provide required guards", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const localAuthGuard = module.get(LocalAuthGuard);
    const jwtAccessGuard = module.get(JwtAccessGuard);
    const jwtRefreshGuard = module.get(JwtRefreshGuard);

    expect(localAuthGuard).toBeInstanceOf(LocalAuthGuard);
    expect(jwtAccessGuard).toBeInstanceOf(JwtAccessGuard);
    expect(jwtRefreshGuard).toBeInstanceOf(JwtRefreshGuard);
  });

  it("should provide required strategies", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    const localStrategy = module.get(LocalStrategy);
    const jwtAccessStrategy = module.get(JwtAccessStrategy);
    const jwtRefreshStrategy = module.get(JwtRefreshStrategy);

    expect(localStrategy).toBeInstanceOf(LocalStrategy);
    expect(jwtAccessStrategy).toBeInstanceOf(JwtAccessStrategy);
    expect(jwtRefreshStrategy).toBeInstanceOf(JwtRefreshStrategy);
  });
});
