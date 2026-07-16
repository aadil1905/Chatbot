import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookings } from "@/lib/booking";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Temporary memory (resets when server restarts)
const conversations: Record<string, any[]> = {};

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  console.log("========== WEBHOOK VERIFY ==========");
  console.log("MODE:", mode);
  console.log("TOKEN FROM META:", token);
  console.log("TOKEN FROM ENV:", process.env.VERIFY_TOKEN);
  console.log("CHALLENGE:", challenge);

  if (
    mode === "subscribe" &&
    token === process.env.VERIFY_TOKEN
  ) {
    console.log("✅ Verification Success");

    return new Response(challenge!, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.log("❌ Verification Failed");

  return new Response("Verification failed", {
    status: 403,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Webhook:", JSON.stringify(body, null, 2));

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const from = message.from;
    const userMessage = message.text?.body ?? "";
const text = userMessage.toLowerCase();
   // Start appointment booking
if (
  text.includes("appointment") ||
  text.includes("book")
) {
  bookings[from] = {
    step: "name",
    name: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
  };

  await fetch(
    `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: "Sure! Let's book your appointment.\n\nWhat is your full name?",
        },
      }),
    }
  );
return NextResponse.json({ received: true });
}


 // Continue booking
if (bookings[from]) {
  const booking = bookings[from];

  switch (booking.step) {
    case "name":
      booking.name = userMessage;
      booking.step = "phone";

      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Please enter your phone number.",
            },
          }),
        }
      );

      return NextResponse.json({ received: true });
    


    case "phone":
      booking.phone = userMessage;
      booking.step = "date";

      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "What date would you like your appointment?",
            },
          }),
        }
      );

      return NextResponse.json({ received: true });

    case "date":
      booking.date = userMessage;
      booking.step = "time";

      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "What time would you prefer?",
            },
          }),
        }
      );

      return NextResponse.json({ received: true });

    case "time":
      booking.time = userMessage;
      booking.step = "reason";

      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "What is the reason for your visit?",
            },
          }),
        }
      );

      return NextResponse.json({ received: true });

    case "reason":
      booking.reason = userMessage;

      await prisma.appointment.create({
        data: {
          name: booking.name,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          reason: booking.reason,
        },
      });

      delete bookings[from];

      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { 
              
              body: "✅ Thank you! Your appointment request has been received. Our clinic will contact you shortly.",
            },
          }),
        }
      );

      return NextResponse.json({ received: true });


    

 
  }
}
      if (!conversations[from]) {
  conversations[from] = [
        {
          role: "system",
          content: `
You are Smile Dental Clinic's AI assistant.

Rules:
- Answer only dental-related questions.
- Be friendly and professional.
- Keep WhatsApp replies short.
- Never prescribe medicine.
- Never claim to diagnose disease.

If the user wants an appointment, collect:
1. Full Name
2. Phone Number
3. Preferred Date
4. Preferred Time
5. Reason for Visit

Ask ONLY ONE question at a time.

After collecting all details reply exactly:

Thank you. Your appointment request has been received. Our clinic will contact you shortly to confirm your appointment.

If the question is unrelated to dentistry, reply:

I'm the Smile Dental Clinic assistant, so I can only help with dental care and appointments.
`,
        },
      ];
    }

    conversations[from].push({
      role: "user",
      content: userMessage,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: conversations[from],
    });

    const aiReply =
      completion.choices[0].message.content ??
      "Sorry, I couldn't generate a response.";

    conversations[from].push({
      role: "assistant",
      content: aiReply,
    });

    console.log("AI Reply:", aiReply);

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: aiReply,
          },
        }),
      }
    );

    const result = await response.json();

    console.log("WhatsApp Response:", result);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);

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