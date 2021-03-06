import express from "express";
import Joi from "joi";
import morgan from "morgan";
import { AddressInfo } from "net";

import createPdf, { formats } from "./createPdf";

export const app = express();

app.use(express.urlencoded());
app.use(morgan("dev"));

// health checker
app.get("/api/health_check", (req, res) => {
  res.sendStatus(200);
});

// PDF Generator
app.post("/api/items", async (req, res, next) => {
  const schema = Joi.object().keys({
    source: Joi.string().optional(),
    url: Joi.string().optional(),
    timeout: Joi.number().optional(),
    format: Joi.string().valid(...formats).optional(),
  }).xor("source", "url");

  const result = schema.validate(req.body);

  if (result.error) {
    const { details } = result.error;
    const message = details.map((i) => i.message).join(",");

    return res.status(422).json({ error: message });
  }

  try {
    const { pdf, cleanup } = await createPdf({
      source: req.body.source,
      url: req.body.url,
      format: req.body.format,
      timeout: req.body.timeout,
    });

    res.send(pdf);
    cleanup();
  } catch (err) {
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
