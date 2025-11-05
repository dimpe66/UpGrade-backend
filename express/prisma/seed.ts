import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, addDays, startOfWeek, isBefore, addDays as addRealDays } from "date-fns";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.lesson.deleteMany();
  await prisma.classSlot.deleteMany();
  await prisma.tutorAvailability.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const hash = (s: string) => bcrypt.hash(s, 10);

  // 👩‍🏫 Usuarios base
  await prisma.user.createMany({
    data: [
      {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        xpLevel: 250,
        rating: 4.8,
        password: await hash("juan1234"),
        classroomAddress: "Av. Corrientes 1234, CABA",
        onlineClassroomLink: "https://meet.google.com/juan123",
        contactData: "Tel: +54 9 11 5555-1111\nWhatsApp: +54 9 11 5555-1111",
      },
      {
        firstName: "María",
        lastName: "González",
        email: "maria.gonzalez@example.com",
        xpLevel: 180,
        rating: 4.6,
        password: await hash("maria1234"),
        classroomAddress: "Belgrano 456, Rosario",
        onlineClassroomLink: "https://zoom.us/maria-class",
        contactData: "Tel: +54 9 341 444-2233\nInstagram: @mariatutora",
      },
      {
        firstName: "Facundo",
        lastName: "López",
        email: "facundo.lopez@example.com",
        xpLevel: 320,
        rating: 4.9,
        password: await hash("facu1234"),
        classroomAddress: "San Martín 890, Córdoba",
        onlineClassroomLink: "https://meet.google.com/facu-class",
        contactData: "WhatsApp: +54 9 351 555-8899",
      },
      {
        firstName: "Lucía",
        lastName: "Martínez",
        email: "lucia.martinez@example.com",
        xpLevel: 90,
        password: await hash("lucia1234"),
        contactData: "Tel: +54 9 11 4444-7777",
      },
      {
        firstName: "Santiago",
        lastName: "Ruiz",
        email: "santiago.ruiz@example.com",
        xpLevel: 70,
        password: await hash("santi1234"),
        contactData: "Tel: +54 9 261 222-9999",
      },
    ],
  });

  // 📚 Materias
  await prisma.subject.createMany({
    data: [
      { name: "Álgebra", iconUrl: "https://i.imgur.com/jIpS6Yc.png" },
      { name: "Física I", iconUrl: "https://i.imgur.com/9tWzU8R.png" },
      { name: "Base de datos", iconUrl: "https://i.imgur.com/VcD96qH.png" },
      { name: "Programación", iconUrl: "https://i.imgur.com/rwxZgqE.png" },
    ],
  });

  const [juan, maria, facundo] = await prisma.user.findMany({
    where: { email: { in: ["juan.perez@example.com", "maria.gonzalez@example.com", "facundo.lopez@example.com"] } },
    orderBy: { id: "asc" },
  });

  const [lucia, santiago] = await prisma.user.findMany({
    where: { email: { in: ["lucia.martinez@example.com", "santiago.ruiz@example.com"] } },
    orderBy: { id: "asc" },
  });

  const [algebra, fisica, baseDatos, programacion] = await prisma.subject.findMany({
    orderBy: { id: "asc" },
  });

  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: juan.id, subjectId: algebra.id },
      { tutorId: juan.id, subjectId: programacion.id },
      { tutorId: maria.id, subjectId: fisica.id },
      { tutorId: facundo.id, subjectId: baseDatos.id },
    ],
  });

  // 🕓 Disponibilidades
  const availJuan = await prisma.tutorAvailability.create({
    data: {
      tutorId: juan.id,
      weekdays: [1, 3], // lunes y miércoles
      timeBlocks: [{ start: "09:00", end: "11:00" }, { start: "14:00", end: "15:00" }],
    },
  });
  const availMaria = await prisma.tutorAvailability.create({
    data: { tutorId: maria.id, weekdays: [2, 4], timeBlocks: [{ start: "15:00", end: "17:00" }] },
  });
  const availFacu = await prisma.tutorAvailability.create({
    data: { tutorId: facundo.id, weekdays: [1, 5], timeBlocks: [{ start: "18:00", end: "20:00" }] },
  });

  // 🗓️ Generador de slots desde hoy hacia adelante
  const generateWeeklySlots = async (tutorId: number, availability: any, weeks: number) => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const slots: any[] = [];

    for (let w = 0; w < weeks; w++) {
      const baseWeek = addWeeks(monday, w);
      const days = Array.isArray(availability.weekdays) ? (availability.weekdays as number[]) : [];
      const blocks = Array.isArray(availability.timeBlocks) ? (availability.timeBlocks as any[]) : [];

      for (const day of days) {
        const slotDate = addDays(baseWeek, day);
        // saltar si la fecha está en el pasado
        if (isBefore(slotDate, today)) continue;

        for (const block of blocks) {
          const [hour, minute] = block.start.split(":").map(Number);
          const dateWithTime = new Date(slotDate);
          dateWithTime.setHours(hour, minute, 0, 0);

          slots.push({
            tutorId,
            date: dateWithTime,
            startTime: block.start,
            endTime: block.end,
            status: SlotStatus.AVAILABLE,
            deleted: false,
          });
        }
      }
    }

    if (slots.length) await prisma.classSlot.createMany({ data: slots });
  };

  await generateWeeklySlots(juan.id, availJuan, 3);
  await generateWeeklySlots(maria.id, availMaria, 3);
  await generateWeeklySlots(facundo.id, availFacu, 3);

  // 🎓 Crear 1 clase pendiente por tutor
  const primerSlotJuan = await prisma.classSlot.findFirst({ where: { tutorId: juan.id }, orderBy: { date: "asc" } });
  const primerSlotMaria = await prisma.classSlot.findFirst({ where: { tutorId: maria.id }, orderBy: { date: "asc" } });

  if (primerSlotJuan && lucia) {
    await prisma.classSlot.update({
      where: { id: primerSlotJuan.id },
      data: { status: SlotStatus.RESERVED, reservedById: lucia.id },
    });
    await prisma.lesson.create({
      data: {
        slotId: primerSlotJuan.id,
        studentId: lucia.id,
        tutorId: juan.id,
        subjectId: programacion.id,
        modality: Modality.ONLINE,
        timestamp: primerSlotJuan.date,
        status: LessonStatus.PENDING,
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
        slotId: primerSlotMaria.id,
        studentId: santiago.id,
        tutorId: maria.id,
        subjectId: fisica.id,
        modality: Modality.ONSITE,
        timestamp: primerSlotMaria.date,
        status: LessonStatus.PENDING,
      },
    });
  }

  console.log("✅ Seed completado con éxito (slots futuros generados).");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
