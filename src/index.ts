import Debug from "debug";
import express from "express";
import { AddressInfo } from "net";
import createPdf from "./createPdf";

const debug = Debug("app");
const error = Debug("app:error");
const app = express();

app.use(express.urlencoded());

// health checker
app.get("/api/health_check", (req, res) => {
  res.sendStatus(200);
});

// PDF Generator
app.post("/api/items", async (req, res, next) => {
  createPdf({
    source: req.body.source,
    format: req.body.format,
    timeout: req.body.timeout,
  }).then(async (pdf) => {
    res.send(pdf);
  }).catch(async (err) => {
    error(err);
    next(err);
  });
});

// start the Express server
const server = app.listen(process.env.PORT || 8080, () => {
  const { address, port } = server.address() as AddressInfo;

  if (process.env.TIMEOUT) {
    server.timeout = parseInt(process.env.TIMEOUT, 10);
  }

  process.stdout.write(`Server started at http://${address}:${port}/\n`);
});
