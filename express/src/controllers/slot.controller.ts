import { PrismaClient, SlotStatus } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../auth/requireAuth";
import { addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

export const getSlots = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.query.tutorId ? Number(req.query.tutorId) : req.user?.id;
    const now = startOfDay(new Date());

    const slots = await prisma.classSlot.findMany({
      where: {
        tutorId,
        deleted: false,
        date: { gte: now },
      },
      orderBy: { date: "asc" },
    });

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los slots" });
  }
};

export const generateWeeklySlots = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { availabilityId, mondayDate, mondayDates } = req.body;

    if (!availabilityId || (!mondayDate && !mondayDates))
      return res.status(400).json({ error: "Debe indicar availabilityId y al menos una fecha de lunes" });

    const availability = await prisma.tutorAvailability.findFirst({
      where: { id: availabilityId, tutorId, active: true },
    });

    if (!availability)
      return res.status(404).json({ error: "Disponibilidad no encontrada" });

    const weekdays = Array.isArray(availability.weekdays)
      ? (availability.weekdays as number[])
      : [];
    const timeBlocks = Array.isArray(availability.timeBlocks)
      ? (availability.timeBlocks as { start: string; end: string }[])
      : [];

    if (weekdays.length === 0 || timeBlocks.length === 0)
      return res.status(400).json({ error: "La disponibilidad no tiene días u horarios válidos" });

    const weeks = mondayDates && Array.isArray(mondayDates) ? mondayDates : [mondayDate];
    let createdCount = 0;
    let skippedDays: string[] = [];

    for (const mondayStr of weeks) {
      const monday = new Date(mondayStr);

      for (const day of weekdays) {
        const slotDateDay = addDays(monday, day);

        const existingDaySlots = await prisma.classSlot.findMany({
          where: {
            tutorId,
            date: {
              gte: startOfDay(slotDateDay),
              lt: addDays(startOfDay(slotDateDay), 1),
            },
            status: { in: [SlotStatus.AVAILABLE, SlotStatus.RESERVED] },
          },
        });

        if (existingDaySlots.length > 0) {
          skippedDays.push(slotDateDay.toISOString().split("T")[0]);
          continue;
        }

        for (const block of timeBlocks) {
          const [hour, minute] = block.start.split(":").map(Number);
          const slotDate = new Date(slotDateDay);
          slotDate.setHours(hour, minute, 0, 0);

          const exists = await prisma.classSlot.findFirst({
            where: { tutorId, date: slotDate, startTime: block.start, endTime: block.end },
          });

          if (!exists) {
            await prisma.classSlot.create({
              data: {
                tutorId,
                date: slotDate,
                startTime: block.start,
                endTime: block.end,
                status: SlotStatus.AVAILABLE,
              },
            });
            createdCount++;
          }
        }
      }
    }

    res.json({
      message: "Slots generados correctamente",
      created: createdCount,
      skippedDays,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar los slots" });
  }
};

export const cancelSlot = async (req: AuthRequest, res: Response) => {
  try {
    const tutorId = req.user!.id;
    const { slotId } = req.body;

    const slot = await prisma.classSlot.findFirst({ where: { id: slotId, tutorId } });
    if (!slot) return res.status(404).json({ error: "Slot no encontrado" });

    await prisma.classSlot.update({
      where: { id: slotId },
      data: { status: SlotStatus.CANCELLED },
    });

    res.json({ message: "Slot cancelado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar slot" });
  }
};
