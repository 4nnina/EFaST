import axios from "axios";
import { API_BASE_URL } from "../config";
import type { ExplanationResponse } from "../types/ExplainTypes";


export async function askExplanation(prompt: string, model: string = "gpt-4"): Promise<ExplanationResponse> {
  try {
    const res = await axios.post<ExplanationResponse>(
      `${API_BASE_URL}/explanation`,
      { prompt, model }
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