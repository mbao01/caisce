import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";

@Module({
  imports: [
    AuthModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        isGlobal: true,
        ttl: configService.get("CACHE_TTL"),
        stores: [createKeyv(configService.get("REDIS_URL"))],
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    UsersModule,
  ],
})
export class DomainsModule {}
