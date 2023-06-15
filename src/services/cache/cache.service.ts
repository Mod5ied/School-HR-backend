import { Injectable, Inject, CACHE_MANAGER, CacheStore } from "@nestjs/common";

// intitle: webcamxp 5
// filetype:env "DB_PASSWORD"
// open-source-intelligence - OSINT

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore) { }

    public async setCache(key: string, value: any, ttl?: number) {
        try {
            return await this.cacheManager.set(key, JSON.stringify(value), { ttl })
        } catch (error) {
            console.log('Error setting cache: ', error)
            /* Log the error! Then try setting cache again. */
        }
    }

    public async getCached(key: string) {
        try {
            const cacheData = await this.cacheManager.get<string>(key)
            if (cacheData) return JSON.parse(cacheData);
            //proceed to the next line on the caller.
        } catch (error) {
            console.log('Error getting cached: ', error)
            /* Log the error! Then try setting cache again. */
        }
    }

    public async delCached(key: string) {
        try {
            await this.cacheManager.del(key)
        } catch (error) {
            console.log('Error deleting cached: ', error)
            return { err: true }
        }
    }
}