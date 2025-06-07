import { PrismaService } from "@/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersModule } from "./users.module";
import { UsersService } from "./users.service";

describe("UsersModule", () => {
  it("should be defined", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();
    expect(module).toBeDefined();
  });

  it("should provide required services", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useClass(PrismaService)
      .compile();

    const usersService = module.get(UsersService);

    expect(usersService).toBeInstanceOf(UsersService);
  });
});
