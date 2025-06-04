import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@/cache/cache.module";

@Module({
  imports: [AuthModule, CacheModule, ConfigModule.forRoot(), UsersModule],
})
export class DomainsModule {}
