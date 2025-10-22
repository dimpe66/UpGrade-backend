import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  const tutores = await prisma.user.createMany({
    data: [
      { firstName: "Juan", lastName: "Pérez", email: "juan.perez@example.com", xpLevel: 250, rating: 4.8 },
      { firstName: "María", lastName: "González", email: "maria.gonzalez@example.com", xpLevel: 180, rating: 4.6 },
      { firstName: "Facundo", lastName: "López", email: "facundo.lopez@example.com", xpLevel: 320, rating: 4.9 },
    ],
  });

  const estudiantes = await prisma.user.createMany({
    data: [
      { firstName: "Lucía", lastName: "Martínez", email: "lucia.martinez@example.com", xpLevel: 90 },
      { firstName: "Santiago", lastName: "Ruiz", email: "santiago.ruiz@example.com", xpLevel: 70 },
      { firstName: "Valentina", lastName: "Fernández", email: "valentina.fernandez@example.com", xpLevel: 120 },
    ],
  });

  const materias = await prisma.subject.createMany({
    data: [
      { name: "Cálculo Elemental" },
      { name: "Física I" },
      { name: "Álgebra y Geometría Analítica" },
      { name: "Programación I" },
      { name: "Química General" },
    ],
  });

  const tutorJuan = await prisma.user.findUnique({ where: { email: "juan.perez@example.com" } });
  const tutorMaria = await prisma.user.findUnique({ where: { email: "maria.gonzalez@example.com" } });
  const tutorFacundo = await prisma.user.findUnique({ where: { email: "facundo.lopez@example.com" } });

  const estudianteLucia = await prisma.user.findUnique({ where: { email: "lucia.martinez@example.com" } });
  const estudianteSantiago = await prisma.user.findUnique({ where: { email: "santiago.ruiz@example.com" } });

  const materiaCalculo = await prisma.subject.findFirst({ where: { name: "Cálculo Elemental" } });
  const materiaFisica = await prisma.subject.findFirst({ where: { name: "Física I" } });

  const disponibilidadJuan = await prisma.tutorAvailability.create({
    data: {
      tutorId: tutorJuan!.id,
      weekday: 1,
      startTime: "09:00",
      endTime: "11:00",
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-12-01"),
    },
  });

  const disponibilidadMaria = await prisma.tutorAvailability.create({
    data: {
      tutorId: tutorMaria!.id,
      weekday: 3,
      startTime: "14:00",
      endTime: "16:00",
      startDate: new Date("2025-10-20"),
      endDate: new Date("2025-12-01"),
    },
  });

  const generarSlots = async (tutorId: number, availability: any) => {
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
  };

  await generarSlots(tutorJuan!.id, disponibilidadJuan);
  await generarSlots(tutorMaria!.id, disponibilidadMaria);

  const primerSlotJuan = await prisma.classSlot.findFirst({ where: { tutorId: tutorJuan!.id } });
  if (primerSlotJuan && estudianteLucia && materiaCalculo) {
    await prisma.lesson.create({
      data: {
        slotId: primerSlotJuan.id,
        studentId: estudianteLucia.id,
        tutorId: tutorJuan!.id,
        subjectId: materiaCalculo.id,
        modality: Modality.ONLINE,
        timestamp: primerSlotJuan.date,
        status: LessonStatus.PENDING,
      },
    });

    await prisma.classSlot.update({
      where: { id: primerSlotJuan.id },
      data: {
        status: SlotStatus.RESERVED,
        reservedById: estudianteLucia.id,
        subjectId: materiaCalculo.id,
      },
    });
  }

  const primerSlotMaria = await prisma.classSlot.findFirst({ where: { tutorId: tutorMaria!.id } });
  if (primerSlotMaria && estudianteSantiago && materiaFisica) {
    await prisma.lesson.create({
      data: {
        slotId: primerSlotMaria.id,
        studentId: estudianteSantiago.id,
        tutorId: tutorMaria!.id,
        subjectId: materiaFisica.id,
        modality: Modality.ONSITE,
        timestamp: primerSlotMaria.date,
        status: LessonStatus.PENDING,
      },
    });

    await prisma.classSlot.update({
      where: { id: primerSlotMaria.id },
      data: {
        status: SlotStatus.RESERVED,
        reservedById: estudianteSantiago.id,
        subjectId: materiaFisica.id,
      },
    });
  }

  console.log("✅ Seed completado ");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
