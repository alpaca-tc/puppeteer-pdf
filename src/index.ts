import Debug from "debug";
import express from "express";
import createPdf from "./createPdf";

const debug = Debug("app");
const app = express();
const port = 8080; // default port to listen

app.use(express.urlencoded());

// define a route handler for the default home page
app.get("/api/health_check", (req, res) => {
  res.sendStatus(200);
});

// define a route handler for the default home page
app.post("/api/items", async (req, res, next) => {
  const pdf = await createPdf({
    source: req.body.source,
    format: req.body.format,
    timeout: req.body.timeout,
  });

  try {
    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

// start the Express server
app.listen(port, () => {
  debug(`server started at http://localhost:${port}`);
});
