import { PrismaClient, SlotStatus, LessonStatus, Modality } from "@prisma/client";
import { addWeeks, addDays, startOfWeek, isBefore } from "date-fns";
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
      // Tutores
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
        firstName: "Sofía",
        lastName: "Torres",
        email: "sofia.torres@example.com",
        xpLevel: 210,
        rating: 4.7,
        password: await hash("sofia1234"),
        classroomAddress: "Av. Independencia 234, Mendoza",
        onlineClassroomLink: "https://meet.google.com/sofia-class",
        contactData: "Email: sofia.torres@correo.com",
      },

      // Estudiantes
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
        firstName: "Camila",
        lastName: "Paredes",
        email: "camila.paredes@example.com",
        xpLevel: 100,
        password: await hash("camila1234"),
        contactData: "WhatsApp: +54 9 11 3333-6666",
      },
      {
        firstName: "Tomás",
        lastName: "Vega",
        email: "tomas.vega@example.com",
        xpLevel: 120,
        password: await hash("tomas1234"),
        contactData: "Tel: +54 9 221 222-5555",
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
      { name: "Matemática avanzada", iconUrl: "https://i.imgur.com/pI9B1sA.png" },
      { name: "Inglés", iconUrl: "https://i.imgur.com/xMS3qHM.jpeg" },
    ],
  });

  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const [juan, maria, facundo, sofia, lucia, santiago, camila, tomas] = users;
  const subjects = await prisma.subject.findMany({ orderBy: { id: "asc" } });
  const [algebra, fisica, baseDatos, programacion, matematica, ingles] = subjects;

  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: juan.id, subjectId: algebra.id },
      { tutorId: juan.id, subjectId: programacion.id },
      { tutorId: maria.id, subjectId: fisica.id },
      { tutorId: facundo.id, subjectId: baseDatos.id },
      { tutorId: sofia.id, subjectId: ingles.id },
      { tutorId: sofia.id, subjectId: matematica.id },
    ],
  });

  // 🕓 Disponibilidades
  const availJuan = await prisma.tutorAvailability.create({
    data: {
      tutorId: juan.id,
      weekdays: [1, 3],
      timeBlocks: [
        { start: "09:00", end: "11:00" },
        { start: "14:00", end: "15:00" },
      ],
    },
  });
  const availMaria = await prisma.tutorAvailability.create({
    data: { tutorId: maria.id, weekdays: [2, 4], timeBlocks: [{ start: "15:00", end: "17:00" }] },
  });
  const availFacu = await prisma.tutorAvailability.create({
    data: { tutorId: facundo.id, weekdays: [1, 5], timeBlocks: [{ start: "18:00", end: "20:00" }] },
  });
  const availSofia = await prisma.tutorAvailability.create({
    data: { tutorId: sofia.id, weekdays: [3, 5], timeBlocks: [{ start: "10:00", end: "12:00" }] },
  });

  // 🗓️ Función para generar slots futuros
  const generateWeeklySlots = async (tutorId: number, availability: any, weeks: number) => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    const slots: any[] = [];

    for (let w = 0; w < weeks; w++) {
      const baseWeek = addWeeks(monday, w);
      const days = Array.isArray(availability.weekdays) ? availability.weekdays : [];
      const blocks = Array.isArray(availability.timeBlocks) ? availability.timeBlocks : [];

      for (const day of days) {
        const slotDate = addDays(baseWeek, day);
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
  await generateWeeklySlots(sofia.id, availSofia, 3);

  // 🎓 Crear clases pendientes
  const [slotJuan, slotMaria, slotFacu, slotSofia] = await Promise.all([
    prisma.classSlot.findFirst({ where: { tutorId: juan.id }, orderBy: { date: "asc" } }),
    prisma.classSlot.findFirst({ where: { tutorId: maria.id }, orderBy: { date: "asc" } }),
    prisma.classSlot.findFirst({ where: { tutorId: facundo.id }, orderBy: { date: "asc" } }),
    prisma.classSlot.findFirst({ where: { tutorId: sofia.id }, orderBy: { date: "asc" } }),
  ]);

  const assignLesson = async (slot: any, student: any, tutor: any, subjectId: number, modality: Modality) => {
    if (!slot || !student || !tutor) return;
    await prisma.classSlot.update({
      where: { id: slot.id },
      data: { status: SlotStatus.RESERVED, reservedById: student.id },
    });
    await prisma.lesson.create({
      data: {
        slotId: slot.id,
        studentId: student.id,
        tutorId: tutor.id,
        subjectId,
        modality,
        timestamp: slot.date,
        status: LessonStatus.PENDING,
      },
    });
  };

  await assignLesson(slotJuan, lucia, juan, programacion.id, Modality.ONLINE);
  await assignLesson(slotMaria, santiago, maria, fisica.id, Modality.ONSITE);
  await assignLesson(slotFacu, camila, facundo, baseDatos.id, Modality.ONLINE);
  await assignLesson(slotSofia, tomas, sofia, ingles.id, Modality.ONLINE);

  console.log("✅ Seed completado con éxito con más tutores, alumnos y clases.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
