import express, { Request, Response } from "express";
import deparmentRoutes from "./routes/department.routes.js";
import designationRoutes from "./routes/designation.routes.js";


const app = express();

const port = 3000;
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});
app.use(express.json())
app.use("/api/v1/designations", designationRoutes);
app.use("/api/v1/department",deparmentRoutes)
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
