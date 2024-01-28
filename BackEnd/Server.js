const app = require("express")();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const AnonymizeUAPlugin = require("puppeteer-extra-plugin-anonymize-ua");

const PORT = 8080;
const url =
  "https://www.reos.ro/apartamente-de-vanzare/bucuresti/drumul-taberei/";

puppeteer.use(StealthPlugin());
puppeteer.use(
  RecaptchaPlugin({
    provider: { id: "2captcha", token: "YOUR_2CAPTCHA_API_KEY" },
  })
);
puppeteer.use(AnonymizeUAPlugin());

app.listen(PORT, () => {
  const main = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Listen for the 'domcontentloaded' event to ensure basic content is loaded
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Use evaluate to wait for the presence of at least one element with the class '.box-anunt'
    await page.waitForFunction(() =>
      document.querySelector(".align-self-center.property-image-info")
    );

    // Evaluate the page content for debugging purposes
    const content = await page.content();

    const allListings = await page.evaluate(() => {
      const listings = document.querySelectorAll(
        ".align-self-center.property-image-info"
      );

      const result = [];

      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        const propertyPriceElement = listing.querySelector(
          ".property-price.property-price-sale"
        );

        const propertySqmElements = listing.querySelectorAll(
          ".property-summary-snippet"
        );

        // You can extract more information or perform additional queries within each listing here
        const price = propertyPriceElement
          ? parseFloat(
              propertyPriceElement.innerText
                .replace(/€.*/, "")
                .replace(/,/g, "")
            )
          : "N/A";

        const propertyArea =
          propertySqmElements.length >= 1
            ? propertySqmElements[0].innerText
            : "N/A";

        if (!propertyArea.toLowerCase().includes("drumul taberei")) {
          // Exclude listings with propertyArea not containing "crangasi"
          continue;
        }

        const propertySqm =
          propertySqmElements.length >= 2
            ? parseFloat(
                propertySqmElements[1].innerText.replace(/\s*mp.*/, "")
              )
            : "N/A";

        const divisionResult = price / propertySqm;

        result.push({
          price,
          propertySqm,
          propertyArea,
          divisionResult,

          // Add more properties as needed
        });
      }

      return result;
    });

    // Calculate the average of divisionResult
    const divisionResults = allListings.map(
      (listing) => listing.divisionResult
    );

    // Filter out objects with propertyArea not containing "crangasi"
    const filteredListings = allListings.filter((listing) =>
      listing.propertyArea.toLowerCase().includes("drumul taberei")
    );

    const averageDivisionResult =
      divisionResults.reduce((sum, value) => sum + value, 0) /
      divisionResults.length;

    console.log(filteredListings);
    console.log(`Average Price / Sqm: ${averageDivisionResult}`);
    const estimatedTransactionCost = averageDivisionResult * 0.95;
    console.log(
      `Estimated Transaction Price / Sqm: ${estimatedTransactionCost}`
    );

    await browser.close();
  };

  main();

  console.log(`it's alive on http://localhost:${PORT}`);
});
