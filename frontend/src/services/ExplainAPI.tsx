import axios from "axios";
import type { ExplanationResponse } from "../types/ExplainTypes";


export async function askExplanation(prompt: string): Promise<ExplanationResponse> {
  try {
    const res = await axios.post<ExplanationResponse>(
      "http://localhost:5000/explanation",
      { prompt }
    );
    return res.data;
  } catch (error: any) {
    console.error("Errore explanation:", error);
    return {
      response: null,
      prompt,
      iteration: 0,
      issue: error.response?.data?.message || error.message,
    };
  }
}