import { PrismaClient } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Comenzando seed");

  const tutor = await prisma.user.create({
    data: {
      firstName: "Roberto",
      lastName: "Paskoni",
      email: "roberto.paskoni@gmail.com",
      xpLevel: 1200,
      rating: 4.8,
    },
  });

  const student = await prisma.user.create({
    data: {
      firstName: "Juan",
      lastName: "Martinez",
      email: "juanm2005@outlook.com",
      xpLevel: 200,
    },
  });

  const math = await prisma.subject.create({
    data: { name: "Cálculo Elemental", iconUrl: "/icons/math.png" },
  });

  await prisma.tutorSubject.create({
    data: {
      tutorId: tutor.id,
      subjectId: math.id,
    },
  });

  const mondayAvailability = await prisma.tutorAvailability.create({
    data: {
      tutorId: tutor.id,
      weekday: 1,
      startTime: "13:00",
      endTime: "14:00",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-11-30"),
    },
  });

  const slotsToCreate: any[] = [];
  let current = new Date(mondayAvailability.startDate);

  while (isBefore(current, mondayAvailability.endDate)) {
    if (current.getDay() === mondayAvailability.weekday) {
      slotsToCreate.push({
        tutorId: mondayAvailability.tutorId,
        subjectId: math.id,
        date: current,
        startTime: mondayAvailability.startTime,
        endTime: mondayAvailability.endTime,
        status: "AVAILABLE",
        deleted: false,
      });
      current = addWeeks(current, 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }

  await prisma.classSlot.createMany({ data: slotsToCreate });
  console.log(`Se crearon ${slotsToCreate.length} slots para el tutor ${tutor.firstName}`);

  const firstSlot = await prisma.classSlot.findFirst({
    where: { status: "AVAILABLE" },
  });

  if (firstSlot) {
    await prisma.classSlot.update({
      where: { id: firstSlot.id },
      data: { status: "RESERVED", reservedById: student.id },
    });

    await prisma.lesson.create({
      data: {
        slotId: firstSlot.id,
        studentId: student.id,
        tutorId: tutor.id,
        subjectId: math.id,
        modality: "ONLINE",
        timestamp: firstSlot.date,
        status: "PENDING",
      },
    });
  }

  console.log("Seed exitoso");
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
