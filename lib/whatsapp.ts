const API_URL = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;

const headers = {
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  "Content-Type": "application/json",
};

async function sendRequest(payload: any) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp API Error");
    console.error(JSON.stringify(data, null, 2));

    throw new Error(
      data?.error?.message ||
      "Failed to send WhatsApp message"
    );
  }

  return data;
}

export async function sendTextMessage(
  to: string,
  message: string
) {
  return sendRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: message,
    },
  });
}

export async function sendReplyButtons(
  to: string,
  bodyText: string,
  buttons: {
    id: string;
    title: string;
  }[]
) {
  return sendRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: bodyText,
      },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title.substring(0, 20),
          },
        })),
      },
    },
  });
}

export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: {
    title: string;
    rows: {
      id: string;
      title: string;
      description?: string;
    }[];
  }[]
) {
  return sendRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: {
        text: bodyText,
      },
      action: {
        button: buttonText.substring(0, 20),
        sections: sections.map((section) => ({
          title: section.title.substring(0, 24),
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title.substring(0, 24),
            ...(row.description
              ? {
                  description: row.description.substring(0, 72),
                }
              : {}),
          })),
        })),
      },
    },
  });
}