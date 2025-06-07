import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppModule } from "./app.module";
import { AppService } from "./app.service";
import { DomainsModule } from "./domains/domains.module";

describe("AppModule", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(module).toBeDefined();
  });

  it("should provide required modules", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const domainsModule = module.get(DomainsModule);

    expect(domainsModule).toBeInstanceOf(DomainsModule);
  });

  it("should provide required controllers", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const appController = module.get(AppController);

    expect(appController).toBeInstanceOf(AppController);
  });

  it("should provide required services", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const appService = module.get(AppService);

    expect(appService).toBeInstanceOf(AppService);
  });
});
