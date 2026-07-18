import { sendReplyButtons, sendListMessage, sendTextMessage } from "./whatsapp";
import { saveAppointment } from "./appointment";

export type BookingStep =
  | "name"
  | "phone"
  | "date"
  | "custom_date"
  | "time"
  | "reason"
  | "confirm";

export interface BookingSession {
  step: BookingStep;
  patientName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

export const bookings: Record<string, BookingSession> = {};

export function hasBooking(userId: string) {
  return !!bookings[userId];
}

export function clearBooking(userId: string) {
  delete bookings[userId];
}

export async function startBooking(userId: string) {
  bookings[userId] = {
    step: "name",
    patientName: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  };

  await sendTextMessage(
    userId,
    "👋 Great! Let's book your appointment.\n\nPlease enter your full name."
  );
}

function isValidName(name: string) {
  return /^[a-zA-Z ]{2,50}$/.test(name.trim());
}

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
}

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDate(date: string) {
  const d = new Date(date);

  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isValidCustomDate(input: string) {
  const regex = /^\d{2}-\d{2}-\d{4}$/;

  if (!regex.test(input)) return false;

  const [dd, mm, yyyy] = input.split("-");

  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd)
  );

  if (isNaN(date.getTime())) return false;

  return true;
}

function convertToISO(input: string) {
  const [dd, mm, yyyy] = input.split("-");

  return `${yyyy}-${mm}-${dd}`;
}

async function askDate(userId: string) {
  await sendReplyButtons(
    userId,
    "📅 Please choose an appointment date.",
    [
      {
        id: "TODAY",
        title: "Today",
      },
      {
        id: "TOMORROW",
        title: "Tomorrow",
      },
      {
        id: "OTHER_DATE",
        title: "Other",
      },
    ]
  );
}

async function askTime(userId: string) {
  await sendListMessage(
    userId,
    "🕒 Select a preferred time.",
    "Choose Time",
    [
      {
        title: "Morning",
        rows: [
          {
            id: "TIME_09:00",
            title: "09:00 AM",
          },
          {
            id: "TIME_10:00",
            title: "10:00 AM",
          },
          {
            id: "TIME_11:00",
            title: "11:00 AM",
          },
        ],
      },
      {
        title: "Afternoon",
        rows: [
          {
            id: "TIME_02:00",
            title: "02:00 PM",
          },
          {
            id: "TIME_03:00",
            title: "03:00 PM",
          },
          {
            id: "TIME_04:00",
            title: "04:00 PM",
          },
        ],
      },
      {
        title: "Evening",
        rows: [
          {
            id: "TIME_05:00",
            title: "05:00 PM",
          },
          {
            id: "TIME_06:00",
            title: "06:00 PM",
          },
          {
            id: "TIME_07:00",
            title: "07:00 PM",
          },
        ],
      },
    ]
  );
}
export async function continueBooking(
  userId: string,
  message: string
) {
  const booking = bookings[userId];

  if (!booking) return;

  const input = message.trim();

  switch (booking.step) {
    case "name": {
      if (!isValidName(input)) {
        await sendTextMessage(
          userId,
          "❌ Please enter a valid full name."
        );
        return;
      }

      booking.patientName = input;
      booking.step = "phone";

      await sendTextMessage(
        userId,
        "📱 Please enter your 10-digit mobile number."
      );

      return;
    }

    case "phone": {
      if (!isValidPhone(input)) {
        await sendTextMessage(
          userId,
          "❌ Please enter a valid 10-digit mobile number."
        );
        return;
      }

      booking.phone = input.replace(/\D/g, "");
      booking.step = "date";

      await askDate(userId);

      return;
    }

    case "date": {
      if (input === "TODAY") {
        booking.appointmentDate = todayISO();
      }

      else if (input === "TOMORROW") {
        booking.appointmentDate = tomorrowISO();
      }

      else if (input === "OTHER_DATE") {
        booking.step = "custom_date";

        await sendTextMessage(
          userId,
          "📅 Please enter the date in DD-MM-YYYY format."
        );

        return;
      }

      else {
        await askDate(userId);
        return;
      }

      booking.step = "time";

      await askTime(userId);

      return;
    }

    case "custom_date": {
      if (!isValidCustomDate(input)) {
        await sendTextMessage(
          userId,
          "❌ Invalid date.\n\nPlease use DD-MM-YYYY."
        );

        return;
      }

      booking.appointmentDate = convertToISO(input);
      booking.step = "time";

      await askTime(userId);

      return;
    }
        case "time": {
      if (!input.startsWith("TIME_")) {
        await askTime(userId);
        return;
      }

      booking.appointmentTime = input.replace("TIME_", "");

      booking.step = "reason";

      await sendListMessage(
        userId,
        "🩺 What is the reason for your appointment?",
        "Select Reason",
        [
          {
            title: "Consultation",
            rows: [
              {
                id: "GENERAL_CHECKUP",
                title: "General Checkup",
              },
              {
                id: "FOLLOW_UP",
                title: "Follow-up Visit",
              },
              {
                id: "NEW_CONSULTATION",
                title: "New Consultation",
              },
            ],
          },
          {
            title: "Health Concerns",
            rows: [
              {
                id: "FEVER",
                title: "Fever / Cold",
              },
              {
                id: "PAIN",
                title: "Pain",
              },
              {
                id: "OTHER",
                title: "Other",
              },
            ],
          },
        ]
      );

      return;
    }

    case "reason": {
      booking.reason = input.replace(/_/g, " ");

      booking.step = "confirm";

      await sendReplyButtons(
        userId,
        `📋 Please confirm your appointment

👤 Name: ${booking.patientName}

📱 Phone: ${booking.phone}

📅 Date: ${formatDate(booking.appointmentDate)}

🕒 Time: ${booking.appointmentTime}

🩺 Reason: ${booking.reason}`,
        [
          {
            id: "CONFIRM_BOOKING",
            title: "✅ Confirm",
          },
          {
            id: "CANCEL_BOOKING",
            title: "❌ Cancel",
          },
        ]
      );

      return;
    }

    case "confirm": {

      if (input === "CANCEL_BOOKING") {

        clearBooking(userId);

        await sendTextMessage(
          userId,
          "❌ Appointment booking cancelled."
        );

        return;
      }

      if (input !== "CONFIRM_BOOKING") {

        await sendReplyButtons(
          userId,
          "Please choose an option.",
          [
            {
              id: "CONFIRM_BOOKING",
              title: "✅ Confirm",
            },
            {
              id: "CANCEL_BOOKING",
              title: "❌ Cancel",
            },
          ]
        );

        return;
      }
            try {
        await saveAppointment({
          name: booking.patientName,
          phone: booking.phone,
          date: booking.appointmentDate,
          time: booking.appointmentTime,
          reason: booking.reason,
        });

        await sendTextMessage(
          userId,
          `✅ Your appointment has been booked successfully!

📅 ${formatDate(booking.appointmentDate)}
🕒 ${booking.appointmentTime}

Thank you! We look forward to seeing you.`
        );
      } catch (error) {
        console.error("Booking Error:", error);

        await sendTextMessage(
          userId,
          "❌ Sorry, something went wrong while booking your appointment. Please try again."
        );
      }

      clearBooking(userId);
      return;
    }

    default: {
      clearBooking(userId);

      await sendTextMessage(
        userId,
        "⚠️ Your booking session expired. Please type *Hi* to start again."
      );

      return;
    }
  }
}