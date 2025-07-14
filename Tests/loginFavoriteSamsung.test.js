// I bring in the tools I need from Selenium, like how to build a browser,
// find things on a page (By), press special keys (Key), and wait for things (until).
const { Builder, By, Key, until } = require("selenium-webdriver");
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

    await driver.get("https://www.bstackdemo.com/signin");
    console.log(`Mapsd to: ${await driver.getCurrentUrl()}`);

    // *** Keep this robust wait for page content to load after navigation ***
    try {
      // Wait for the main content container of the Next.js app to be visible
      await driver.wait(
        until.elementLocated(By.id("__next")),
        20000,
        "Main Next.js app container '__next' not found."
      );
      await driver.wait(
        until.elementIsVisible(await driver.findElement(By.id("__next"))),
        10000,
        "Main Next.js app container '__next' not visible."
      );
      console.log("Main '__next' container element visible.");
    } catch (error) {
      console.error(`Error waiting for initial page load: ${error.message}`);
      const currentUrl = await driver.getCurrentUrl();
      const pageSource = await driver.getPageSource();
      console.log(`Current URL during load error: ${currentUrl}`);
      console.log(
        `Page source during load error (first 500 chars): ${pageSource.substring(
          0,
          500
        )}`
      );
      throw error; // Re-throw to fail the test if the page doesn't load
    }
    // Give a short, static pause as a buffer after initial DOM load
    await driver.sleep(1500);
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
    // --- Step 1: Log into www.bstackdemo.com - THE "DAMN SOLUTION" APPROACH ---
    console.log(
      "Attempting login using direct JavaScript injection to bypass complex UI interaction."
    );

    // Direct JavaScript to set username value and trigger events
    // We are targeting the hidden input fields identified previously by their IDs.
    await driver.executeScript(
      "document.getElementById('react-select-2-input').value = 'demouser';" +
        "document.getElementById('react-select-2-input').dispatchEvent(new Event('change'));" +
        "document.getElementById('react-select-2-input').dispatchEvent(new Event('input'));" +
        "console.log('JS: Username value set and events dispatched.');"
    );
    console.log("Selenium: Username value injection via JavaScript completed.");

    // Direct JavaScript to set password value and trigger events
    await driver.executeScript(
      "document.getElementById('react-select-3-input').value = 'testingisfun99';" +
        "document.getElementById('react-select-3-input').dispatchEvent(new Event('change'));" +
        "document.getElementById('react-select-3-input').dispatchEvent(new Event('input'));" +
        "console.log('JS: Password value set and events dispatched.');"
    );
    console.log("Selenium: Password value injection via JavaScript completed.");

    // Give a short moment for the UI to potentially register changes, though JS is fast
    await driver.sleep(1500);

    // Find the login form element (still good to locate it via Selenium to ensure it's there)
    const loginForm = await driver.wait(
      until.elementLocated(By.css("form.w-80")),
      10000,
      "Login form not found for submission."
    );
    console.log("Login form element found for submission.");

    // Directly submit the form via JavaScript
    await driver.executeScript("arguments[0].submit();", loginForm);
    console.log("Form submitted directly via JavaScript.");

    // IMPORTANT: Add a robust wait after login attempt to allow for UI updates and dynamic content loading
    await driver.sleep(7000); // Increased to 7 seconds, giving ample time for content to load after JS submission

    // --- CHECK FOR LOGIN ERROR MESSAGES (optional, but good for diagnostics) ---
    try {
      const errorMessage = await driver.findElement(
        By.css('.api-error, .error-message, [role="alert"]')
      );
      const errorText = await errorMessage.getText();
      if (errorText.length > 0 && errorText.includes("Invalid Username")) {
        console.error(
          `Login failed: Found "Invalid Username" error message on page: "${errorText}"`
        );
        throw new Error(`Login failed due to error message: "${errorText}"`);
      } else if (errorText.length > 0) {
        console.warn(
          `Found other error message after login: "${errorText}". Proceeding if not "Invalid Username".`
        );
      } else {
        console.log(
          "No explicit error message text found after login attempt."
        );
      }
    } catch (e) {
      if (e.name === "NoSuchElementError") {
        console.log(
          "No common error message element found, proceeding as expected."
        );
      } else {
        console.warn(
          "Unexpected error during error message check (not NoSuchElementError):",
          e.message
        );
        throw e;
      }
    }

    // --- LOGIN VERIFICATION: Directly check for dashboard elements on the SAME URL ---
    // As confirmed, content loads on https://www.bstackdemo.com/?signin=true
    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    ); // Should still be ?signin=true

    const usernameTextElement = await driver.wait(
      until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
      30000, // Long wait for successful login content to appear
      "Demouser text not found on page after login attempt. Login likely failed."
    );
    await driver.wait(
      until.elementIsVisible(usernameTextElement),
      20000, // Long wait for visibility
      "Demouser text found but not visible on dashboard within 20 seconds."
    );
    console.log(
      "Dashboard content loaded: 'demouser' text element found and visible."
    );

    expect(await usernameTextElement.getText()).toContain("demouser");
    console.log("Login verified: 'demouser' text found.");

    // Confirm that other main dashboard content (like the filter dropdown) is also present
    await driver.wait(
      until.elementLocated(By.css(".sort select")),
      25000, // Long wait for dashboard elements
      "Product sort/filter dropdown not found on page after login. Dashboard content likely not fully loaded."
    );
    console.log(
      "Product sort/filter dropdown found, confirming dashboard content."
    );

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

    await driver.sleep(3000); // Give time for favorites page content to load

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
  }, 90000); // Increased overall test timeout to 90 seconds
});
