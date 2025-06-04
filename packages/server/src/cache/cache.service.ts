import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key: string) {
    console.log(`GET ${key} from REDIS`);
    return await this.cache.get(key);
  }

  async set<T>(key: string, value: T) {
    console.log(`SET ${key} in REDIS`);
    await this.cache.set(key, value);
  }

  async del(key: string) {
    console.log(`DEL ${key} from REDIS`);
    await this.cache.del(key);
  }

  async clear() {
    console.log(`CLEAR REDIS`);
    await this.cache.clear();
  }
}
