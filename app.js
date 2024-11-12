import puppeteer from 'puppeteer';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import sizeOf from 'image-size';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set screen size - it's not required in case, full page screen shot is being taken i.e. fullPage : true is set. also to get full page screenshot width specific width, set width to that value, and use any random value for height,
  await page.setViewport({ width: 415, height: 2000, deviceScaleFactor: 2 });

  // Navigate the page to a URL
  await page.goto('https://developer.chrome.com/', {
    waitUntil: 'networkidle2',
  });

  // Take screen shot
  const screenshotPath = 'ss.png';
  await page.screenshot({
    path: screenshotPath,
    fullPage: true, // for capturing full page, remove this line if full page not required
  });

  // Evaluate a script in the page context
  const title = await page.evaluate(() => {
    return document.title;
  });

  console.log('Page title:', title);

  // Close the browser
  await browser.close();

  // Get the dimensions of the screenshot
  const dimensions = sizeOf(screenshotPath);
  const { width, height } = dimensions;

  // Define margins
  const marginTop = 20;
  const marginBottom = 20;
  const marginLeft = 20;
  const marginRight = 20;

  // Calculate the new PDF size including margins
  const pdfWidth = width + marginLeft + marginRight;
  const pdfHeight = height + marginTop + marginBottom;

  // Convert the screenshot to PDF with the same dimensions and margins
  const convertImageToPDF = (imagePath, pdfPath, width, height, margins) => {
    const { top, bottom, left, right } = margins;
    const doc = new PDFDocument({ size: [pdfWidth, pdfHeight] });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);
    doc.image(imagePath, left, top, { width, height });
    doc.end();

    stream.on('finish', () => {
      console.log(`Screenshot has been successfully converted to ${pdfPath}`);
    });
  };

  // Convert the screenshot to PDF
  convertImageToPDF(screenshotPath, 'screenshot.pdf', width, height, {
    top: marginTop,
    bottom: marginBottom,
    left: marginLeft,
    right: marginRight,
  });
})();
