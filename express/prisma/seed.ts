import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";
import { hashPassword } from "../src/auth/password";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  
  await prisma.lesson.deleteMany().catch(()=>{});
  await prisma.classSlot.deleteMany();
  await prisma.tutorAvailability.deleteMany();
  await prisma.tutorSubject?.deleteMany?.().catch(()=>{}); // si existe en tu schema
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  
  const passwordHash = await hashPassword("Demo1234!");

  await prisma.user.createMany({
    data: [
      { firstName: "Juan",      lastName: "Pérez",      email: "juan.perez@example.com",      xpLevel: 250, rating: 4.8, passwordHash },
      { firstName: "María",     lastName: "González",   email: "maria.gonzalez@example.com",  xpLevel: 180, rating: 4.6, passwordHash },
      { firstName: "Facundo",   lastName: "López",      email: "facundo.lopez@example.com",   xpLevel: 320, rating: 4.9, passwordHash },
      { firstName: "Lucía",     lastName: "Martínez",   email: "lucia.martinez@example.com",  xpLevel:  90,                 passwordHash },
      { firstName: "Santiago",  lastName: "Ruiz",       email: "santiago.ruiz@example.com",   xpLevel:  70,                 passwordHash },
      { firstName: "Valentina", lastName: "Fernández",  email: "valentina.fernandez@example.com", xpLevel: 120,              passwordHash },
    ],
  });

  await prisma.subject.createMany({
    data: [
      { name: "Cálculo Elemental" },
      { name: "Física I" },
      { name: "Álgebra y Geometría Analítica" },
      { name: "Programación I" },
      { name: "Química General" },
    ],
  });

  const [juan, maria, facundo] = await prisma.user.findMany({
    where: { email: { in: ["juan.perez@example.com", "maria.gonzalez@example.com", "facundo.lopez@example.com"] } },
    orderBy: { id: "asc" },
    take: 3,
  });

  const [lucia, santiago] = await prisma.user.findMany({
    where: { email: { in: ["lucia.martinez@example.com", "santiago.ruiz@example.com"] } },
    orderBy: { id: "asc" },
    take: 2,
  });

  const [calculo, fisica, algebra] = await prisma.subject.findMany({
    where: { name: { in: ["Cálculo Elemental", "Física I", "Álgebra y Geometría Analítica"] } },
    orderBy: { id: "asc" },
    take: 3,
  });

  // si tu modelo tutorSubject existe:
  if ((prisma as any).tutorSubject) {
    await (prisma as any).tutorSubject.createMany({
      data: [
        { tutorId: juan.id,   subjectId: calculo.id },
        { tutorId: juan.id,   subjectId: algebra.id },
        { tutorId: maria.id,  subjectId: fisica.id },
        { tutorId: facundo.id,subjectId: algebra.id },
        { tutorId: facundo.id,subjectId: calculo.id },
      ],
    });
  }

  const availJuan = await prisma.tutorAvailability.create({
    data: {
      tutorId: juan.id,
      weekday: 1,                // lunes
      startTime: "09:00",
      endTime:   "11:00",
      startDate: new Date("2025-10-20"),
      endDate:   new Date("2025-12-01"),
    },
  });

  const availMaria = await prisma.tutorAvailability.create({
    data: {
      tutorId: maria.id,
      weekday: 3,                // miércoles
      startTime: "14:00",
      endTime:   "16:00",
      startDate: new Date("2025-10-20"),
      endDate:   new Date("2025-12-01"),
    },
  });

  async function generarSlots(tutorId: number, availability: { startDate: Date; endDate: Date; weekday: number; startTime: string; endTime: string; }) {
    const slots: any[] = [];
    let current = new Date(availability.startDate);

    while (isBefore(current, availability.endDate)) {
      if (current.getDay() === availability.weekday) {
        slots.push({
          tutorId,
          date: new Date(current),
          startTime: availability.startTime,
          endTime: availability.endTime,
          status: SlotStatus.AVAILABLE,
          deleted: false,
        });
        current = addWeeks(current, 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    if (slots.length) {
      await prisma.classSlot.createMany({ data: slots });
    }
  }

  await generarSlots(juan.id,  availJuan);
  await generarSlots(maria.id, availMaria);

  const primerSlotJuan  = await prisma.classSlot.findFirst({ where: { tutorId: juan.id  }, orderBy: { date: "asc" } });
  const primerSlotMaria = await prisma.classSlot.findFirst({ where: { tutorId: maria.id }, orderBy: { date: "asc" } });

  if (primerSlotJuan && lucia) {
    await prisma.classSlot.update({
      where: { id: primerSlotJuan.id },
      data: { status: SlotStatus.RESERVED, reservedById: lucia.id },
    });
    await prisma.lesson.create({
      data: {
        slotId:    primerSlotJuan.id,
        studentId: lucia.id,
        tutorId:   juan.id,
        subjectId: calculo.id,
        modality:  Modality.ONLINE,
        timestamp: primerSlotJuan.date,
        status:    LessonStatus.PENDING,
      },
    });
  }

  if (primerSlotMaria && santiago) {
    await prisma.classSlot.update({
      where: { id: primerSlotMaria.id },
      data: { status: SlotStatus.RESERVED, reservedById: santiago.id },
    });
    await prisma.lesson.create({
      data: {
        slotId:    primerSlotMaria.id,
        studentId: santiago.id,
        tutorId:   maria.id,
        subjectId: fisica.id,
        modality:  Modality.ONSITE,
        timestamp: primerSlotMaria.date,
        status:    LessonStatus.PENDING,
      },
    });
  }

  console.log("✅ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
