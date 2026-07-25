import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env", override: false });

const prisma = new PrismaClient();

const services = [
  { name: "Dentures", description: "Removable replacement teeth for missing teeth", durationMinutes: 45, sortOrder: 1 },
  { name: "Implants", description: "Dental implant consultation and treatment planning", durationMinutes: 45, sortOrder: 2 },
  { name: "Root Canals", description: "Root canal consultation and treatment", durationMinutes: 45, sortOrder: 3 },
  { name: "Braces", description: "Orthodontic consultation for teeth alignment", durationMinutes: 45, sortOrder: 4 },
  { name: "Aesthetic Dentistry", description: "Cosmetic dental care and smile improvement", durationMinutes: 45, sortOrder: 5 },
  { name: "Kids Dentistry", description: "Dental care for children", durationMinutes: 30, sortOrder: 6 },
  { name: "Gum Treatment", description: "Gum health consultation and treatment", durationMinutes: 45, sortOrder: 7 },
  { name: "Extractions", description: "Tooth extraction consultation and procedure", durationMinutes: 45, sortOrder: 8 },
  { name: "Surgeries", description: "Dental and oral surgical consultation", durationMinutes: 60, sortOrder: 9 },
];

async function main() {
  const clinic = await prisma.clinic.findFirst({ orderBy: { id: "asc" } });

  if (!clinic) {
    console.log("No clinic found. Create the owner account first, then run this again.");
    return;
  }

  for (const service of services) {
    const existing = await prisma.clinicService.findFirst({
      where: { clinicId: clinic.id, name: service.name },
    });

    if (existing) {
      await prisma.clinicService.update({
        where: { id: existing.id },
        data: { ...service, active: true },
      });
    } else {
      await prisma.clinicService.create({
        data: { clinicId: clinic.id, ...service, active: true },
      });
    }
  }

  console.log(`Added or updated ${services.length} services for ${clinic.name}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
