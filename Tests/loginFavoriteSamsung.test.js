// I bring in the tools I need from Selenium, like how to build a browser,
// find things on a page (By), press special keys (Key), and wait for things (until).
// Note: 'Key' is not used in this test, but kept for completeness if needed elsewhere.
const { Builder, By, Key, until } = require("selenium-webdriver");
// I no longer need to require 'Chai' because Jest has its own powerful 'expect' assertion library built-in.

// I get my browser settings (like Chrome, Firefox, or Samsung phone)
// from the 'browserstack.config.js' file that I just set up.
const { capabilities } = require("../browserstack.config");

// 'describe' is like a big box for all related tests.
// I'm giving my test suite a name: "Bstackdemo Login and Samsung Galaxy S20+ Favorite Test".
describe("Bstackdemo Login and Samsung Galaxy S20+ Favorite Test", () => {
  // This variable will hold my web browser driver, which is what controls the browser.
  let driver;

  // 'beforeEach' means "I do this code before *every* single test starts."
  // It's good for setting up my browser and going to the website each time.
  beforeEach(async () => {
    // I verify my credentials are available before starting
    if (
      !process.env.BROWSERSTACK_USERNAME ||
      !process.env.BROWSERSTACK_ACCESS_KEY
    ) {
      throw new Error("BrowserStack credentials missing! Check Jenkins setup");
    }

    const capability = {
      ...capabilities[0], // Use your first defined capability from config
      // I explicitly set credentials to ensure they're fresh
      "browserstack.user": process.env.BROWSERSTACK_USERNAME,
      "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
    };
    // I build the driver with credentials in both URL and capabilities
    driver = await new Builder()
      .usingServer(
        `https://${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`
      )
      .withCapabilities(capability)
      .build();

    //go directly to the sign-in page to match the test flow.
    await driver.get("https://www.bstackdemo.com/signin");
  }, 60000); // Set timeout for beforeEach hook (60 seconds)

  // 'afterEach' means "I do this code after *every* single test finishes."
  afterEach(async () => {
    if (driver) {
      // If the browser is open, I close it cleanly.
      await driver.quit();
    }
  }, 60000); // Set timeout for afterEach hook (60 seconds)

  // 'it' is one single test. I give it a clear name about what it should do.
  test("should log in, filter Samsung, favorite Galaxy S20+, and verify on favorites page", async () => {
    // --- Step 1: Log into www.bstackdemo.com ---

    // I find the username input field by first locating its parent div by ID,
    // and then finding the 'input' element within that div.
    const usernameParentDiv = await driver.wait(
      until.elementLocated(By.id("username")),
      15000
    );
    const userField = await usernameParentDiv.findElement(
      By.css('input[type="text"]')
    );
    await userField.sendKeys("demouser");
    console.log("Entered username.");

    // I find the password input field similarly, by locating its parent div by ID,
    // and then finding the 'input' element within that div.
    const passwordParentDiv = await driver.wait(
      until.elementLocated(By.id("password")),
      15000
    );
    const passField = await passwordParentDiv.findElement(
      By.css('input[type="text"]')
    );
    await passField.sendKeys("testingisfun99");
    console.log("Entered password.");

    // === NEW ROBUST WAIT FOR OVERLAYS TO DISAPPEAR ===
    // This looks for common overlay patterns that might intercept clicks
    // and waits for them to become stale.
    try {
      // Attempt to find any potential full-page overlay or loader.
      // We'll prioritize the specific class if it consistently appears, but
      // also include generic loader/spinner/overlay selectors.
      const potentialOverlay = await driver.findElement(
        By.css(
          'div[class*="css-"], div.ReactModal__Overlay, .loader, .spinner, [aria-busy="true"]'
        )
      );
      // Wait for the found overlay to become stale (disappear from DOM)
      await driver.wait(until.stalenessOf(potentialOverlay), 10000);
      console.log(
        "Waited for potential intercepting overlay/loader to disappear."
      );
    } catch (e) {
      // Log if no such overlay was found, or if it disappeared before we could find it.
      // This is expected if the site is very fast or the overlay is not consistently present,
      // so it's not a critical error.
      console.log(
        "No common intercepting overlay found or it disappeared quickly:",
        e.message
      );
    }
    // =================================================

    // Now, I find the "Log In" button by its ID and click it to submit the form.
    // This condition waits for the element to be present, visible, enabled, AND not obscured.
    const loginButton = await driver.wait(
      until.elementToBeClickable(By.id("login-btn")),
      15000 // Keep a generous timeout for this critical step
    );

    await loginButton.click();
    console.log("Clicked 'Log In' button.");

    // I wait up to 10 seconds until the website's address (URL) changes to include "dashboard".
    // This helps me know the login was successful.
    await driver.wait(until.urlContains("dashboard"), 10000);
    console.log("Navigated to dashboard after login.");

    // After logging in, I check if I can see the "demouser" text on the page.
    // I find the element that shows the username.
    const usernameElement = await driver.findElement(By.css(".username"));
    // I check if the text of that element actually includes "demouser".
    expect(await usernameElement.getText()).toContain("demouser");
    console.log("Login verified: 'demouser' text found.");

    // --- Step 2: Filter the products to show "Samsung" devices only ---

    // I click on the sorting/filtering dropdown menu.
    await driver.findElement(By.css(".sort select")).click();
    console.log("Clicked product sort/filter dropdown.");

    // I find the specific item in the list that says "Samsung" and click it to apply the filter.
    await driver.findElement(By.xpath("//li[text()='Samsung']")).click();
    console.log("Selected 'Samsung' filter.");

    // I wait up to 10 seconds for the loading spinner to disappear, which means the filter has finished applying.
    await driver.wait(
      until.stalenessOf(driver.findElement(By.css(".spinner"))),
      10000
    );
    console.log("Waited for filter to apply.");

    // I quickly check the first product shown after filtering.
    const productNames = await driver.findElements(
      By.css(".shelf-item .shelf-item__title")
    );
    const firstProductName = await productNames[0].getText();
    // I expect the first product name to include "Samsung".
    expect(firstProductName).toContain("Samsung");
    console.log("Verified: First product displayed is a Samsung device.");

    // --- Step 3: Favorite the "Galaxy S20+" device ---

    // I find the text "Galaxy S20+" on the page.
    const galaxyS20PlusName = await driver.findElement(
      By.xpath("//p[contains(text(), 'Galaxy S20+')]")
    );
    // From that product name, I go up the website's structure to find its main product box (the 'shelf-item').
    const parentShelfItem = await galaxyS20PlusName.findElement(
      By.xpath("./ancestor::div[contains(@class, 'shelf-item')]")
    );
    // Inside that product box, I find the heart icon (which is part of the buy button in this case) and click it to favorite.
    await parentShelfItem.findElement(By.css(".shelf-item__buy-btn")).click();
    console.log("Clicked to favorite 'Galaxy S20+'.");

    // I wait a short moment for the favorites count to update.
    const favoritesCountElement = await driver.findElement(
      By.id("favorites-count")
    );
    const favoritesCount = await favoritesCountElement.getText();
    // I expect the favorites count to now show "1".
    expect(favoritesCount).toBe("1");
    console.log("Favorites count updated to 1.");

    // --- Step 4: Verify that the Galaxy S20+ is listed on the Favorites page ---

    // I find the "Favorites" link on the page by its ID and click it to go to the favorites page.
    await driver.findElement(By.id("favorites")).click();
    console.log("Clicked 'Favorites' link.");

    // I wait up to 10 seconds until the URL includes "favorites" to confirm I am on the correct page.
    await driver.wait(until.urlContains("favorites"), 10000);
    console.log("Navigated to Favorites page.");

    // On the favorites page, I find the name of the product that is listed there.
    const favoriteProductNameElement = await driver.findElement(
      By.css(".shelf-item .shelf-item__title")
    );
    const favoriteProductName = await favoriteProductNameElement.getText();
    // I check if that product name includes "Galaxy S20+".
    expect(favoriteProductName).toContain("Galaxy S20+");
    console.log("Verified: 'Galaxy S20+' is listed on the Favorites page.");

    // If all checks pass, I can say the test passed!
    console.log("--- TEST PASSED SUCCESSFULLY! ---");
  }, 60000); // Set timeout for the test itself (60 seconds)
});
