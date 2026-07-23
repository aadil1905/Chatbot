export async function sendMainMenu(to: string) {
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
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "🦷 Welcome to Smile Dental Clinic!\n\nHow can I help you today?",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "book_appointment",
                  title: "📅 Book",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "dental_advice",
                  title: "🦷 Advice",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "clinic_info",
                  title: "ℹ️ Info",
                },
              },
            ],
          },
        },
      }),
    }
  );

  return response.json();
}