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
    origin: "https://your-allowed-origin.com",
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

app.use("/", helloWorldRoute);
app.use("/api/apaczka", apiApaczkaRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
