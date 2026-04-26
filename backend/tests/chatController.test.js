import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculatePortfolioTotalExperience,
  createSystemPrompt,
} from "../controllers/chatController.js";

test("createSystemPrompt tolerates non-current experiences without end dates", () => {
  const prompt = createSystemPrompt({
    experiences: [
      {
        title: "Engineer",
        company: "Example Co",
        location: "Remote",
        startDate: new Date("2024-01-01"),
        endDate: null,
        current: false,
        description: ["Built API flows"],
        technologies: ["Node.js"],
      },
    ],
    projects: [],
    skills: [],
    totalExperience: "1 year",
  });

  assert.match(prompt, /2024-01-01 to Unknown end date/);
});

test("calculatePortfolioTotalExperience ignores invalid experience dates", () => {
  const totalExperience = calculatePortfolioTotalExperience([
    { startDate: "not-a-date" },
    { startDate: null },
    { startDate: new Date("2023-01-01") },
  ]);

  assert.notEqual(totalExperience, "No experience data available");
});
