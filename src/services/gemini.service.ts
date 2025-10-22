import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Utility function to convert a File to a base64 string
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    // The API key is expected to be available in the environment variables.
    if (process.env.API_KEY) {
      this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.error('API_KEY environment variable not set.');
    }
  }

  async generatePostFromImage(file: File, prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini AI client is not initialized. Please check your API key.');
    }

    const model = 'gemini-2.5-flash';
    
    const base64Data = await toBase64(file);

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt,
    };

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
      });
      
      const text = response.text;
      if (!text) {
          throw new Error('Did not receive valid post text from the API.');
      }
      return text;
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('An error occurred while generating the post. Please try again later.');
    }
  }
}