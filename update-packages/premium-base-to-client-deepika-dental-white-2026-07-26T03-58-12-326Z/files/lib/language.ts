import { getClinicConfiguration } from "./clinic-config";
import { setConversationLanguage } from "./whatsapp-conversations";

export type ClinicLanguage = "en" | "hi" | "mr";

const languages: Record<string, ClinicLanguage> = {
  LANG_EN: "en",
  LANG_HI: "hi",
  LANG_MR: "mr",
};

export async function selectLanguage(
  userId: string,
  selection: string
) {
  const language = languages[selection];

  if (!language) return undefined;

  await setConversationLanguage(userId, language);

  return language;
}

export async function clearLanguage(userId: string) {
  await setConversationLanguage(userId, null);
}

export async function welcomeFor(language: ClinicLanguage) {
  const clinic = await getClinicConfiguration();

  const clinicName = clinic?.name || "our dental clinic";

  const configured =
    language === "hi"
      ? clinic?.whatsapp?.welcomeHindi
      : language === "mr"
      ? clinic?.whatsapp?.welcomeMarathi
      : clinic?.whatsapp?.welcomeEnglish;

  if (configured) {
    return {
      text: configured,
      book:
        language === "hi"
          ? "अपॉइंटमेंट"
          : language === "mr"
          ? "अपॉइंटमेंट"
          : "Book appointment",

      services:
        language === "hi"
          ? "सेवाएँ"
          : language === "mr"
          ? "सेवा"
          : "Services",

      contact:
        language === "hi"
          ? "संपर्क"
          : language === "mr"
          ? "संपर्क"
          : "Contact",
    };
  }

  if (language === "hi") {
    return {
      text: `नमस्ते! ${clinicName} में आपका स्वागत है।

मैं आपकी किस प्रकार सहायता कर सकता हूँ?`,
      book: "अपॉइंटमेंट",
      services: "सेवाएँ",
      contact: "संपर्क",
    };
  }

  if (language === "mr") {
    return {
      text: `नमस्कार! ${clinicName} मध्ये आपले स्वागत आहे.

मी आपली कशी मदत करू शकतो?`,
      book: "अपॉइंटमेंट",
      services: "सेवा",
      contact: "संपर्क",
    };
  }

  return {
    text: `Welcome to ${clinicName}.

How can we help you today?`,
    book: "Book appointment",
    services: "Services",
    contact: "Contact",
  };
}