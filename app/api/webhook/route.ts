import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { clearBooking, continueBooking, hasBooking, resumeBooking, startBooking, startReschedule } from "@/lib/booking";
import { clearConversation } from "@/lib/ai";
import { clinicBrand } from "@/lib/brand";
import { defaultServices } from "@/lib/clinic-config";
import { detectIntent } from "@/lib/intent";
import { currentLanguage, menuCopyFor, selectLanguage, welcomeFor } from "@/lib/language";
import { sendListMessage, sendReplyButtons, sendTextMessage } from "@/lib/whatsapp";
import { getConversationState } from "@/lib/whatsapp-conversations";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return new Response(challenge!, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new Response("Forbidden", { status: 403 });
}

async function showLanguagePicker(to: string) {
  await sendListMessage(
    to,
    `Welcome to ${clinicBrand.clinicName}. Please choose your language.`,
    "Choose language",
    [{
      title: "Languages",
      rows: [
        { id: "LANG_EN", title: "English" },
        { id: "LANG_HI", title: "Hindi" },
        { id: "LANG_MR", title: "Marathi" },
      ],
    }],
  );
}

async function showMainMenu(to: string) {
  const copy = await welcomeFor(await currentLanguage(to));
  await sendReplyButtons(to, copy.text, [
    { id: "BOOK_APPOINTMENT", title: copy.book },
    { id: "SERVICES", title: copy.services },
    { id: "CONTACT", title: copy.contact },
  ]);
}

function runInBackground(work: Promise<unknown>, label: string) {
  work.catch((error) => console.error(`${label}:`, error));
}

function cleanInput(value: string) {
  return value.normalize("NFKC").toLowerCase().trim().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ");
}

function matchesAny(value: string, aliases: string[]) {
  const cleaned = cleanInput(value);
  return aliases.some((alias) => cleaned === cleanInput(alias));
}

function menuAction(value: string) {
  if (matchesAny(value, ["BOOK_APPOINTMENT", "Book appointment", "appointment", "book", "अपॉइंटमेंट", "अपॉइंटमेंट बुक", "बुक अपॉइंटमेंट", "भेट", "भेट बुक"])) return "BOOK_APPOINTMENT";
  if (matchesAny(value, ["SERVICES", "Services", "service", "सेवाएं", "सेवा", "services list", "treatment", "इलाज", "उपचार"])) return "SERVICES";
  if (matchesAny(value, ["CONTACT", "Contact", "संपर्क", "phone", "number", "address", "पता", "फोन", "नंबर"])) return "CONTACT";
  return "";
}

function hasValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (!hasValidSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
      return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
    }
    const body = JSON.parse(rawBody);
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return NextResponse.json({ received: true });

    const from = message.from;
    const userMessage = message.type === "text"
      ? message.text?.body ?? ""
      : message.type === "interactive" && message.interactive?.type === "button_reply"
        ? message.interactive.button_reply.id
        : message.type === "interactive" && message.interactive?.type === "list_reply"
          ? message.interactive.list_reply.id
          : "";

    if (!userMessage) return NextResponse.json({ received: true });

    const conversation = await getConversationState(from);
    const normalized = cleanInput(userMessage);
    const greeting = /^(hi+|hey+|hello+|menu|start|नमस्ते|नमस्कार)$/i.test(normalized);

    if (!conversation?.language && !userMessage.startsWith("LANG_")) {
      if (await hasBooking(from)) {
        await resumeBooking(from);
        return NextResponse.json({ received: true });
      }
      await showLanguagePicker(from);
      return NextResponse.json({ received: true });
    }

    if (greeting) {
      if (await hasBooking(from)) {
        await resumeBooking(from);
        return NextResponse.json({ received: true });
      }
      runInBackground(clearBooking(from), "WhatsApp clear booking error");
      runInBackground(clearConversation(from), "WhatsApp clear conversation error");
      await showLanguagePicker(from);
      return NextResponse.json({ received: true });
    }

    const language = await selectLanguage(from, userMessage);
    if (language) {
      await showMainMenu(from);
      return NextResponse.json({ received: true });
    }

    if (matchesAny(userMessage, ["cancel", "cancel booking", "cancel_booking", "कैंसल", "रद्द", "नहीं", "नको"])) {
      const copy = menuCopyFor(await currentLanguage(from));
      await clearBooking(from);
      await sendTextMessage(from, copy.cancelled);
      return NextResponse.json({ received: true });
    }

    if (userMessage === "CONTINUE_BOOKING") {
      await resumeBooking(from);
      return NextResponse.json({ received: true });
    }

    if (userMessage.startsWith("RESCHEDULE_APPOINTMENT_")) {
      const appointmentId = Number(userMessage.replace("RESCHEDULE_APPOINTMENT_", ""));
      if (Number.isInteger(appointmentId)) {
        await startReschedule(from, appointmentId);
      }
      return NextResponse.json({ received: true });
    }

    if (await hasBooking(from)) {
      await continueBooking(from, userMessage);
      return NextResponse.json({ received: true });
    }

    const action = menuAction(userMessage);

    if (action === "BOOK_APPOINTMENT" || detectIntent(userMessage) === "BOOK_APPOINTMENT") {
      await startBooking(from);
      return NextResponse.json({ received: true });
    }

    if (action === "SERVICES") {
      const language = await currentLanguage(from);
      const copy = menuCopyFor(language);
      const serviceMessage = defaultServices.length
        ? `${copy.servicesTitle}\n\n${defaultServices.map((service) => `- ${service.name}${service.description ? `: ${service.description}` : ""}`).join("\n")}`
        : copy.servicesEmpty;
      await sendTextMessage(from, serviceMessage);
      return NextResponse.json({ received: true });
    }

    if (action === "CONTACT") {
      const copy = menuCopyFor(await currentLanguage(from));
      const contactMessage = [
        copy.contactTitle,
        clinicBrand.clinicName,
        `${copy.phone}: ${clinicBrand.phones.join(" / ")}`,
        `${copy.email}: ${clinicBrand.email}`,
        `${copy.address}: ${clinicBrand.address}`,
        "",
        copy.hours,
        copy.monFri,
        copy.saturday,
        copy.sunday,
      ].join("\n");
      await sendTextMessage(from, contactMessage);
      return NextResponse.json({ received: true });
    }

    await showMainMenu(from);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Unable to process webhook." }, { status: 500 });
  }
}
