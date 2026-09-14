export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  node?: HTMLElement; // We make it optional to satisfy strict type overlaps if old messages linger
  createdAt: number;
  isStreaming?: boolean;
};
