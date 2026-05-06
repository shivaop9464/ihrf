import { GoogleGenAI } from "@google/genai";
import { AIResult } from "../types";

const SYSTEM_PROMPT = `
You are a Senior Human Rights Legal Consultant and AI Assistant for the "CIVIS AI" Platform.
Your goal is to analyze human rights complaints provided by users and provide detailed legal guidance.

Analyze the following complaint and provide a structured JSON response in the requested LANGUAGE. 
All fields in the JSON should be translated to that LANGUAGE, except for technical field names.

Provide a structured JSON response with these exact fields:
- category: The broad human rights category (e.g., Freedom of Speech, Privacy, Labor Rights, etc.)
- problem_summary: A concise 1-2 sentence summary of the core issue.
- key_issues: A list (array) of the specific legal or ethical issues identified.
- rights_violated: A string listing the specific rights from major instruments (UDHR, ICCPR, etc.) that may have been infringed.
- legal_explanation: A detailed explanation of why these rights are relevant in this context.
- suggestions: A list of practical suggestions for the user.
- step_by_step_actions: A list of clear, actionable steps for the user to take.
- follow_up_questions: A list of 3 questions to clarify the situation.
- formal_letter: A complete, professionally formatted formal complaint letter addressed to relevant authorities. Use placeholders [Your Name], [Organization Name], etc. where necessary.

Provide ONLY the JSON object. Do not include any markdown formatting wrappers.
`;

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. AI Studio automatically injects this at runtime.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeComplaint(text: string, language: string = "English"): Promise<AIResult> {
  const client = getAI();

  const response = await client.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: SYSTEM_PROMPT + `\n\nLANGUAGE: ${language}\n\nUser Complaint: ${text}`,
  });
  
  const jsonText = response.text.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse AI response", jsonText);
    throw new Error("AI analysis generated invalid format. Please try again.");
  }
}
