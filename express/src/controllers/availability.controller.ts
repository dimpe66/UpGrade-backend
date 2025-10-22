import { PrismaClient, Prisma, SlotStatus } from "@prisma/client";
import { addWeeks, isBefore } from "date-fns";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createAvailability = async (req: Request, res: Response) => {
  try {
    const { tutorId, weekday, startTime, endTime, startDate, endDate } = req.body;

    const availability = await prisma.tutorAvailability.create({
      data: { tutorId, weekday, startTime, endTime, startDate, endDate },
    });

    const slots: Prisma.ClassSlotCreateManyInput[] = [];
    let current = new Date(startDate);

    while (isBefore(current, new Date(endDate))) {
      if (current.getDay() === weekday) {
        slots.push({
          tutorId,
          date: current,
          startTime,
          endTime,
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

    res.status(201).json({ availability, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating availability" });
  }
};
