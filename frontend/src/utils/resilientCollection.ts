import axios from "axios";

type CollectionSource = "network" | "cache" | "fallback";

interface FetchCollectionOptions<TInput, TOutput> {
  cacheKey: string;
  fallbackData?: TOutput[];
  mapItem?: (item: TInput) => TOutput;
  retries?: number;
  url: string;
}

interface FetchCollectionResult<T> {
  data: T[];
  errorMessage: string | null;
  source: CollectionSource;
}

const CACHE_PREFIX = "portfolio-collection-cache:";
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 700;

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const getCacheKey = (cacheKey: string) => `${CACHE_PREFIX}${cacheKey}`;

const readCollectionCache = <T>(cacheKey: string): T[] => {
  if (typeof window === "undefined") return [];

  try {
    const cached = window.localStorage.getItem(getCacheKey(cacheKey));
    if (!cached) return [];

    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCollectionCache = <T>(cacheKey: string, value: T[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(getCacheKey(cacheKey), JSON.stringify(value));
  } catch {
    // Ignore storage quota and privacy mode failures.
  }
};

const isTransientRequestError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;

  return error.response.status === 429 || error.response.status >= 500;
};

const getRequestErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return "The section could not be loaded right now.";
  }

  if (error.code === "ECONNABORTED") {
    return "The request timed out before the portfolio service responded.";
  }

  if (!error.response) {
    return "The portfolio service could not be reached.";
  }

  if (error.response.status === 503) {
    return "The portfolio service is temporarily unavailable.";
  }

  if (error.response.status === 404) {
    return "The portfolio endpoint is not available.";
  }

  return `The portfolio service returned ${error.response.status}.`;
};

const requestCollection = async <T>(url: string, retries: number) => {
  let attempt = 0;

  while (true) {
    try {
      return await axios.get<T[]>(url, { timeout: REQUEST_TIMEOUT_MS });
    } catch (error) {
      if (attempt >= retries || !isTransientRequestError(error)) {
        throw error;
      }

      attempt += 1;
      await delay(RETRY_DELAY_MS * attempt);
    }
  }
};

const getCollectionRows = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  throw new Error("Expected collection response to be an array.");
};

export const fetchCollection = async <TInput, TOutput = TInput>({
  cacheKey,
  fallbackData = [],
  mapItem,
  retries = 2,
  url,
}: FetchCollectionOptions<TInput, TOutput>): Promise<FetchCollectionResult<TOutput>> => {
  try {
    const response = await requestCollection<TInput>(url, retries);
    const rows = getCollectionRows<TInput>(response.data);
    const data = mapItem
      ? rows.map((item) => mapItem(item))
      : (rows as TOutput[]);

    writeCollectionCache(cacheKey, data);

    return {
      data,
      errorMessage: null,
      source: "network",
    };
  } catch (error) {
    const cachedData = readCollectionCache<TOutput>(cacheKey);

    if (cachedData.length > 0) {
      return {
        data: cachedData,
        errorMessage: getRequestErrorMessage(error),
        source: "cache",
      };
    }

    return {
      data: fallbackData,
      errorMessage: getRequestErrorMessage(error),
      source: "fallback",
    };
  }
};

export type { CollectionSource, FetchCollectionResult };
