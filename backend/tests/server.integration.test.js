import assert from "node:assert/strict";
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
  ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

process.env.NODE_ENV = "test";
process.env.VERCEL = "0";
process.env.ADMIN_API_TOKEN = "integration-admin-token";
process.env.OPENAI_API_KEY = "test-openai-key";

const { createApp } = await import("../server.js");

const originalFinders = {
  projectFind: Project.find,
  experienceFind: Experience.find,
  skillFind: Skill.find,
};

const cloneData = (value) => JSON.parse(JSON.stringify(value));

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
  process.env.ADMIN_API_TOKEN = "integration-admin-token";
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
  process.env.ADMIN_API_TOKEN = originalEnv.ADMIN_API_TOKEN;
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
    "public, s-maxage=86400, stale-while-revalidate=3600"
  );
  assert.equal(
    experiences.headers["vercel-cdn-cache-control"],
    "public, s-maxage=86400, stale-while-revalidate=3600"
  );
  assert.equal(
    skills.headers["cdn-cache-control"],
    "public, s-maxage=86400, stale-while-revalidate=3600"
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

  process.env.ADMIN_API_TOKEN = "";
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
