import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import subjectRoutes from "./routes/subject.routes";
import availabilityRoutes from "./routes/availability.routes";
import slotRoutes from "./routes/slots.routes";
import lessonRoutes from "./routes/lesson.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/availability", availabilityRoutes);
app.use("/slots", slotRoutes);
app.use("/lessons", lessonRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));