import { performance } from 'perf_hooks';

/**
 * API Request Optimization Service
 * Handles rate limiting, caching, batch processing, and connection pooling
 */

interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  resetTime?: number;
}

interface BatchRequest {
  id: string;
  endpoint: string;
  payload: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class ApiOptimizationService {
  private cache: RequestCache = {};
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private batchQueues: Map<string, BatchRequest[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private connectionPools: Map<string, { active: number; max: number }> = new Map();

  constructor() {
    // Clean cache every 5 minutes
    setInterval(() => this.cleanCache(), 5 * 60 * 1000);
    
    // Reset rate limits every minute
    setInterval(() => this.resetRateLimits(), 60 * 1000);
  }

  /**
   * Cache management for API responses
   */
  public getCachedResponse(key: string): any | null {
    const cached = this.cache[key];
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[key];
      return null;
    }
    
    return cached.data;
  }

  public setCachedResponse(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
  }

  private cleanCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const cached = this.cache[key];
      if (now - cached.timestamp > cached.ttl) {
        delete this.cache[key];
      }
    });
  }

  /**
   * Rate limiting for API calls
   */
  public checkRateLimit(apiKey: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(apiKey);
    
    if (!limit || now >= limit.resetTime) {
      this.rateLimits.set(apiKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }
    
    if (limit.count >= config.maxRequests) {
      return false;
    }
    
    limit.count++;
    return true;
  }

  private resetRateLimits(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    Array.from(this.rateLimits.entries()).forEach(([key, limit]) => {
      if (now >= limit.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.rateLimits.delete(key));
  }

  /**
   * Batch processing for multiple API requests
   */
  public addToBatch(
    batchKey: string,
    request: Omit<BatchRequest, 'id'>,
    batchSize: number = 10,
    maxWaitMs: number = 1000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: `${Date.now()}-${Math.random()}`,
        ...request,
        resolve,
        reject
      };

      if (!this.batchQueues.has(batchKey)) {
        this.batchQueues.set(batchKey, []);
      }

      const queue = this.batchQueues.get(batchKey)!;
      queue.push(batchRequest);

      // Process batch if it reaches the size limit
      if (queue.length >= batchSize) {
        this.processBatch(batchKey);
        return;
      }

      // Set timer to process batch after maxWaitMs
      if (!this.batchTimers.has(batchKey)) {
        const timer = setTimeout(() => {
          this.processBatch(batchKey);
        }, maxWaitMs);
        this.batchTimers.set(batchKey, timer);
      }
    });
  }

  private async processBatch(batchKey: string): Promise<void> {
    const queue = this.batchQueues.get(batchKey);
    if (!queue || queue.length === 0) return;

    // Clear timer and queue
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }
    this.batchQueues.set(batchKey, []);

    try {
      // Process all requests in the batch
      const results = await Promise.allSettled(
        queue.map(request => this.executeRequest(request))
      );

      // Resolve individual promises
      results.forEach((result, index) => {
        const request = queue[index];
        if (result.status === 'fulfilled') {
          request.resolve(result.value);
        } else {
          request.reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all requests if batch processing fails
      queue.forEach(request => request.reject(error));
    }
  }

  private async executeRequest(request: BatchRequest): Promise<any> {
    // This would be implemented based on the specific API endpoint
    console.log(`Executing batched request to ${request.endpoint}`);
    return request.payload;
  }

  /**
   * Connection pool management
   */
  public acquireConnection(poolName: string, maxConnections: number = 5): boolean {
    if (!this.connectionPools.has(poolName)) {
      this.connectionPools.set(poolName, { active: 0, max: maxConnections });
    }

    const pool = this.connectionPools.get(poolName)!;
    if (pool.active >= pool.max) {
      return false; // No available connections
    }

    pool.active++;
    return true;
  }

  public releaseConnection(poolName: string): void {
    const pool = this.connectionPools.get(poolName);
    if (pool && pool.active > 0) {
      pool.active--;
    }
  }

  /**
   * Performance monitoring
   */
  public async measureApiCall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<{ result: T; duration: number; success: boolean }> {
    const startTime = performance.now();
    let success = false;
    
    try {
      const result = await apiCall();
      success = true;
      const duration = performance.now() - startTime;
      
      console.log(`API Call [${apiName}] completed in ${duration.toFixed(2)}ms`);
      
      return { result, duration, success };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API Call [${apiName}] failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000,
    maxDelayMs: number = 10000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break; // Final attempt failed
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt),
          maxDelayMs
        );
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Intelligent caching based on API endpoint characteristics
   */
  public getCacheKey(endpoint: string, params: any = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${endpoint}?${sortedParams}`;
  }

  public getCacheTTL(endpoint: string): number {
    // Different TTL based on data type
    if (endpoint.includes('/jobs')) return 5 * 60 * 1000; // 5 minutes
    if (endpoint.includes('/applicants')) return 2 * 60 * 1000; // 2 minutes
    if (endpoint.includes('/interviews')) return 1 * 60 * 1000; // 1 minute
    if (endpoint.includes('/analytics')) return 10 * 60 * 1000; // 10 minutes
    return 30 * 1000; // 30 seconds default
  }

  /**
   * Priority queue for API requests
   */
  private priorityQueue: Array<{ priority: number; request: () => Promise<any>; resolve: any; reject: any }> = [];
  private processingQueue = false;

  public async addPriorityRequest<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.priorityQueue.push({ priority, request, resolve, reject });
      this.priorityQueue.sort((a, b) => b.priority - a.priority);
      
      if (!this.processingQueue) {
        this.processPriorityQueue();
      }
    });
  }

  private async processPriorityQueue(): Promise<void> {
    this.processingQueue = true;
    
    while (this.priorityQueue.length > 0) {
      const { request, resolve, reject } = this.priorityQueue.shift()!;
      
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processingQueue = false;
  }

  /**
   * Circuit breaker pattern for failing APIs
   */
  private circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }>();

  public async callWithCircuitBreaker<T>(
    apiName: string,
    operation: () => Promise<T>,
    failureThreshold: number = 5,
    timeoutMs: number = 60000
  ): Promise<T> {
    let breaker = this.circuitBreakers.get(apiName);
    
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, state: 'closed' };
      this.circuitBreakers.set(apiName, breaker);
    }

    const now = Date.now();

    // Check circuit breaker state
    if (breaker.state === 'open') {
      if (now - breaker.lastFailure > timeoutMs) {
        breaker.state = 'half-open';
      } else {
        throw new Error(`Circuit breaker is open for ${apiName}`);
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
      }
      breaker.failures = 0;
      
      return result;
    } catch (error) {
      breaker.failures++;
      breaker.lastFailure = now;
      
      if (breaker.failures >= failureThreshold) {
        breaker.state = 'open';
        console.error(`Circuit breaker opened for ${apiName} after ${breaker.failures} failures`);
      }
      
      throw error;
    }
  }
}

export const apiOptimizationService = new ApiOptimizationService();