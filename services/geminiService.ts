
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const getRefactorSuggestion = async (code: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a React refactor for the following code. Focus on best practices and state management:\n\n${code}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            refactoredCode: { type: Type.STRING },
          },
          required: ["explanation", "refactoredCode"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

export const performUnifiedSearch = async (query: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = chunks.map((chunk: any, index: number) => ({
      id: `[${index + 1}]`,
      title: chunk.web?.title || 'External Source',
      url: chunk.web?.uri || '#'
    }));

    return {
      synthesis: response.text,
      citations
    };
  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};

export const analyzeSecurity = async (fileName: string, content: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this file (${fileName}) for security vulnerabilities:\n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.NUMBER },
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  fix: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Security Audit Error:", error);
    return null;
  }
};
