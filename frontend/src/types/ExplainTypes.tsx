
export interface ExplanationResponse {
  response: any;   
  prompt: string;
  iteration: number;
  issue?: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet_list"; items: string[] }
  | {
      type: "highlight_box";
      title: string;
      text: string;
      severity: "warning" | "info" | "error";
    };

export type Section = {
  id: string;
  title: string;
  content_blocks: ContentBlock[];
};

export type Report = {
  report_title: string;
  summary: string;
  sections: Section[];
};