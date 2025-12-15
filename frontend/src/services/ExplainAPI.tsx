import { GoogleGenAI } from "@google/genai";
import axios from "axios";

export interface ExplainResponse {
  constraints: any;
  assignments: any;
  conflicts: any;
  fairness_data: any;
  prompt: {
    source: string;
    text: string;
  };
}

export async function getExplanationData(prompt: string) {
  try {
    const res = await axios.post<ExplainResponse>(
      "http://localhost:5000/explainationData",
      {
        prompt,
      }
    );
    return res.data;
  } catch (error: any) {
    console.error("Errore durante il caricamento della spiegazione:", error);
    return {
      status: "error",
      message: error.response?.data?.message || error.message,
    };
  }
}


export async function geminiAsk(prompt: string, maxRetries = 5) {
  

  const objecto = { "report_title": "Schedule Conflict Analysis and Improvement Proposal", "summary": "The current schedule for 32 professors results in 16 total conflicts, primarily 'better not' requests. While 63% of professors have zero conflicts, the remaining conflicts are concentrated on a few individuals, indicating an imbalance in satisfaction.", "sections": [ { "id": "current_situation_analysis", "title": "Snapshot of the Current Scheduling Situation", "content_blocks": [ { "type": "paragraph", "text": "The schedule involves 32 professors. The total number of assigned time slots is 108. The scheduling algorithm managed to place most of the professors without violating their strictest constraints, but it did not fully meet all preferences." }, { "type": "highlight_box", "title": "Total Conflicts", "text": "There are a total of 16 conflicts between the professors' requested constraints and the actual schedule.", "severity": "warning" }, { "type": "bullet_list", "items": [ "**'Better Not' Conflicts:** 15 slots (94% of total conflicts) were assigned in times the professor strongly preferred to avoid. These are minor constraints.", "**'Impossible' Conflicts:** Only 1 slot (6% of total conflicts) was assigned in a time the professor explicitly stated was impossible (a severe constraint)." ] }, { "type": "paragraph", "text": "The conflicts are heavily concentrated on a few individuals, creating an unfair distribution of the burden:" }, { "type": "bullet_list", "items": [ "**Conflict-Free Majority:** 20 out of 32 professors (63%) have absolutely zero conflicts.", "**Most Affected Professors:** Professor 83 has the only 'impossible' conflict and a 'fairness percentage' of 83%. Professor 4 has 3 'better not' conflicts and a 'fairness percentage' of 77%. Professor 88 has 3 'better not' conflicts and a 'fairness percentage' of 91%. Professor 55 has 2 'better not' conflicts and a low 'fairness percentage' of 75%." ] } ] }, { "id": "inherent_difficulty", "title": "Why a Perfectly Satisfactory Schedule is Almost Impossible", "content_blocks": [ { "type": "paragraph", "text": "Achieving a schedule where every professor is perfectly satisfied is an extremely difficult task, even for advanced algorithms, primarily because the scheduling problem is a search for balance and compromise among competing demands." }, { "type": "bullet_list", "items": [ "**Clash of Preferences:** Many professors naturally prefer the same time slots, typically those mid-morning (e.g., from 9:30 AM to 12:30 PM) and universally dislike early mornings, late afternoons, or Fridays. If a time slot is in high demand, someone must be assigned to it, leading to a 'better not' conflict.", "**Mandatory Coverage:** Every course must be taught, regardless of the professor's constraints. If a professor must teach, and the only available slot clashes with their preference, a conflict is inevitable. This means some professors must 'sacrifice' their preferred times.", "**'Contagious' Constraints:** Some strong constraints (like 'impossible' slots) of a few professors can drastically limit the options for everyone else. This ripple effect forces the algorithm to push other professors into less desirable slots to avoid breaking the few hard rules." ] } ] }, { "id": "improvement_proposals", "title": "Specific Proposals for Improvement and Rebalancing", "content_blocks": [ { "type": "paragraph", "text": "The main goal for improvement should be to eliminate the single 'impossible' conflict and reduce the number of 'better not' conflicts for those professors who are most affected, thus improving the overall fairness." }, { "type": "highlight_box", "title": "Priority Exchange: Eliminating the 'Impossible' Conflict", "text": "The highest priority is resolving the **'impossible' conflict for Professor 83** at Monday from 8:30 to 9:30. This is the most severe violation. We must find another slot for Professor 83 that is not an issue for them.", "severity": "warning" }, { "type": "paragraph", "text": "A potential strategy involves swapping slots between highly-affected professors and those who are currently conflict-free. This would redistribute the minor 'better not' burden more evenly." }, { "type": "bullet_list", "items": [ "**Improvement for Professor 4:** Professor 4 has three 'better not' conflicts on Monday morning (9:30 to 12:30). Professor 57 is currently conflict-free and has no constraints listed for those morning hours. Swapping some of Professor 4's Monday slots with Professor 57's slots (Thursday morning) could improve Professor 4's situation without creating new conflicts for Professor 57.", "**Improvement for Professor 55:** Professor 55 has two 'better not' conflicts on Monday from 8:30 to 9:30 and 15:30 to 16:30. Professor 93 is currently conflict-free and assigned to the slot Monday from 8:30 to 9:30. A direct exchange could remove this 'better not' conflict for Professor 55 and place it on a professor (93) who has not expressed any constraint for that time. This is a very targeted and efficient improvement.", "**Overall Goal:** Such exchanges do not remove conflicts entirely, but they redistribute them from severely affected individuals (like Professor 4 and 55, with low satisfaction) to those who are currently at 100% satisfaction and have indicated no objection to the swapped time. This is a crucial step towards achieving **better general equity**." ] } ] } ] } 
  return JSON.stringify(objecto)

  const gemini = new GoogleGenAI({
    apiKey: import.meta.env.GOOGLE_API_KEY    // no in browser
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log("Attempt " + attempt + " with gemini-2.5-flash")
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      console.log("Tentativo andato bene!")
      console.log(response.text || "Nothing")
      return response.text || "Nothing";

    } catch (err: any) {
      const status = err?.error?.status;
      const message = err?.error?.message;

      // Se non è un overload, throw diretto
      if (status !== "UNAVAILABLE" && status !== "RESOURCE_EXHAUSTED") {
        console.error("Errore Gemini:", message);
        throw err;
      }

      // Retry solo in caso di 503 / overload
      const delay = attempt * 500; // backoff esponenziale leggero
      console.warn(`Gemini overload (#${attempt}). Riprovo tra ${delay}ms...`);

      await new Promise(res => setTimeout(res, delay));
    }
  }

  return "Il modello è sovraccarico. Riprova più tardi.";
}
