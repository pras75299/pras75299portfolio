import OpenAI from "openai";
import Experience from "../models/Experience.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import { validateChatMessage } from "../validators/chatValidator.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Calculate total experience duration
const calculateTotalExperience = (experiences) => {
  if (!experiences || experiences.length === 0) {
    return "No experience data available";
  }

  // Find the earliest start date
  const sortedExperiences = experiences.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );
  const firstJobStartDate = new Date(sortedExperiences[0].startDate);
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

// Get all portfolio data for context
const getPortfolioContext = async () => {
  try {
    const [experiences, projects, skills] = await Promise.all([
      Experience.find().sort({ startDate: -1 }),
      Project.find().sort({ createdAt: -1 }),
      Skill.find().sort({ category: 1 }),
    ]);

    // Calculate total experience
    const totalExperience = calculateTotalExperience(experiences);

    return {
      experiences,
      projects,
      skills,
      totalExperience,
    };
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return {
      experiences: [],
      projects: [],
      skills: [],
      totalExperience: "Unable to calculate",
    };
  }
};

// Create system prompt with portfolio context
const createSystemPrompt = (portfolioData) => {
  const { experiences, projects, skills, totalExperience } = portfolioData;

  let context = `You are a personal assistant for a software developer's portfolio. You can ONLY answer questions about the developer's experience, projects, and skills. You must NOT answer questions about anything else.

Here is the developer's information:

TOTAL EXPERIENCE: ${totalExperience} (calculated from first job start date to current date)

EXPERIENCES (in chronological order):
${experiences
  .map(
    (exp, index) => `
${index + 1}. ${exp.title} at ${exp.company}
   - Location: ${exp.location}
   - Duration: ${exp.startDate.toISOString().split("T")[0]} to ${
      exp.current ? "Present" : exp.endDate.toISOString().split("T")[0]
    }
   - Current Position: ${exp.current ? "Yes" : "No"}
   - Key Responsibilities: ${exp.description.join(", ")}
   - Technologies Used: ${exp.technologies.join(", ")}
`
  )
  .join("")}

PROJECTS (with details):
${projects
  .map(
    (project, index) => `
${index + 1}. ${project.title}
   - Description: ${project.description}
   - Technologies: ${project.technologies.join(", ")}
   - Category: ${project.category}
   - GitHub Repository: ${project.githubUrl}
   - Live Demo: ${project.liveUrl}
`
  )
  .join("")}

SKILLS (organized by category):
${Object.entries(
  skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {})
)
  .map(
    ([category, categorySkills]) => `
${category}:
${categorySkills
  .sort((a, b) => b.proficiency - a.proficiency)
  .map((skill) => `   - ${skill.name}: ${skill.proficiency}%`)
  .join("\n")}
`
  )
  .join("")}

SUMMARY FORMAT FOR "TELL ME ABOUT PRASHANT" REQUESTS:
When asked for a summary about Prashant, structure your response to include:
- Professional experience duration: ${totalExperience}
- Current role: ${
    experiences.find((exp) => exp.current)?.title || "Not specified"
  } at ${experiences.find((exp) => exp.current)?.company || "Not specified"}
- Key technologies: ${
    skills
      .filter((skill) => skill.proficiency >= 80)
      .map((skill) => skill.name)
      .join(", ") || "Various technologies"
  }
- Notable projects: ${
    projects
      .slice(0, 2)
      .map((project) => project.title)
      .join(", ") || "Multiple projects"
  }
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

// Chat endpoint
export const chatWithAssistant = async (req, res) => {
  try {
    // Debug logging
    console.log("Chat request received:", {
      body: req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : "no body",
      headers: req.headers["content-type"],
    });

    // Check if body exists
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "Request body is required and must be a JSON object",
      });
    }

    // Validate input
    const { error, value } = validateChatMessage(req.body);
    if (error) {
      console.log("Validation error:", error.details);
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { message } = value;

    // Get portfolio data for context
    const portfolioData = await getPortfolioContext();

    // Create system prompt
    const systemPrompt = createSystemPrompt(portfolioData);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
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
    console.error("Chat error:", error);

    if (error.code === "insufficient_quota") {
      return res.status(402).json({
        error:
          "OpenAI API quota exceeded. Please check your API key and billing.",
      });
    }

    if (error.code === "invalid_api_key") {
      return res.status(401).json({
        error:
          "Invalid OpenAI API key. Please check your environment variables.",
      });
    }

    res.status(500).json({
      error: "An error occurred while processing your request",
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
