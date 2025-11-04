import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";
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

  const hash = async (plain: string) => await bcrypt.hash(plain, 10);

  const usersData = [
    {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@example.com",
      xpLevel: 250,
      rating: 4.8,
      password: await hash("juan1234"),
      classroomAddress: "Av. Corrientes 1234, CABA",
      onlineClassroomLink: "https://meet.google.com/juan123",
      contactData: "Tel: +54 9 11 5555-1111\nWhatsApp: +54 9 11 5555-1111\nEmail alternativo: juan.perez@correo.com",
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
      contactData: "Tel: +54 9 341 444-2233\nInstagram: @mariatutora\nEmail alternativo: maria.gonzalez@correo.com",
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
      contactData: "WhatsApp: +54 9 351 555-8899\nTelegram: @facututor",
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
    {
      firstName: "Valentina",
      lastName: "Fernández",
      email: "valentina.fernandez@example.com",
      xpLevel: 120,
      password: await hash("valen1234"),
      contactData: "Email alternativo: valen.fernandez@correo.com\nLinkedIn: linkedin.com/in/valenfdez",
    },
  ];

  await prisma.user.createMany({ data: usersData });

  await prisma.subject.createMany({
    data: [
      { name: "Álgebra", iconUrl: "https://i.imgur.com/jIpS6Yc.png" },
      { name: "Física I", iconUrl: "https://i.imgur.com/9tWzU8R.png" },
      { name: "Inglés", iconUrl: "https://i.imgur.com/xMS3qHM.jpeg" },
      { name: "Química", iconUrl: "https://i.imgur.com/zBLS1aO.png" },
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

  const [algebra, fisica, ingles, quimica, baseDatos, programacion] = await prisma.subject.findMany({
    where: { name: { in: ["Álgebra", "Física I", "Inglés", "Química", "Base de datos", "Programación"] } },
    orderBy: { id: "asc" },
  });

  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: juan.id, subjectId: algebra.id },
      { tutorId: juan.id, subjectId: programacion.id },
      { tutorId: maria.id, subjectId: fisica.id },
      { tutorId: facundo.id, subjectId: algebra.id },
      { tutorId: facundo.id, subjectId: baseDatos.id },
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

    if (slots.length > 0) await prisma.classSlot.createMany({ data: slots });
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
