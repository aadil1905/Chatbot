const API_URL = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`;

const headers = {
  Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  "Content-Type": "application/json",
};

export async function sendTextMessage(
  to: string,
  message: string
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    }),
  });

  return response.json();
}

export async function sendReplyButtons(
  to: string,
  bodyText: string,
  buttons: {
    id: string;
    title: string;
  }[]
) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    }),
  });

  return response.json();
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
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text: bodyText,
        },
        action: {
          button: buttonText,
          sections,
        },
      },
    }),
  });

  return response.json();
}