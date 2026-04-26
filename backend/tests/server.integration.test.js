import assert from "node:assert/strict";
import crypto from "node:crypto";
import { after, afterEach, beforeEach, test } from "node:test";
import Project from "../models/Project.js";
import Experience from "../models/Experience.js";
import Skill from "../models/Skill.js";
import {
  __resetChatControllerStateForTests,
  __setOpenAIClientForTests,
} from "../controllers/chatController.js";
import { dispatchHttpRequest } from "./helpers/httpServer.js";

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  ADMIN_API_KEY_ID: process.env.ADMIN_API_KEY_ID,
  ADMIN_API_SECRET: process.env.ADMIN_API_SECRET,
  ADMIN_API_SECONDARY_KEY_ID: process.env.ADMIN_API_SECONDARY_KEY_ID,
  ADMIN_API_SECONDARY_SECRET: process.env.ADMIN_API_SECONDARY_SECRET,
  ADMIN_API_SIGNATURE_TTL_SECONDS: process.env.ADMIN_API_SIGNATURE_TTL_SECONDS,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

process.env.NODE_ENV = "test";
process.env.VERCEL = "0";
process.env.ADMIN_API_KEY_ID = "integration-admin-primary";
process.env.ADMIN_API_SECRET = "integration-admin-primary-secret";
process.env.ADMIN_API_SECONDARY_KEY_ID = "";
process.env.ADMIN_API_SECONDARY_SECRET = "";
process.env.ADMIN_API_SIGNATURE_TTL_SECONDS = "300";
process.env.OPENAI_API_KEY = "test-openai-key";

const { createApp } = await import("../server.js");

const originalFinders = {
  projectFind: Project.find,
  experienceFind: Experience.find,
  skillFind: Skill.find,
};

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const createRequestPayload = (body) =>
  body === undefined
    ? null
    : Buffer.isBuffer(body)
      ? body
      : Buffer.from(typeof body === "string" ? body : JSON.stringify(body), "utf8");

const createAdminAuthorizationHeader = ({
  body,
  contentLength,
  contentType,
  keyId = process.env.ADMIN_API_KEY_ID,
  method = "POST",
  path,
  secret = process.env.ADMIN_API_SECRET,
  timestamp = Math.floor(Date.now() / 1000),
} = {}) => {
  const payload = createRequestPayload(body);
  const normalizedContentType = contentType ?? (payload ? "application/json" : "");
  const normalizedContentLength =
    contentLength ?? (payload ? String(payload.length) : "");
  const signingPayload = [
    method.toUpperCase(),
    path,
    String(timestamp),
    normalizedContentType,
    normalizedContentLength,
  ].join("\n");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingPayload)
    .digest("hex");

  return `AdminHMAC ${keyId}:${timestamp}:${signature}`;
};

const createMultipartFormData = (fields = [], files = []) => {
  const boundary = `----portfolio-test-${Date.now()}`;
  const chunks = [];

  for (const [name, value] of fields) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
          `${value}\r\n`,
        "utf8"
      )
    );
  }

  for (const file of files) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\n` +
          `Content-Type: ${file.contentType}\r\n\r\n`,
        "utf8"
      )
    );
    chunks.push(Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8"));
    chunks.push(Buffer.from("\r\n", "utf8"));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`, "utf8"));

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
};

const createQueryResult = (value) => ({
  sort() {
    return this;
  },
  select() {
    return this;
  },
  lean: async () => cloneData(value),
});

const setReadModelFixtures = ({
  projects = [],
  experiences = [],
  skills = [],
} = {}) => {
  Project.find = () => createQueryResult(projects);
  Experience.find = () => createQueryResult(experiences);
  Skill.find = () => createQueryResult(skills);
};

const createDbTracker = ({ shouldFail = false } = {}) => {
  const calls = [];

  return {
    calls,
    connectDBImpl: async () => {
      calls.push(Date.now());
      if (shouldFail) {
        throw new Error("db down");
      }
    },
  };
};

beforeEach(() => {
  process.env.ADMIN_API_KEY_ID = "integration-admin-primary";
  process.env.ADMIN_API_SECRET = "integration-admin-primary-secret";
  process.env.ADMIN_API_SECONDARY_KEY_ID = "";
  process.env.ADMIN_API_SECONDARY_SECRET = "";
  process.env.ADMIN_API_SIGNATURE_TTL_SECONDS = "300";
  process.env.OPENAI_API_KEY = "test-openai-key";
  Project.find = originalFinders.projectFind;
  Experience.find = originalFinders.experienceFind;
  Skill.find = originalFinders.skillFind;
  __resetChatControllerStateForTests();
});

afterEach(() => {
  Project.find = originalFinders.projectFind;
  Experience.find = originalFinders.experienceFind;
  Skill.find = originalFinders.skillFind;
  __resetChatControllerStateForTests();
});

after(() => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.VERCEL = originalEnv.VERCEL;
  process.env.ADMIN_API_KEY_ID = originalEnv.ADMIN_API_KEY_ID;
  process.env.ADMIN_API_SECRET = originalEnv.ADMIN_API_SECRET;
  process.env.ADMIN_API_SECONDARY_KEY_ID = originalEnv.ADMIN_API_SECONDARY_KEY_ID;
  process.env.ADMIN_API_SECONDARY_SECRET = originalEnv.ADMIN_API_SECONDARY_SECRET;
  process.env.ADMIN_API_SIGNATURE_TTL_SECONDS =
    originalEnv.ADMIN_API_SIGNATURE_TTL_SECONDS;
  process.env.OPENAI_API_KEY = originalEnv.OPENAI_API_KEY;
});

test("health and root routes bypass the API DB gate", async () => {
  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const health = await dispatchHttpRequest(app, { path: "/health" });
  const root = await dispatchHttpRequest(app, { path: "/" });

  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { status: "ok" });
  assert.equal(root.status, 200);
  assert.equal(root.text, "Backend working fine");
  assert.equal(db.calls.length, 0);
});

test("rate limiting respects forwarded client IPs behind the Vercel proxy", async () => {
  const previousVercel = process.env.VERCEL;
  process.env.VERCEL = "1";

  try {
    const db = createDbTracker();
    const app = createApp({
      connectDBImpl: db.connectDBImpl,
      rateLimitOptions: {
        max: 1,
        windowMs: 15 * 60 * 1000,
      },
      warmupOnBoot: false,
    });

    const firstClientRequest = await dispatchHttpRequest(app, {
      headers: { "x-forwarded-for": "203.0.113.10" },
      path: "/health",
    });
    const repeatedClientRequest = await dispatchHttpRequest(app, {
      headers: { "x-forwarded-for": "203.0.113.10" },
      path: "/health",
    });
    const secondClientRequest = await dispatchHttpRequest(app, {
      headers: { "x-forwarded-for": "203.0.113.11" },
      path: "/health",
    });

    assert.equal(firstClientRequest.status, 200);
    assert.equal(repeatedClientRequest.status, 429);
    assert.equal(secondClientRequest.status, 200);
    assert.equal(db.calls.length, 0);
  } finally {
    process.env.VERCEL = previousVercel;
  }
});

test("mounted public read routes return data and cache headers", async () => {
  setReadModelFixtures({
    projects: [
      {
        title: "Portfolio",
        image: "img.png",
        technologies: ["React"],
        githubUrl: "https://github.com/example/portfolio",
        liveUrl: "https://example.com",
        category: "web",
      },
    ],
    experiences: [
      {
        title: "Engineer",
        company: "Example Co",
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: null,
        current: true,
        description: ["Built features"],
        technologies: ["Node.js"],
      },
    ],
    skills: [{ name: "Node.js", icon: "node" }],
  });

  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const [projects, experiences, skills] = await Promise.all([
    dispatchHttpRequest(app, { path: "/api/projects" }),
    dispatchHttpRequest(app, { path: "/api/experiences" }),
    dispatchHttpRequest(app, { path: "/api/skills" }),
  ]);

  assert.equal(projects.status, 200);
  assert.equal(experiences.status, 200);
  assert.equal(skills.status, 200);
  assert.equal(projects.body[0].title, "Portfolio");
  assert.equal(experiences.body[0].company, "Example Co");
  assert.equal(skills.body[0].name, "Node.js");
  assert.equal(
    projects.headers["cache-control"],
    "public, max-age=0, must-revalidate"
  );
  assert.equal(
    projects.headers["cdn-cache-control"],
    "public, s-maxage=300, stale-while-revalidate=60"
  );
  assert.equal(
    experiences.headers["vercel-cdn-cache-control"],
    "public, s-maxage=300, stale-while-revalidate=60"
  );
  assert.equal(
    skills.headers["cdn-cache-control"],
    "public, s-maxage=300, stale-while-revalidate=60"
  );
  assert.equal(db.calls.length, 3);
});

test("mounted chat routes expose public history endpoints and validation errors", async () => {
  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const rootHistory = await dispatchHttpRequest(app, { path: "/api/chat" });
  const explicitHistory = await dispatchHttpRequest(app, {
    path: "/api/chat/history",
  });
  const invalidChatPost = await dispatchHttpRequest(app, {
    body: {},
    method: "POST",
    path: "/api/chat",
  });

  assert.equal(rootHistory.status, 200);
  assert.equal(explicitHistory.status, 200);
  assert.deepEqual(rootHistory.body, {
    message: "Chat history feature not implemented yet",
    history: [],
  });
  assert.deepEqual(explicitHistory.body, rootHistory.body);
  assert.equal(invalidChatPost.status, 400);
  assert.match(invalidChatPost.body.error, /required/i);
  assert.equal(db.calls.length, 0);
});

test("chat POST returns an assistant response through the mounted stack", async () => {
  setReadModelFixtures({
    projects: [
      {
        title: "Cold Start Optimizer",
        description: "Cuts warmup latency",
        technologies: ["Node.js", "Vercel"],
        category: "backend",
        githubUrl: "https://github.com/example/cold-start-optimizer",
        liveUrl: "https://example.com/cold-start",
      },
    ],
    experiences: [
      {
        title: "Backend Engineer",
        company: "Example Co",
        location: "Remote",
        startDate: "2023-01-01T00:00:00.000Z",
        endDate: null,
        current: true,
        description: ["Reduced latency"],
        technologies: ["Node.js"],
      },
    ],
    skills: [{ name: "Node.js", category: "Backend", proficiency: 90 }],
  });

  let openAIPayload = null;
  __setOpenAIClientForTests({
    chat: {
      completions: {
        create: async (payload) => {
          openAIPayload = payload;
          return {
            choices: [
              {
                message: {
                  content: "Prashant focuses on backend performance work.",
                },
              },
            ],
          };
        },
      },
    },
  });

  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const result = await dispatchHttpRequest(app, {
    body: {
      message: "Tell me about Prashant's backend experience",
    },
    method: "POST",
    path: "/api/chat",
  });

  assert.equal(result.status, 200);
  assert.equal(
    result.body.response,
    "Prashant focuses on backend performance work."
  );
  assert.equal(db.calls.length, 1);
  assert.equal(openAIPayload.model, "gpt-3.5-turbo");
  assert.equal(openAIPayload.messages[1].role, "user");
  assert.match(openAIPayload.messages[1].content, /backend experience/i);
});

test("admin-protected mounted write routes reject missing or unconfigured auth", async () => {
  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const unauthorizedSkill = await dispatchHttpRequest(app, {
    body: { name: "Node.js", icon: "node" },
    method: "POST",
    path: "/api/skills",
  });
  const unauthorizedExperience = await dispatchHttpRequest(app, {
    body: { title: "Engineer" },
    method: "POST",
    path: "/api/experiences",
  });
  const unauthorizedProject = await dispatchHttpRequest(app, {
    body: { title: "Portfolio" },
    method: "POST",
    path: "/api/projects",
  });

  assert.equal(unauthorizedSkill.status, 401);
  assert.equal(unauthorizedExperience.status, 401);
  assert.equal(unauthorizedProject.status, 401);
  assert.deepEqual(unauthorizedSkill.body, { message: "Unauthorized" });

  process.env.ADMIN_API_SECRET = "";
  const unavailableAdmin = await dispatchHttpRequest(app, {
    body: { name: "Node.js", icon: "node" },
    method: "POST",
    path: "/api/skills",
  });

  assert.equal(unavailableAdmin.status, 503);
  assert.deepEqual(unavailableAdmin.body, {
    message: "Admin operations are temporarily unavailable.",
  });
  assert.equal(db.calls.length, 0);
});

test("invalid project uploads return 400 before opening a DB connection", async () => {
  const db = createDbTracker();
  const app = createApp({ connectDBImpl: db.connectDBImpl, warmupOnBoot: false });
  const multipart = createMultipartFormData(
    [
      ["title", "Portfolio"],
      ["description", "Invalid image upload"],
      ["technologies", "React"],
      ["githubUrl", "https://github.com/example/portfolio"],
      ["liveUrl", "https://example.com"],
      ["category", "web"],
    ],
    [
      {
        fieldName: "image",
        filename: "notes.txt",
        contentType: "text/plain",
        content: "not an image",
      },
    ]
  );

  const response = await dispatchHttpRequest(app, {
    body: multipart.body,
    headers: {
      authorization: createAdminAuthorizationHeader({
        body: multipart.body,
        contentType: multipart.contentType,
        method: "POST",
        path: "/api/projects",
      }),
      "content-type": multipart.contentType,
    },
    method: "POST",
    path: "/api/projects",
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: "Only image uploads are allowed for project images.",
  });
  assert.equal(db.calls.length, 0);
});

test("API DB failures and unknown mounted routes return the expected status codes", async () => {
  const failingDb = createDbTracker({ shouldFail: true });
  const failingApp = createApp({
    connectDBImpl: failingDb.connectDBImpl,
    warmupOnBoot: false,
  });
  const unavailable = await dispatchHttpRequest(failingApp, {
    path: "/api/projects",
  });

  assert.equal(unavailable.status, 503);
  assert.deepEqual(unavailable.body, { message: "Database unavailable" });
  assert.equal(failingDb.calls.length, 1);

  const healthyDb = createDbTracker();
  const healthyApp = createApp({
    connectDBImpl: healthyDb.connectDBImpl,
    warmupOnBoot: false,
  });
  const notFound = await dispatchHttpRequest(healthyApp, {
    path: "/api/not-a-route",
  });

  assert.equal(notFound.status, 404);
  assert.deepEqual(notFound.body, {
    error: "Route not found",
    path: "/api/not-a-route",
    method: "GET",
  });
  assert.equal(healthyDb.calls.length, 0);
});
