import { NextRequest, NextResponse } from "next/server";
import {
  sendReplyButtons,
  sendTextMessage,
} from "@/lib/whatsapp";
import {
  bookings,
  clearBooking,
  continueBooking,
  hasBooking,
  startBooking,
} from "@/lib/booking";
import { getAIReply, clearConversation } from "@/lib/ai";
import { detectIntent } from "@/lib/intent";

console.log("Webhook route loaded");

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    return new Response(challenge!, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const from = message.from;

    let userMessage = "";

    // Text message
    if (message.type === "text") {
      userMessage = message.text?.body ?? "";
    }

    // Interactive Button
    else if (
      message.type === "interactive" &&
      message.interactive?.type === "button_reply"
    ) {
      userMessage =
        message.interactive.button_reply.id;
    }

    // Interactive List
    else if (
      message.type === "interactive" &&
      message.interactive?.type === "list_reply"
    ) {
      userMessage =
        message.interactive.list_reply.id;
    }

    else {
      return NextResponse.json({
        received: true,
      });
    }

    const normalized =
      userMessage.toLowerCase().trim();

    // Restart
    if (
      ["hi", "hello", "hey", "menu", "start"].includes(
        normalized
      )
    ) {
      clearBooking(from);
      clearConversation(from);

      await sendReplyButtons(
        from,
        "👋 Welcome to AI Patient Concierge\n\nHow can I help you today?",
        [
          {
            id: "BOOK_APPOINTMENT",
            title: "📅 Book",
          },
          {
            id: "SERVICES",
            title: "🩺 Services",
          },
          {
            id: "CONTACT",
            title: "📞 Contact",
          },
        ]
      );

      return NextResponse.json({
        received: true,
      });
    }

    // Cancel
    if (
      normalized === "cancel" ||
      normalized === "cancel_booking"
    ) {
      clearBooking(from);

      await sendTextMessage(
        from,
        "❌ Booking cancelled."
      );

      return NextResponse.json({
        received: true,
      });
    }

    // Continue booking
    if (hasBooking(from)) {
      await continueBooking(from, userMessage);

      return NextResponse.json({
        received: true,
      });
    }

    // Book button
    if (
      userMessage === "BOOK_APPOINTMENT" ||
      detectIntent(userMessage) ===
        "BOOK_APPOINTMENT"
    ) {
      await startBooking(from);

      return NextResponse.json({
        received: true,
      });
    }

    // AI Conversation
    const aiReply = await getAIReply(
      from,
      userMessage
    );

    await sendTextMessage(
      from,
      aiReply.message
    );

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}