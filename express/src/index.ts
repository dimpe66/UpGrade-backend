import express from "express";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import subjectRoutes from "./routes/subject.routes";
import availabilityRoutes from "./routes/availability.routes";
import slotRoutes from "./routes/slots.routes";
import lessonRoutes from "./routes/lesson.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/availability", availabilityRoutes);
app.use("/slots", slotRoutes);
app.use("/lessons", lessonRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Error interno del servidor" });
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});