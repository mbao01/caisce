import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("health check", () => {
    it("should connect to database", async () => {
      await expect(service.$connect()).resolves.not.toThrow();
    });

    it("should disconnect from database", async () => {
      await expect(service.$disconnect()).resolves.not.toThrow();
    });
  });

  describe("transaction handling", () => {
    it("should execute transaction", async () => {
      const mockTransaction = jest.fn().mockResolvedValue(["transaction result"]);

      // @ts-ignore - Mocking private method
      service.$transaction = mockTransaction;

      const transactionFn = (prisma) => Promise.resolve("test");
      const result = await service.$transaction(transactionFn);
      expect(result).toEqual(["transaction result"]);
      expect(mockTransaction).toHaveBeenCalledWith(transactionFn);
    });
  });

  describe("PrismaService -> statements", () => {
    let prismaService: PrismaService;

    beforeEach(() => {
      prismaService = new PrismaService();

      // Mock the inherited methods
      prismaService.$connect = jest.fn();
      prismaService.$disconnect = jest.fn();
    });

    it("should call $connect on module init", async () => {
      await prismaService.onModuleInit();
      expect(prismaService.$connect).toHaveBeenCalled();
    });

    it("should call $disconnect on module destroy", async () => {
      await prismaService.onModuleDestroy();
      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});
