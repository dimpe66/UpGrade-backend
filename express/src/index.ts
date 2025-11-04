import express from "express";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./auth/auth.routes";
import userRoutes from "./routes/user.routes";
import subjectRoutes from "./routes/subject.routes";
import availabilityRoutes from "./routes/availability.routes";
import slotRoutes from "./routes/slots.routes";
import lessonRoutes from "./routes/lesson.routes";

import { requireAuth } from "./auth/requireAuth";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);

app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/availability", availabilityRoutes);
app.use("/slots", slotRoutes);
app.use("/lessons", lessonRoutes);



const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));