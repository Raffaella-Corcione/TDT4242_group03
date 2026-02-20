// client/src/types/index.ts

/**
 * Represents a single AI usage declaration record from the database
 */
export interface Declaration {
  id: number;
  user_name: string;
  assignment_title: string;
  ai_tool: string;
  usage_purpose: string;
  ai_content: string;
  screenshot_path: string | null;
  created_at: string;
}

/**
 * Form data structure for creating a new declaration
 * This matches what the user inputs before submission
 */
export interface DeclarationFormData {
  userName: string;
  assignmentTitle: string;
  aiTools: AITool[]; // Array of selected tools
  customTool: string; // Custom tool input
  usagePurpose: string;
  aiContent: string;
  screenshot: File | null;
}

/**
 * Predefined AI tools available for selection
 */
export const AI_TOOLS = [
  'ChatGPT',
  'GitHub Copilot',
  'Claude',
  'Grammarly',
  'Turnitin',
  'DALL-E',
  'Data Analysis Tools'
] as const;

export type AITool = typeof AI_TOOLS[number];
