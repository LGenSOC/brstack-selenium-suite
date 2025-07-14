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
        `Page source during load error (first 500 chars): ${pageSource.substring(0, 500)}`
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
    // --- Step 1: Log into www.bstackdemo.com ---

    // **NEW STRATEGY for Username (React Select component)**
    // Find the main div for the username dropdown. This is the visible part we click.
    const usernameDropdown = await driver.wait(
      until.elementLocated(By.id("username")),
      15000,
      "Username dropdown container (id='username') not found."
    );
    console.log("Username dropdown container found.");

    // Click the dropdown to make the options visible.
    // We'll click the control area that users would interact with.
    // The HTML shows `class=" css-yk16xz-control"` is the clickable area.
    const usernameSelectControl = await usernameDropdown.findElement(
      By.css(".css-yk16xz-control")
    );
    await driver.wait(
      until.elementIsVisible(usernameSelectControl),
      10000,
      "Username select control not visible."
    );
    await driver.wait(
      until.elementIsEnabled(usernameSelectControl),
      10000,
      "Username select control not enabled."
    );
    await usernameSelectControl.click();
    console.log("Clicked username dropdown.");
    await driver.sleep(500); // Small pause for options to appear

    // Now, select "demouser" from the opened dropdown options.
    // The options typically appear as list items (divs or li) with specific text.
    // Looking at common React Select patterns, the options often have a role="option" or specific class.
    // Let's try finding the element by its text using an XPath.
    const demouserOption = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@id, 'react-select-2-option') and text()='demouser']"
        )
      ),
      10000,
      "Option 'demouser' not found in dropdown."
    );
    await driver.wait(
      until.elementIsVisible(demouserOption),
      5000,
      "Option 'demouser' not visible."
    );
    await driver.wait(
      until.elementIsEnabled(demouserOption),
      5000,
      "Option 'demouser' not enabled."
    );
    await demouserOption.click();
    console.log("Selected 'demouser' from dropdown.");
    await driver.sleep(1000); // Give time for selection to register

    // **NEW STRATEGY for Password (React Select component)**
    // Find the main div for the password dropdown.
    const passwordDropdown = await driver.wait(
      until.elementLocated(By.id("password")),
      15000,
      "Password dropdown container (id='password') not found."
    );
    console.log("Password dropdown container found.");

    // Click the dropdown to make the options visible.
    const passwordSelectControl = await passwordDropdown.findElement(
      By.css(".css-yk16xz-control")
    );
    await driver.wait(
      until.elementIsVisible(passwordSelectControl),
      10000,
      "Password select control not visible."
    );
    await driver.wait(
      until.elementIsEnabled(passwordSelectControl),
      10000,
      "Password select control not enabled."
    );
    await passwordSelectControl.click();
    console.log("Clicked password dropdown.");
    await driver.sleep(500); // Small pause for options to appear

    // Select "testingisfun99" from the opened dropdown options.
    const passwordOption = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@id, 'react-select-3-option') and text()='testingisfun99']"
        )
      ),
      10000,
      "Option 'testingisfun99' not found in dropdown."
    );
    await driver.wait(
      until.elementIsVisible(passwordOption),
      5000,
      "Option 'testingisfun99' not visible."
    );
    await driver.wait(
      until.elementIsEnabled(passwordOption),
      5000,
      "Option 'testingisfun99' not enabled."
    );
    await passwordOption.click();
    console.log("Selected 'testingisfun99' from dropdown.");
    await driver.sleep(1000); // Give time for selection to register

    // =================================================
    // ROBUST WAIT FOR OVERLAYS TO DISAPPEAR (Keep this, it's good)
    try {
      const potentialOverlay = await driver.findElement(
        By.css(
          'div[class*="css-"], div.ReactModal__Overlay, .loader, .spinner, [aria-busy="true"]'
        )
      );
      await driver.wait(until.stalenessOf(potentialOverlay), 10000);
      console.log(
        "Waited for potential intercepting overlay/loader to disappear."
      );
    } catch (e) {
      if (e.name !== "NoSuchElementError") {
        // Only log if it's not just that the overlay wasn't found
        console.warn(
          "Could not check for overlay or unexpected error during check:",
          e.message
        );
      } else {
        console.log(
          "No common intercepting overlay found or it disappeared quickly."
        );
      }
    }
    // =================================================

    // Still using explicit JavaScript click for login button, as it's reliable.
    const loginButton = await driver.wait(
      until.elementLocated(By.id("login-btn")),
      15000,
      "Login button not found within 15 seconds."
    );
    await driver.wait(
      until.elementIsVisible(loginButton),
      10000,
      "Login button not visible."
    );
    await driver.wait(
      until.elementIsEnabled(loginButton),
      10000,
      "Login button not enabled."
    );

    console.log("Attempting to click 'Log In' button via JavaScript.");
    await driver.executeScript("arguments[0].click();", loginButton);
    console.log("Forced click on 'Log In' button via JavaScript.");

    // IMPORTANT: Add a short wait after any login attempt to allow for UI updates or redirects
    await driver.sleep(2000); // Increased significantly to 2 seconds for page load

    // --- CHECK FOR LOGIN ERROR MESSAGES (should ideally not be seen now) ---
    try {
      const errorMessage = await driver.findElement(
        By.css('.api-error, .error-message, [role="alert"]')
      );
      const errorText = await errorMessage.getText();
      if (errorText.length > 0 && errorText.includes("Invalid Username")) {
        console.error(
          `Login failed: Found unexpected "Invalid Username" error message on page: "${errorText}"`
        );
        throw new Error(
          `Login failed due to unexpected error message: "${errorText}"`
        );
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

    // Wait for the URL to change to the exact dashboard URL, indicating successful login and navigation
    try {
      await driver.wait(
        until.urlIs("https://www.bstackdemo.com/"),
        25000, // Increased wait to 25 seconds for URL change
        "Did not navigate to main dashboard URL (https://www.bstackdemo.com/) after login attempt."
      );
      console.log(
        `Successfully navigated to dashboard. Current URL: ${await driver.getCurrentUrl()}`
      );
    } catch (e) {
      console.error(`Error navigating after login: ${e.message}`);
      console.log(`Current URL still: ${await driver.getCurrentUrl()}`);
      const pageSource = await driver.getPageSource();
      console.log(
        "Page source if stuck on signin page (first 500 chars):",
        pageSource.substring(0, 500)
      );
      throw e;
    }

    // Now, confirm dashboard loaded by waiting for the 'demouser' text itself.
    await driver.wait(
      until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
      20000,
      "Demouser text not found on dashboard after URL change."
    );
    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    );

    const usernameTextElement = await driver.findElement(
      By.xpath("//span[contains(text(), 'demouser')]")
    );
    await driver.wait(
      until.elementIsVisible(usernameTextElement),
      10000,
      "Demouser text not visible on dashboard within 10 seconds of being located."
    );
    console.log("Dashboard loaded: 'demouser' text element found and visible.");

    // Now, I check if I can see the "demouser" text on the page.
    expect(await usernameTextElement.getText()).toContain("demouser");
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
