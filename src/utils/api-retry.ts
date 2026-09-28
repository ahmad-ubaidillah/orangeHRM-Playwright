import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * The public OrangeHRM demo host intermittently drops connections mid-request
 * ("socket hang up", ECONNRESET). Those are transport failures, not test
 * failures, so they are worth one silent retry. Anything that produced a real
 * HTTP response -- including a 4xx/5xx assertion failure -- is returned as-is
 * so real regressions stay visible.
 */
const TRANSIENT_NETWORK_ERRORS = [
  'socket hang up',
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  'socket closed',
];

const isTransient = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT_NETWORK_ERRORS.some((pattern) => message.includes(pattern));
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Performs an API call, retrying once on a transport-level failure.
 *
 * Retries only the request that failed, so a create/delete sequence is not
 * replayed from the start and cannot produce duplicate records.
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  { attempts = 2, backoffMs = 2000 }: { attempts?: number; backoffMs?: number } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransient(error) || attempt === attempts) throw error;
      lastError = error;
      await delay(backoffMs * attempt);
    }
  }

  throw lastError;
}

type RequestOptions = Parameters<APIRequestContext['put']>[1];

/** PUT/POST/DELETE wrapper that rides on the network-retry helper. */
export const requestWithRetry = (
  request: APIRequestContext,
  method: 'put' | 'post' | 'delete' | 'get',
  url: string,
  options: RequestOptions = {},
): Promise<APIResponse> => withNetworkRetry(() => request[method](url, options));
