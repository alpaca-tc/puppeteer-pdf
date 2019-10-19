import express from "express";
import morgan from "morgan";
import { AddressInfo } from "net";

import createPdf from "./createPdf";
import Debug from "./utils/Debug";

const error = Debug("app:error");
const app = express();

app.use(express.urlencoded());
app.use(morgan("dev"));

// health checker
app.get("/api/health_check", (req, res) => {
  res.sendStatus(200);
});

// PDF Generator
app.post("/api/items", async (req, res, next) => {
  try {
    const { pdf, cleanup } = await createPdf({
      source: req.body.source,
      format: req.body.format,
      timeout: req.body.timeout,
    });

    res.send(pdf);
    cleanup();
  } catch (err) {
    error(err);
    next(err);
  }
});

// start the Express server
const server = app.listen(process.env.PORT || 8080, () => {
  const { address, port } = server.address() as AddressInfo;

  if (process.env.TIMEOUT) {
    server.timeout = parseInt(process.env.TIMEOUT, 10);
  }

  process.stdout.write(`Server started at http://${address}:${port}/\n`);
});
