import fs from "fs";
import puppeteer from "puppeteer";
import tmp from "tmp-promise";
import compact from "./utils/compact";
import Debug from "./utils/Debug";

const debug = Debug("createPdf");

export interface Options {
  format: string;
  source?: string;
  url?: string;
  timeout?: number;
  waitFor?: number;
}

export const formats = [
  "Letter",
  "Legal",
  "Tabloid",
  "Ledger",
  "A0",
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "A6",
];

const defaultOptions = {
  timeout: 3000,
  waitFor: 250,
} as Options;

export default async (userOptions: Options) => {
  const options = Object.assign({}, defaultOptions, compact(userOptions)) as Options;
  const { fd, path, cleanup } = await tmp.file({ postfix: ".html" });
  let href;

  if (options.source) {
    fs.writeSync(fd, options.source);
    href = `file://${path}`;
  } else {
    href = options.url;
  }

  let browser;

  try {
    const launchOptions = compact(
      {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      },
    );

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.goto(href, { timeout: options.timeout, waitUntil: "networkidle2" });
    await page.waitFor(options.waitFor);

    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
    const pdf = await page.pdf({
      format: options.format,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
    });

    return { pdf, cleanup };
  } finally {
    if (browser) {
      browser.close();
    }
  }
};
