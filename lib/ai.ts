import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompts";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const conversations: Record<string, ChatMessage[]> = {};

export async function getAIReply(
  userId: string,
  message: string
) {
  if (!conversations[userId]) {
    conversations[userId] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
    ];
  }

  conversations[userId].push({
    role: "user",
    content: message,
  });

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: conversations[userId],
    temperature: 0.7,
  });

  const reply =
    completion.choices[0].message.content ??
    "Sorry, I couldn't generate a response.";

  conversations[userId].push({
    role: "assistant",
    content: reply,
  });

  // Prevent unlimited memory growth
  if (conversations[userId].length > 20) {
    conversations[userId] = [
      conversations[userId][0], // Keep system prompt
      ...conversations[userId].slice(-19),
    ];
  }

  return {
    action: "reply",
    message: reply,
  };
}

export function clearConversation(userId: string) {
  delete conversations[userId];
}