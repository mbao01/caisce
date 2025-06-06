import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule as CacheManagerModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { CacheService } from "./cache.service";

@Module({
  imports: [
    CacheManagerModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: Number(configService.get("REDIS_CACHE_TTL")),
        stores: [createKeyv(configService.get("REDIS_URL"))],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
