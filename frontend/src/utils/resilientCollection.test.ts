import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";

import { fetchCollection } from "./resilientCollection";

describe("fetchCollection", () => {
  it("uses a cached empty collection when the network request fails", async () => {
    window.localStorage.setItem(
      "portfolio-collection-cache:projects",
      JSON.stringify([])
    );

    vi.spyOn(axios, "get").mockRejectedValue(
      new AxiosError(
        "Service unavailable",
        "ERR_BAD_RESPONSE",
        undefined,
        undefined,
        {
          data: {},
          status: 503,
          statusText: "Service Unavailable",
          headers: {},
          config: { headers: {} } as never,
        }
      )
    );

    const result = await fetchCollection({
      cacheKey: "projects",
      fallbackData: [{ id: "fallback" }],
      retries: 0,
      url: "/api/projects",
    });

    expect(result).toEqual({
      data: [],
      errorMessage: "The portfolio service is temporarily unavailable.",
      source: "cache",
    });
  });

  it("falls back to provided data when there is no usable cache", async () => {
    vi.spyOn(axios, "get").mockRejectedValue(
      new AxiosError("Timed out", "ECONNABORTED")
    );

    const result = await fetchCollection({
      cacheKey: "skills",
      fallbackData: [{ id: "local-skill" }],
      retries: 0,
      url: "/api/skills",
    });

    expect(result).toEqual({
      data: [{ id: "local-skill" }],
      errorMessage: "The request timed out before the portfolio service responded.",
      source: "fallback",
    });
  });
});
