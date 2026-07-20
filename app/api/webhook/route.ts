import { NextRequest, NextResponse } from "next/server";
import { sendListMessage, sendReplyButtons, sendTextMessage } from "@/lib/whatsapp";
import { clearBooking, continueBooking, hasBooking, startBooking } from "@/lib/booking";
import { getAIReply, clearConversation } from "@/lib/ai";
import { detectIntent } from "@/lib/intent";
import { clearLanguage, selectLanguage, welcomeFor } from "@/lib/language";
import { getClinicConfiguration } from "@/lib/clinic-config";

export async function GET(req: NextRequest) { const mode = req.nextUrl.searchParams.get("hub.mode"); const token = req.nextUrl.searchParams.get("hub.verify_token"); const challenge = req.nextUrl.searchParams.get("hub.challenge"); if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) return new Response(challenge!, { status: 200, headers: { "Content-Type": "text/plain" } }); return new Response("Forbidden", { status: 403 }); }

async function showLanguagePicker(to: string) { await sendListMessage(to, "Welcome to DentalAI.\n\nPlease choose your language / कृपया अपनी भाषा चुनें / कृपया तुमची भाषा निवडा", "Choose language", [{ title: "Languages", rows: [{ id: "LANG_EN", title: "English" }, { id: "LANG_HI", title: "Hindi" }, { id: "LANG_HINGLISH", title: "Hinglish" }, { id: "LANG_MR", title: "Marathi" }] }]); }

export async function POST(req: NextRequest) {
  try { const body = await req.json(); const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]; if (!message) return NextResponse.json({ received: true }); const from = message.from; const userMessage = message.type === "text" ? message.text?.body ?? "" : message.type === "interactive" && message.interactive?.type === "button_reply" ? message.interactive.button_reply.id : message.type === "interactive" && message.interactive?.type === "list_reply" ? message.interactive.list_reply.id : ""; if (!userMessage) return NextResponse.json({ received: true }); const normalized = userMessage.toLowerCase().trim().replace(/[^\w\s]/g, ""); const greeting = /^(hi+|hey+|hello+|menu|start)$/i.test(normalized);
    if (greeting) { clearBooking(from); clearConversation(from); clearLanguage(from); await showLanguagePicker(from); return NextResponse.json({ received: true }); }
    const language = selectLanguage(from, userMessage); if (language) { const copy = await welcomeFor(language); await sendReplyButtons(from, copy.text, [{ id: "BOOK_APPOINTMENT", title: copy.book }, { id: "SERVICES", title: copy.services }, { id: "CONTACT", title: copy.contact }]); return NextResponse.json({ received: true }); }
    if (normalized === "cancel" || normalized === "cancel_booking") { clearBooking(from); await sendTextMessage(from, "Booking cancelled."); return NextResponse.json({ received: true }); }
    if (hasBooking(from)) { await continueBooking(from, userMessage); return NextResponse.json({ received: true }); }
    if (userMessage === "BOOK_APPOINTMENT" || detectIntent(userMessage) === "BOOK_APPOINTMENT") { await startBooking(from); return NextResponse.json({ received: true }); }
    if (userMessage === "SERVICES") { const clinic = await getClinicConfiguration(); const services = clinic?.services || []; const message = services.length ? `Our services:\n\n${services.map((service) => `• ${service.name}${service.description ? ` — ${service.description}` : ""}${service.price !== null ? ` (₹${service.price})` : ""}`).join("\n")}` : "Our service list is being updated. Please choose Book appointment to speak with us."; await sendTextMessage(from, message); return NextResponse.json({ received: true }); }
    if (userMessage === "CONTACT") { const clinic = await getClinicConfiguration(); const fallback = clinic ? `${clinic.name}\n${clinic.phone ? `Phone: ${clinic.phone}\n` : ""}${clinic.email ? `Email: ${clinic.email}\n` : ""}${clinic.address || ""}`.trim() : "Please contact the clinic directly for assistance."; await sendTextMessage(from, clinic?.whatsapp?.contactMessage || fallback); return NextResponse.json({ received: true }); }
    const aiReply = await getAIReply(from, userMessage); await sendTextMessage(from, aiReply.message); return NextResponse.json({ received: true });
  } catch (error) { console.error(error); return NextResponse.json({ success: false, error: String(error) }, { status: 500 }); }
}
