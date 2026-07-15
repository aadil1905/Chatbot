export type Booking = {
  step: "name" | "phone" | "date" | "time" | "reason" | "done";
  name: string;
  phone: string;
  date: string;
  time: string;
  reason: string;
};

export const bookings: Record<string, Booking> = {};