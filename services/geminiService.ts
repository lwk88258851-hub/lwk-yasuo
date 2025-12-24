
import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata, CompressionAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCompressionAdvice(metadata: VideoMetadata, targetMB: number): Promise<CompressionAdvice> {
  const safetyMargin = 0.98; // 2% safety buffer
  const targetSizeMB = targetMB * safetyMargin;
  const originalSizeMB = metadata.size / (1024 * 1024);
  
  const prompt = `
    Analyze this video and provide optimal FFmpeg compression settings to reach a target size of ${targetSizeMB.toFixed(1)}MB while maintaining the highest possible quality.
    
    Video Details:
    - Name: ${metadata.name}
    - Original Size: ${originalSizeMB.toFixed(2)} MB
    - Duration: ${metadata.duration ? metadata.duration.toFixed(2) + ' seconds' : 'Unknown'}
    - Original Resolution: ${metadata.width && metadata.height ? `${metadata.width}x${metadata.height}` : 'Unknown'}

    The goal is to fit within ${targetMB}MB (targeting ${targetSizeMB.toFixed(1)}MB to be safe). 
    If the original is already smaller than the target, aim for a 30% reduction in size with minimal loss to justify the processing.
    Provide the most balanced settings for H.264 encoding.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetBitrateKbps: { type: Type.NUMBER, description: "Calculated bitrate in kbps" },
          resolution: { type: Type.STRING, description: "Target resolution (e.g., '1280x720' or 'source')" },
          preset: { type: Type.STRING, description: "FFmpeg preset (e.g., 'medium', 'slow', 'faster')" },
          crf: { type: Type.NUMBER, description: "Constant Rate Factor for quality (18-28)" },
          explanation: { type: Type.STRING, description: "Brief explanation of why these settings were chosen" }
        },
        required: ["targetBitrateKbps", "resolution", "preset", "crf", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Failed to parse Gemini advice:", error);
    // Fallback logic based on target
    const duration = metadata.duration || 60;
    const fallbackBitrate = Math.floor((targetSizeMB * 8192) / duration); 
    return {
      targetBitrateKbps: Math.min(fallbackBitrate, 8000),
      resolution: "1280x720",
      preset: "medium",
      crf: 23,
      explanation: "Fallback settings used due to analysis error."
    };
  }
}
