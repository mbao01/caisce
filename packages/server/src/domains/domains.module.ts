import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@/cache/cache.module";
import { SessionModule } from "@/session/session.module";
import { SessionMiddleware } from "@/session/session.midleware";

@Module({
  imports: [AuthModule, CacheModule, ConfigModule.forRoot(), SessionModule, UsersModule],
})
export class DomainsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: "/auth/refresh", method: RequestMethod.GET });
  }
}
