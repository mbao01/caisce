import { CacheModule } from "@nestjs/cache-manager";
import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("get", () => {
    it("should return cached value", async () => {
      const key = "test-key";
      const value = "test-value";
      await service.set(key, value);

      const result = await service.get(key);
      expect(result).toBe(value);
    });

    it("should return null for non-existent key", async () => {
      const result = await service.get("non-existent-key");
      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should set value with default ttl", async () => {
      const key = "test-key";
      const value = "test-value";
      await service.set(key, value);

      const result = await service.get(key);
      expect(result).toBe(value);
    });

    it("should set value with custom ttl", async () => {
      const key = "test-key";
      const value = "test-value";
      const ttl = 1000;
      await service.set(key, value, ttl);

      const result = await service.get(key);
      expect(result).toBe(value);
    });
  });

  describe("del", () => {
    it("should delete existing key", async () => {
      const key = "test-key";
      const value = "test-value";
      await service.set(key, value);

      await service.del(key);
      const result = await service.get(key);
      expect(result).toBeNull();
    });

    it("should not throw for non-existent key", async () => {
      await expect(service.del("non-existent-key")).resolves.not.toThrow();
    });
  });

  describe("ttl", () => {
    it("should return ttl for existing key", async () => {
      const key = "test-key";
      const value = "test-value";
      const ttl = 1000;
      await service.set(key, value, ttl);

      const result = await service.ttl(key);
      expect(result).toBeGreaterThan(0);
    });

    it("should return null for non-existent key", async () => {
      const result = await service.ttl("non-existent-key");
      expect(result).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all keys", async () => {
      const key = "test-key";
      const value = "test-value";
      await service.set(key, value);

      await service.clear();

      const result = await service.get(key);
      expect(result).toBeNull();
    });
  });
});
