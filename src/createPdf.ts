import Debug from "debug";
import fs from "fs";
import puppeteer from "puppeteer";
import tmp from "tmp-promise";
import compact from './utils/compact';

const debug = Debug("createPdf");

interface Options {
  source: string;
  format: string;
  timeout?: number;
  waitFor?: number;
}

const defaultOptions = {
  timeout: 3000,
  waitFor: 250,
};

export default async (userOptions: Options) => {
  const options = Object.assign({}, defaultOptions, compact(userOptions)) as Options;

  const { fd, path } = await tmp.file({ postfix: '.html' });
  fs.writeSync(fd, options.source);

  let browser;
  let pdf;

  try {
    browser = await puppeteer.launch(
      {
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      },
    );

    const page = await browser.newPage();
    await page.goto(`file://${path}`, { timeout: options.timeout, waitUntil: "networkidle2" });
    await page.waitFor(options.waitFor);

    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagepdfoptions
    pdf = await page.pdf({
      format: options.format,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
    });
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      browser.close();
    }
  }

  return pdf;
};