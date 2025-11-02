import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import subjectRoutes from "./routes/subject.routes";
import availabilityRoutes from "./routes/availability.routes";
import lessonRoutes from "./routes/lesson.routes";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/subjects", subjectRoutes);
app.use("/availability", availabilityRoutes);
app.use("/lessons", lessonRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
