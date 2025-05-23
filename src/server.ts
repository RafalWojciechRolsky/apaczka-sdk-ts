import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

import { PORT } from "./config/envs";
import apiApaczkaRouter from "./express/routes/apiApaczkaRouter";
import { helloWorldRoute } from "./express/controllers/helloWorldRoute";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "*", // Pozwala na zapytania z każdej domeny
    methods: "GET,POST",
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());

app.use("/api/apaczka", apiApaczkaRouter);
app.use("/", helloWorldRoute);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://<twój-adres-ip>:${PORT}`);
});
