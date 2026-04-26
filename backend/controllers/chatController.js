import Experience from "../models/Experience.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import { logServerError } from "../utils/serverError.js";
import { validateChatMessage } from "../validators/chatValidator.js";

// In-memory cache for portfolio context (5-minute TTL)
let portfolioCache = null;
let portfolioCacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;
let openAIClient = null;
let openAIClientPending = null;
const NOT_SPECIFIED = "Not specified";
const UNKNOWN_START_DATE = "Unknown start date";
const UNKNOWN_END_DATE = "Unknown end date";
const DEFAULT_TOTAL_EXPERIENCE = "No experience data available";

const toValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatPromptDate = (value, fallback) => {
  const date = toValidDate(value);
  return date ? date.toISOString().split("T")[0] : fallback;
};

const formatText = (value, fallback = NOT_SPECIFIED) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const formatList = (value, fallback = NOT_SPECIFIED) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return items.length > 0 ? items.join(", ") : fallback;
};

const getOpenAIClient = async () => {
  if (openAIClient) {
    return openAIClient;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!openAIClientPending) {
    openAIClientPending = import("openai")
      .then(({ default: OpenAI }) => {
        openAIClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        return openAIClient;
      })
      .catch((error) => {
        openAIClientPending = null;
        throw error;
      });
  }

  return openAIClientPending;
};

// Calculate total experience duration
const calculateTotalExperience = (experiences) => {
  if (!experiences || experiences.length === 0) {
    return DEFAULT_TOTAL_EXPERIENCE;
  }

  let firstJobStartDate = null;

  for (const experience of experiences) {
    const startDate = toValidDate(experience?.startDate);
    if (!startDate) {
      continue;
    }

    if (!firstJobStartDate || startDate < firstJobStartDate) {
      firstJobStartDate = startDate;
    }
  }

  if (!firstJobStartDate) {
    return DEFAULT_TOTAL_EXPERIENCE;
  }

  const currentDate = new Date();

  // Calculate the difference in months
  const yearDiff = currentDate.getFullYear() - firstJobStartDate.getFullYear();
  const monthDiff = currentDate.getMonth() - firstJobStartDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;

  // Convert to years and months
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // Format the result
  let result = "";
  if (years > 0) {
    result += `${years} year${years > 1 ? "s" : ""}`;
  }
  if (months > 0) {
    if (result) result += " and ";
    result += `${months} month${months > 1 ? "s" : ""}`;
  }
  if (!result) {
    result = "Less than 1 month";
  }

  return result;
};

// Get all portfolio data for context (cached)
const getPortfolioContext = async () => {
  const now = Date.now();
  if (portfolioCache && now < portfolioCacheExpiry) {
    return portfolioCache;
  }

  try {
    const [experiences, projects, skills] = await Promise.all([
      Experience.find(
        {},
        "title company location startDate endDate current description technologies"
      )
        .sort({ startDate: -1 })
        .lean(),
      Project.find(
        {},
        "title description technologies category githubUrl liveUrl"
      )
        .sort({ createdAt: -1 })
        .lean(),
      Skill.find({}, "name category proficiency").sort({ category: 1 }).lean(),
    ]);

    // Calculate total experience
    const totalExperience = calculateTotalExperience(experiences);

    portfolioCache = {
      experiences,
      projects,
      skills,
      totalExperience,
      systemPrompt: createSystemPrompt({
        experiences,
        projects,
        skills,
        totalExperience,
      }),
    };
    portfolioCacheExpiry = now + CACHE_TTL_MS;
    return portfolioCache;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    const fallbackContext = {
      experiences: [],
      projects: [],
      skills: [],
      totalExperience: "Unable to calculate",
    };

    return {
      ...fallbackContext,
      systemPrompt: createSystemPrompt(fallbackContext),
    };
  }
};

// Create system prompt with portfolio context
export const createSystemPrompt = (portfolioData = {}) => {
  const experiences = Array.isArray(portfolioData.experiences)
    ? portfolioData.experiences
    : [];
  const projects = Array.isArray(portfolioData.projects)
    ? portfolioData.projects
    : [];
  const skills = Array.isArray(portfolioData.skills) ? portfolioData.skills : [];
  const totalExperience =
    portfolioData.totalExperience || DEFAULT_TOTAL_EXPERIENCE;

  const experienceLines = experiences
    .map((exp, index) => {
      const current = Boolean(exp?.current);
      const startDate = formatPromptDate(exp?.startDate, UNKNOWN_START_DATE);
      const endDate = current
        ? "Present"
        : formatPromptDate(exp?.endDate, UNKNOWN_END_DATE);

      return `
${index + 1}. ${formatText(exp?.title)} at ${formatText(exp?.company)}
   - Location: ${formatText(exp?.location)}
   - Duration: ${startDate} to ${endDate}
   - Current Position: ${current ? "Yes" : "No"}
   - Key Responsibilities: ${formatList(exp?.description)}
   - Technologies Used: ${formatList(exp?.technologies)}
`;
    })
    .join("");

  const projectLines = projects
    .map(
      (project, index) => `
${index + 1}. ${formatText(project?.title)}
   - Description: ${formatText(project?.description)}
   - Technologies: ${formatList(project?.technologies)}
   - Category: ${formatText(project?.category)}
   - GitHub Repository: ${formatText(project?.githubUrl)}
   - Live Demo: ${formatText(project?.liveUrl)}
`
    )
    .join("");

  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = formatText(skill?.category);
    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(skill);
    return acc;
  }, {});

  const skillLines = Object.entries(skillsByCategory)
    .map(
      ([category, categorySkills]) => `
${category}:
${categorySkills
  .sort((a, b) => (b?.proficiency ?? 0) - (a?.proficiency ?? 0))
  .map(
    (skill) =>
      `   - ${formatText(skill?.name)}: ${
        Number.isFinite(skill?.proficiency) ? skill.proficiency : 0
      }%`
  )
  .join("\n")}
`
    )
    .join("");

  const currentExperience = experiences.find((exp) => exp?.current);
  const highlightedSkills = skills
    .filter((skill) => Number(skill?.proficiency) >= 80)
    .map((skill) => formatText(skill?.name))
    .filter((name, index, items) => name !== NOT_SPECIFIED && items.indexOf(name) === index)
    .join(", ");
  const notableProjects = projects
    .slice(0, 2)
    .map((project) => formatText(project?.title))
    .filter((title) => title !== NOT_SPECIFIED)
    .join(", ");

  let context = `You are a personal assistant for a software developer's portfolio. You can ONLY answer questions about the developer's experience, projects, and skills. You must NOT answer questions about anything else.

Here is the developer's information:

TOTAL EXPERIENCE: ${totalExperience} (calculated from first job start date to current date)

EXPERIENCES (in chronological order):
${experienceLines}

PROJECTS (with details):
${projectLines}

SKILLS (organized by category):
${skillLines}

SUMMARY FORMAT FOR "TELL ME ABOUT PRASHANT" REQUESTS:
When asked for a summary about Prashant, structure your response to include:
- Professional experience duration: ${totalExperience}
- Current role: ${
    formatText(currentExperience?.title)
  } at ${formatText(currentExperience?.company)}
- Key technologies: ${highlightedSkills || "Various technologies"}
- Notable projects: ${notableProjects || "Multiple projects"}
- Professional focus: Full-stack development, modern web technologies, and innovative solutions

IMPORTANT RULES:
1. ONLY answer questions about the developer's experience, projects, and skills
2. If asked about anything else (weather, general knowledge, other people, etc.), politely decline and redirect to portfolio-related topics
3. Be helpful and detailed when discussing the portfolio
4. Use the exact information provided above
5. If you don't have specific information about something, say so clearly
6. Keep responses concise but informative
7. When asked about total experience or years of experience, provide the calculated total experience duration
8. When asked "tell me about prashant in 100 words" or similar summary requests, provide a comprehensive overview including:
   - Total professional experience
   - Current role and company
   - Key technologies and skills
   - Notable projects
   - Professional strengths
   - Keep it exactly within the requested word limit

COMMON PORTFOLIO QUESTIONS YOU CAN ANSWER:
- "What is Prashant's experience?" - Provide total experience and career overview
- "What technologies does Prashant know?" - List all technologies with proficiency levels
- "What projects has Prashant worked on?" - Describe projects with technologies and links
- "What is Prashant's current role?" - Current position and company details
- "What are Prashant's skills?" - Categorized skills with proficiency percentages
- "Tell me about Prashant's career journey" - Chronological work experience
- "What programming languages does Prashant use?" - Focus on programming languages
- "What frameworks does Prashant know?" - List frameworks and libraries
- "What is Prashant's expertise?" - Highlight strongest skills and areas
- "What projects can I see?" - List projects with descriptions and links
- "What is Prashant's background?" - Professional background and experience
- "What tools does Prashant use?" - Development tools and technologies
- "What is Prashant's work experience?" - Detailed work history
- "What are Prashant's achievements?" - Notable projects and accomplishments
- "What is Prashant's professional profile?" - Complete professional summary`;

  return context;
};

export const calculatePortfolioTotalExperience = calculateTotalExperience;

export const __resetChatControllerStateForTests = () => {
  portfolioCache = null;
  portfolioCacheExpiry = 0;
  openAIClient = null;
  openAIClientPending = null;
};

export const __setOpenAIClientForTests = (client) => {
  openAIClient = client;
  openAIClientPending = null;
};

// Chat endpoint
export const chatWithAssistant = async (req, res) => {
  try {
    let message = req.validatedChatRequest?.message;

    if (!message) {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({
          error: "Request body is required and must be a JSON object",
        });
      }

      const { error, value } = validateChatMessage(req.body);
      if (error) {
        return res.status(400).json({
          error: error.details[0].message,
        });
      }

      message = value.message;
    }

    const [portfolioData, openAI] = await Promise.all([
      getPortfolioContext(),
      getOpenAIClient(),
    ]);

    // Create system prompt
    const systemPrompt =
      portfolioData.systemPrompt || createSystemPrompt(portfolioData);

    const completion = await openAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantResponse = completion.choices[0]?.message?.content;

    if (!assistantResponse) {
      return res.status(500).json({
        error: "Failed to generate response from AI assistant",
      });
    }

    res.json({
      response: assistantResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logServerError("Chat error", error);

    res.status(503).json({
      error: "The assistant is temporarily unavailable.",
    });
  }
};

// Get chat history (optional - for future enhancement)
export const getChatHistory = async (req, res) => {
  // This could be implemented to store chat history in database
  // For now, we'll return a simple response
  res.json({
    message: "Chat history feature not implemented yet",
    history: [],
  });
};
