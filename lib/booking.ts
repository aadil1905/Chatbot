import { saveAppointment } from "./appointment";
import { buildTimeSlots, defaultServices, getClinicConfiguration } from "./clinic-config";
import { sendListMessage, sendReplyButtons, sendTextMessage } from "./whatsapp";

export type BookingStep = "name" | "phone" | "date" | "custom_date" | "time" | "reason" | "confirm";
export interface BookingSession { step: BookingStep; patientName: string; phone: string; appointmentDate: string; appointmentTime: string; reason: string; }
export const bookings: Record<string, BookingSession> = {};
export const hasBooking = (userId: string) => !!bookings[userId];
export const clearBooking = (userId: string) => { delete bookings[userId]; };

const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); };
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const validName = (name: string) => /^[a-zA-Z ]{2,50}$/.test(name.trim());
const validPhone = (phone: string) => phone.replace(/\D/g, "").length === 10;
const customDate = (value: string) => /^\d{2}-\d{2}-\d{4}$/.test(value) && !Number.isNaN(new Date(value.split("-").reverse().join("-")).getTime());

async function askDate(userId: string) { await sendReplyButtons(userId, "Please choose an appointment date.", [{ id: "TODAY", title: "Today" }, { id: "TOMORROW", title: "Tomorrow" }, { id: "OTHER_DATE", title: "Other" }]); }
async function askTime(userId: string, date: string) {
  const clinic = await getClinicConfiguration();
  const day = new Date(`${date}T12:00:00`).getDay();
  const hours = clinic?.hours.find((item) => item.dayOfWeek === day);
  if (hours?.isClosed) { await sendTextMessage(userId, "The clinic is closed on that day. Please choose another date."); await askDate(userId); return; }
  const slots = hours ? buildTimeSlots(hours.openTime, hours.closeTime, hours.slotMinutes) : ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  await sendListMessage(userId, "Select your preferred time.", "Choose time", [{ title: "Available times", rows: slots.map((time) => ({ id: `TIME_${time}`, title: time })) }]);
}
async function askService(userId: string) {
  const clinic = await getClinicConfiguration();
  const services = clinic?.services.length ? clinic.services : defaultServices;
  await sendListMessage(userId, "What service would you like to book?", "Choose service", [{ title: "Dental services", rows: services.slice(0, 10).map((service) => ({ id: `SERVICE_${"id" in service ? service.id : service.name}`, title: service.name, description: service.description || `${service.durationMinutes} minutes` })) }]);
}

export async function startBooking(userId: string) {
  bookings[userId] = { step: "name", patientName: "", phone: "", appointmentDate: "", appointmentTime: "", reason: "" };
  const clinic = await getClinicConfiguration();
  await sendTextMessage(userId, clinic?.whatsapp?.bookingIntro || "Great! Let's book your appointment. Please enter your full name.");
}

export async function continueBooking(userId: string, message: string) {
  const booking = bookings[userId]; if (!booking) return;
  const input = message.trim();
  if (booking.step === "name") { if (!validName(input)) return void await sendTextMessage(userId, "Please enter a valid full name."); booking.patientName = input; booking.step = "phone"; return void await sendTextMessage(userId, "Please enter your 10-digit mobile number."); }
  if (booking.step === "phone") { if (!validPhone(input)) return void await sendTextMessage(userId, "Please enter a valid 10-digit mobile number."); booking.phone = input.replace(/\D/g, ""); booking.step = "date"; return askDate(userId); }
  if (booking.step === "date") { if (input === "TODAY") booking.appointmentDate = todayISO(); else if (input === "TOMORROW") booking.appointmentDate = tomorrowISO(); else if (input === "OTHER_DATE") { booking.step = "custom_date"; return void await sendTextMessage(userId, "Please enter the date in DD-MM-YYYY format."); } else return askDate(userId); booking.step = "time"; return askTime(userId, booking.appointmentDate); }
  if (booking.step === "custom_date") { if (!customDate(input)) return void await sendTextMessage(userId, "Invalid date. Please use DD-MM-YYYY."); const [day, month, year] = input.split("-"); booking.appointmentDate = `${year}-${month}-${day}`; booking.step = "time"; return askTime(userId, booking.appointmentDate); }
  if (booking.step === "time") { if (!input.startsWith("TIME_")) return askTime(userId, booking.appointmentDate); booking.appointmentTime = input.slice(5); booking.step = "reason"; return askService(userId); }
  if (booking.step === "reason") { if (!input.startsWith("SERVICE_")) return askService(userId); const clinic = await getClinicConfiguration(); const idOrName = input.slice(8); booking.reason = clinic?.services.find((service) => String(service.id) === idOrName)?.name || defaultServices.find((service) => service.name === idOrName)?.name || idOrName.replace(/_/g, " "); booking.step = "confirm"; return sendReplyButtons(userId, `Please confirm your appointment\n\nName: ${booking.patientName}\nPhone: ${booking.phone}\nDate: ${formatDate(booking.appointmentDate)}\nTime: ${booking.appointmentTime}\nService: ${booking.reason}`, [{ id: "CONFIRM_BOOKING", title: "Confirm" }, { id: "CANCEL_BOOKING", title: "Cancel" }]); }
  if (booking.step === "confirm") { if (input === "CANCEL_BOOKING") { clearBooking(userId); return void await sendTextMessage(userId, "Appointment booking cancelled."); } if (input !== "CONFIRM_BOOKING") return void await sendReplyButtons(userId, "Please choose an option.", [{ id: "CONFIRM_BOOKING", title: "Confirm" }, { id: "CANCEL_BOOKING", title: "Cancel" }]); try { await saveAppointment({ name: booking.patientName, phone: booking.phone, date: booking.appointmentDate, time: booking.appointmentTime, reason: booking.reason }); await sendTextMessage(userId, `Your appointment has been booked successfully!\n\n${formatDate(booking.appointmentDate)} at ${booking.appointmentTime}\n\nThank you. We look forward to seeing you.`); } catch (error) { console.error("Booking Error:", error); await sendTextMessage(userId, "Sorry, something went wrong while booking your appointment. Please try again."); } clearBooking(userId); }
}
