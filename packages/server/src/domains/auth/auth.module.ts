import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SessionModule } from "@/session/session.module";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>("JWT_SECRET"),
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
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
