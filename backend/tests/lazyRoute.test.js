import assert from "node:assert/strict";
import { test } from "node:test";
import { lazyRoute } from "../utils/lazyRoute.js";
import {
  createMockRequest,
  createMockResponse,
} from "./helpers/mockHttp.js";

test("loads the router once and reuses it across requests", async () => {
  let loadCount = 0;
  const handler = (req, res) => {
    res.status(200).json({ ok: true });
  };

  const route = lazyRoute(async () => {
    loadCount += 1;
    return { default: handler };
  });

  const firstRes = createMockResponse();
  await route(createMockRequest(), firstRes, () => {});

  const secondRes = createMockResponse();
  await route(createMockRequest(), secondRes, () => {});

  assert.equal(loadCount, 1);
  assert.deepEqual(firstRes.body, { ok: true });
  assert.deepEqual(secondRes.body, { ok: true });
});

test("retries loading after an initial import failure", async () => {
  let attempts = 0;
  const route = lazyRoute(async () => {
    attempts += 1;

    if (attempts === 1) {
      throw new Error("temporary import failure");
    }

    return {
      default: (req, res) => {
        res.status(200).json({ recovered: true });
      },
    };
  });

  let firstError = null;
  await route(createMockRequest(), createMockResponse(), (error) => {
    firstError = error;
  });

  const secondRes = createMockResponse();
  await route(createMockRequest(), secondRes, () => {});

  assert.equal(firstError?.message, "temporary import failure");
  assert.equal(attempts, 2);
  assert.deepEqual(secondRes.body, { recovered: true });
});
