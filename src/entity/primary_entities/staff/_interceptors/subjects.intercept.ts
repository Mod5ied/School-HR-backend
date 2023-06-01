import { Injectable, CacheInterceptor, ExecutionContext, CACHE_KEY_METADATA } from '@nestjs/common';
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected cachedRoutes = new Map();

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    
    if (!request) return undefined;
    const { httpAdapter } = this.httpAdapterHost;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
    
    if (!isHttpApp || cacheMetadata) return cacheMetadata;
    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    
    if (!isGetRequest) {
      setTimeout(async () => {
        for (const values of this.cachedRoutes.values()) {
          for (const value of values) {
            await this.cacheManager.del(value);
          }
        }
      }, 0);
      return undefined;
    }
    const key = httpAdapter.getRequestUrl(request).split('?')[0];
    
    if (this.cachedRoutes.has(key) && !this.cachedRoutes.get(key).includes(httpAdapter.getRequestUrl(request))) {
      this.cachedRoutes.set(key, [...this.cachedRoutes.get(key), httpAdapter.getRequestUrl(request)]);
      return httpAdapter.getRequestUrl(request);
    }
    this.cachedRoutes.set(key, [httpAdapter.getRequestUrl(request)]);
    return httpAdapter.getRequestUrl(request);
  }
}
