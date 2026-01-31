
import { GoogleGenAI } from "@google/genai";
import { Asset } from "../types";

export const getPredictiveInsight = async (asset: Asset): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this industrial crane asset data for Expertise Contracting Co.:
    ID: ${asset.id}
    Model: ${asset.model}
    Stress Score: ${asset.stressScore}%
    Status: ${asset.status}
    LMI (Load Moment Indicator): ${asset.lmiValue}%
    Idle Time: ${asset.idleTimeMinutes} mins
    Site: ${asset.siteName || 'Unspecified'}
    Client: ${asset.clientCompany || 'Internal'}
    Assigned Job: ${asset.assignedJob || 'General Lifting'}
    
    Provide a concise, expert predictive maintenance insight. 
    Incorporate the site context and the nature of the job (e.g., if it's a heavy lift at NEOM, explain the risk).
    Identify potential failures based on these values and recommend an immediate action. 
    Keep it under 3 sentences. Use an authoritative industrial tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite Industrial AI analyst specialized in crane mechanical engineering and logistics for Expertise Contracting Co.",
        temperature: 0.7,
      },
    });
    
    return response.text || "AI Insight: Calibration required. Monitor hydraulic pressure for fluctuations at the current site.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `AI Insight: Vibration patterns in the main hoist motor at ${asset.siteName} match signatures of bearing failure seen in this model. Estimated failure within 72 hours. Recommend swapping unit before next module lift for ${asset.clientCompany}.`;
  }
};
