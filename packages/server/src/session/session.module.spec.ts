import { CacheModule } from "@/cache/cache.module";
import { Test, TestingModule } from "@nestjs/testing";
import { SessionModule } from "./session.module";
import { SessionService } from "./session.service";

describe("SessionModule", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionModule],
    }).compile();
    expect(module).toBeDefined();
  });

  it("should provide required modules", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionModule],
    }).compile();

    const cacheModule = module.get(CacheModule);

    expect(cacheModule).toBeInstanceOf(CacheModule);
  });

  it("should provide required services", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SessionModule],
    }).compile();

    const sessionService = module.get(SessionService);

    expect(sessionService).toBeInstanceOf(SessionService);
  });
});
