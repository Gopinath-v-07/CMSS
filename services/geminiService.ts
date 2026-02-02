
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeComplaint = async (subject: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an administrative assistant for a university. Analyze the following student complaint and provide: 
      1. A summary of the core issue.
      2. A suggested resolution or immediate action step.
      3. An appropriate tone for the response.

      Subject: ${subject}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            recommendedTone: { type: Type.STRING }
          },
          required: ["summary", "suggestedAction", "recommendedTone"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
