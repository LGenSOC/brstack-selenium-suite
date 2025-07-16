// Import necessary tools from Selenium WebDriver
const { Builder, By, until } = require("selenium-webdriver");

// Get BrowserStack configuration (assuming this file is simple too)
const { capabilities } = require("../browserstack.config");

// This describes a group of tests for our shopping website
describe("Simple Bstackdemo Login and Favorite Test", () => {
  let driver; // This variable will control our web browser

  // Before each test, we set up the browser and go to the sign-in page
  beforeEach(async () => {
    // Make sure we have our BrowserStack username and key
    if (
      !process.env.BROWSERSTACK_USERNAME ||
      !process.env.BROWSERSTACK_ACCESS_KEY
    ) {
      throw new Error("BrowserStack credentials missing! Please set them up.");
    }

    // Set up our browser to run on BrowserStack
    driver = await new Builder()
      .usingServer(
        `https://${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`
      )
      .withCapabilities(capabilities[0]) // Use the first browser setup from our config
      .build();

    // Go to the sign-in page
    await driver.get("https://www.bstackdemo.com/signin");
    console.log("Opened sign-in page.");

    // Wait a bit for the page to fully load (simple way)
    await driver.sleep(3000);
  }, 60000); // Give it up to 60 seconds for setup

  // After each test, we close the browser
  afterEach(async () => {
    if (driver) {
      await driver.quit(); // Close the browser
    }
  }, 60000); // Give it up to 60 seconds for cleanup

  // This is our main test: Login, favorite, and check
  test("should log in, favorite an item, and check favorites page", async () => {
    // --- Step 1: Log in ---
    console.log("Logging in...");

    // Click the username dropdown
    await driver.findElement(By.id("username")).click();
    await driver.sleep(1000); // Wait for options to appear

    // Click on 'demouser' option
    await driver.findElement(By.xpath("//div[text()='demouser']")).click();
    await driver.sleep(1000);

    // Click the password dropdown
    await driver.findElement(By.id("password")).click();
    await driver.sleep(1000);

    // Click on 'testingisfun99' option
    await driver
      .findElement(By.xpath("//div[text()='testingisfun99']"))
      .click();
    await driver.sleep(1000);

    // Click the login button
    await driver.findElement(By.id("login-btn")).click();
    await driver.sleep(5000); // Wait for the login to process and dashboard to load

    // Check if we are logged in by looking for 'demouser' text
    const usernameText = await driver
      .findElement(By.xpath("//span[contains(text(), 'demouser')]"))
      .getText();
    expect(usernameText).toContain("demouser");
    console.log("Logged in successfully as 'demouser'.");

    // --- Step 2: Filter for Samsung products ---
    console.log("Filtering for Samsung products...");
    // Click the Samsung checkbox
    await driver
      .findElement(
        By.xpath(
          "//label/input[@value='Samsung']/following-sibling::span[@class='checkmark']"
        )
      )
      .click();
    await driver.sleep(3000); // Wait for filter to apply and products to load

    // --- Step 3: Favorite "Galaxy S20+" ---
    console.log("Favoriting 'Galaxy S20+'...");
    // Find the heart icon for Galaxy S20+ and click it
    const s20PlusHeartIcon = await driver.findElement(
      By.xpath(
        "//div[contains(@class, 'shelf-item') and .//p[text()='Galaxy S20+']]//button[./*[local-name()='svg']]"
      )
    );
    await s20PlusHeartIcon.click();
    await driver.sleep(2000); // Wait for the favorite action to complete

    // --- Step 4: Go to Favorites page and verify ---
    console.log("Going to Favorites page...");
    // Click the "Favourites" link in the navigation
    await driver.findElement(By.id("favourites")).click();
    await driver.sleep(3000); // Wait for favorites page to load

    // Check if "Galaxy S20+" is on the favorites page
    const favoritedItem = await driver
      .findElement(By.xpath("//p[text()='Galaxy S20+']"))
      .getText();
    expect(favoritedItem).toContain("Galaxy S20+");
    console.log("Verified: 'Galaxy S20+' is on the Favorites page.");

    console.log("Test completed successfully!");
  }, 90000); // Overall test timeout (90 seconds)
});
