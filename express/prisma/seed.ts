import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.lesson.deleteMany();
  await prisma.classSlot.deleteMany();
  await prisma.tutorAvailability.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { firstName: "Juan", lastName: "Pérez", email: "juan.perez@example.com", xpLevel: 250, rating: 4.8 },
      { firstName: "María", lastName: "González", email: "maria.gonzalez@example.com", xpLevel: 180, rating: 4.6 },
      { firstName: "Facundo", lastName: "López", email: "facundo.lopez@example.com", xpLevel: 320, rating: 4.9 },
      { firstName: "Lucía", lastName: "Martínez", email: "lucia.martinez@example.com", xpLevel: 90 },
      { firstName: "Santiago", lastName: "Ruiz", email: "santiago.ruiz@example.com", xpLevel: 70 },
      { firstName: "Valentina", lastName: "Fernández", email: "valentina.fernandez@example.com", xpLevel: 120 },
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
  });

  const [lucia, santiago] = await prisma.user.findMany({
    where: { email: { in: ["lucia.martinez@example.com", "santiago.ruiz@example.com"] } },
  });

  const [calculo, fisica, algebra] = await prisma.subject.findMany({
    where: { name: { in: ["Cálculo Elemental", "Física I", "Álgebra y Geometría Analítica"] } },
  });

  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: juan.id, subjectId: calculo.id },
      { tutorId: juan.id, subjectId: algebra.id },
      { tutorId: maria.id, subjectId: fisica.id },
      { tutorId: facundo.id, subjectId: algebra.id },
      { tutorId: facundo.id, subjectId: calculo.id },
    ],
  });

  const availJuan = await prisma.tutorAvailability.create({
    data: {
      tutorId: juan.id,
      weekday: 1,
      startTime: "09:00",
      endTime: "11:00",
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-12-01"),
    },
  });

  const availMaria = await prisma.tutorAvailability.create({
    data: {
      tutorId: maria.id,
      weekday: 3,
      startTime: "14:00",
      endTime: "16:00",
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-12-01"),
    },
  });

  async function generarSlots(tutorId: number, availability: any) {
    const slots: any[] = [];
    let current = new Date(availability.startDate);

    while (isBefore(current, availability.endDate)) {
      if (current.getDay() === availability.weekday) {
        slots.push({
          tutorId,
          date: current,
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

    if (slots.length > 0) {
      await prisma.classSlot.createMany({ data: slots });
    }
  }

  await generarSlots(juan.id, availJuan);
  await generarSlots(maria.id, availMaria);

  const primerSlotJuan = await prisma.classSlot.findFirst({ where: { tutorId: juan.id } });
  const primerSlotMaria = await prisma.classSlot.findFirst({ where: { tutorId: maria.id } });

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
        subjectId: calculo.id,
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
