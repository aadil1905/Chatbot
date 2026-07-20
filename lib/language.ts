import { getClinicConfiguration } from "./clinic-config";

export type ClinicLanguage = "en" | "hi" | "hinglish" | "mr";
const languages: Record<string, ClinicLanguage> = { LANG_EN: "en", LANG_HI: "hi", LANG_HINGLISH: "hinglish", LANG_MR: "mr" };
const selections: Record<string, ClinicLanguage> = {};
export function selectLanguage(userId: string, selection: string) { const language = languages[selection]; if (!language) return undefined; selections[userId] = language; return language; }
export function clearLanguage(userId: string) { delete selections[userId]; }

export async function welcomeFor(language: ClinicLanguage) {
  const clinic = await getClinicConfiguration();
  const clinicName = clinic?.name || "our dental clinic";
  const configured = language === "hi" ? clinic?.whatsapp?.welcomeHindi : language === "hinglish" ? clinic?.whatsapp?.welcomeHinglish : language === "mr" ? clinic?.whatsapp?.welcomeMarathi : clinic?.whatsapp?.welcomeEnglish;
  if (configured) return { text: configured, book: "Book appointment", services: "Services", contact: "Contact" };
  if (language === "hi") return { text: `नमस्ते! ${clinicName} में आपका स्वागत है।\n\nमैं आपकी कैसे सहायता कर सकता/सकती हूँ?`, book: "Appointment", services: "Services", contact: "Contact" };
  if (language === "hinglish") return { text: `Hello! ${clinicName} mein aapka welcome hai.\n\nMain aapki kaise help kar sakta/sakti hoon?`, book: "Book appointment", services: "Services", contact: "Contact" };
  if (language === "mr") return { text: `नमस्कार! ${clinicName} मध्ये आपले स्वागत आहे.\n\nमी आपली कशी मदत करू शकतो/शकते?`, book: "Appointment", services: "Services", contact: "Contact" };
  return { text: `Welcome to ${clinicName}.\n\nHow can we help you today?`, book: "Book appointment", services: "Services", contact: "Contact" };
}
