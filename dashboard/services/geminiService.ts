import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInstallLogs = async (appName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 6 professional, cloud-infrastructure provisioning log messages for initializing a secure integration with "${appName}".
      Use high-trust DevOps terminology like "Provisioning isolated container...", "Verifying SSL certificate chain...", "Allocating dedicated bandwidth...", "Syncing API schemas (v2.4.0)...", "Validating OAUTH tokens...", "Integration active.".
      Return only the lines of text, separated by newlines. Do not number them.`,
      config: {
        maxOutputTokens: 200,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text || "";
    return text.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback logs if API fails or key is missing
    return [
      `Initializing secure environment for ${appName}...`,
      "Validating SSL/TLS certificate chain...",
      "Allocating isolated container resources...",
      `Syncing configuration with ${appName} API Gateway...`,
      "Verifying integrity of local dependencies...",
      "Integration successfully established."
    ];
  }
};

export const generateSimilarNames = async (baseName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 100 realistic, modern female first names that are similar in vibe, ethnicity, or style to the name "${baseName}". 
      Return ONLY a JSON array of strings. No markdown formatting.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    const names = JSON.parse(text);
    return Array.isArray(names) ? names : [baseName];
  } catch (error) {
    console.error("Gemini Name Gen Error:", error);
    return [baseName, "Ashley", "Jessica", "Sarah", "Emily", "Madison", "Emma", "Olivia", "Ava", "Isabella", "Mia"];
  }
};