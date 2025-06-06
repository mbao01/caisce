import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SessionModule } from "@/session/session.module";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_ACCESS_SECRET"),
          signOptions: { expiresIn: configService.get<string>("JWT_ACCESS_TOKEN_TTL") },
        };
      },
      inject: [ConfigService],
    }),
    PassportModule,
    SessionModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
