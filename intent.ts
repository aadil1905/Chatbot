export function detectIntent(message: string) {
  const text = message.toLowerCase();

  if (
    text.includes("book") ||
    text.includes("appointment") ||
    text.includes("schedule")
  ) {
    return "BOOK_APPOINTMENT";
  }

  return "GENERAL";
}