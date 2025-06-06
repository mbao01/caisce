// session/session.module.ts
import { Module } from "@nestjs/common";
import { SessionService } from "./session.service";
import { CacheModule } from "@/cache/cache.module";

@Module({
  imports: [CacheModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
