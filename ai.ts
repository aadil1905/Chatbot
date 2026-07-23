import OpenAI from "openai";
import { getConversionCoachPrompt } from "./prompts";
import { getRecentConversationMessages } from "./whatsapp-conversations";

function getClient() { const apiKey = process.env.OPENAI_API_KEY; if (!apiKey) throw new Error("OPENAI_API_KEY is not configured."); return new OpenAI({ apiKey }); }
type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function getAIReply(userId: string, message: string) {
  const stored = await getRecentConversationMessages(userId);
  const history: ChatMessage[] = stored.reverse().map((item) => ({ role: item.direction === "INBOUND" ? "user" : "assistant", content: item.content }));
  if (!history.length || history[history.length - 1].content !== message) history.push({ role: "user", content: message });
  const completion = await getClient().chat.completions.create({ model: "gpt-4.1-mini", messages: [{ role: "system", content: await getConversionCoachPrompt() }, ...history], temperature: 0.4 });
  return { action: "reply", message: completion.choices[0].message.content ?? "Sorry, I couldn't generate a response." };
}

export async function clearConversation(_userId: string) {
  // Conversation history is intentionally retained in the database for continuity and CRM review.
}
