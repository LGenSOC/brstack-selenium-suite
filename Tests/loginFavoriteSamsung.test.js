// I bring in the tools I need from Selenium, like how to build a browser,
// find things on a page (By), press special keys (Key), and wait for things (until).
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

    // I find the username input field's parent div by ID.
    const usernameParentDiv = await driver.wait(
      until.elementLocated(By.id("username")),
      15000
    );
    // Then find the 'input' element within that div.
    const userField = await usernameParentDiv.findElement(
      By.css('input[type="text"]')
    );

    // Wait for the username field to be interactable
    await driver.wait(
      until.elementIsVisible(userField),
      10000,
      "Username field not visible."
    );
    await driver.wait(
      until.elementIsEnabled(userField),
      10000,
      "Username field not enabled."
    );

    // *** NEW STRATEGY: Forcefully set username value via JavaScript ***
    await driver.executeScript("arguments[0].value = 'demouser';", userField);
    console.log("Forced username value via JavaScript.");

    // The explicit wait to confirm the value should still be useful as a double-check
    await driver.wait(
      async () => {
        const value = await userField.getAttribute("value");
        return value === "demouser";
      },
      15000,
      "Username did not persist in the field after JavaScript injection."
    );
    console.log("Username value confirmed after JavaScript injection.");

    // I find the password input field similarly.
    const passwordParentDiv = await driver.wait(
      until.elementLocated(By.id("password")),
      15000
    );
    const passField = await passwordParentDiv.findElement(
      By.css('input[type="text"]')
    );

    // Wait for the password field to be interactable
    await driver.wait(
      until.elementIsVisible(passField),
      10000,
      "Password field not visible."
    );
    await driver.wait(
      until.elementIsEnabled(passField),
      10000,
      "Password field not enabled."
    );

    // For password, let's stick with sendKeys first, it might work better without the dropdown interference
    await passField.sendKeys("testingisfun99");
    console.log("Entered password.");

    // Dismiss password autocomplete dropdown (Keep ESCAPE/TAB here as sendKeys was used)
    await passField.sendKeys(Key.ESCAPE); // You can also try Key.TAB here if ESCAPE doesn't work well
    await driver.sleep(500); // Small pause for password field too
    console.log("Dismissed password autocomplete dropdown.");

    // =================================================
    // NEW ROBUST WAIT FOR OVERLAYS TO DISAPPEAR (Keep this, it's good)
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
      console.log(
        "No common intercepting overlay found or it disappeared quickly:",
        e.message
      );
    }
    // =================================================

    // Now, I find the "Log In" button by its ID.
    const loginButton = await driver.wait(
      until.elementLocated(By.id("login-btn")), // Wait for the element to be present in the DOM
      15000,
      "Login button not found within 15 seconds."
    );
    await driver.wait(
      until.elementIsVisible(loginButton), // Wait for the element to be visible
      10000,
      "Login button not visible within 10 seconds."
    );
    await driver.wait(
      until.elementIsEnabled(loginButton), // Wait for the element to be enabled
      10000,
      "Login button not enabled within 10 seconds."
    );
    console.log("Login button found and clickable.");

    // Attempt to click the button.
    try {
      await loginButton.click();
      console.log("Clicked 'Log In' button using standard click.");
      // *** ADDED: Log URL after successful click ***
      console.log(
        `Current URL after login click: ${await driver.getCurrentUrl()}`
      );
    } catch (error) {
      // If standard click fails (e.g., due to persistent interception),
      // fall back to JavaScript click as a last resort.
      if (
        error.name === "ElementClickInterceptedError" ||
        error.name === "WebDriverError"
      ) {
        console.warn(
          "Standard click failed, attempting JavaScript click:",
          error.message
        );
        await driver.executeScript("arguments[0].click();", loginButton);
        console.log("Forced click on 'Log In' button via JavaScript.");
        // *** ADDED: Log URL after JS fallback click ***
        console.log(
          `Current URL after login click (JS fallback): ${await driver.getCurrentUrl()}`
        );
      } else {
        throw error;
      }
    }

    // Instead of waiting for URL, wait for a key element on the dashboard to confirm navigation.
    const usernameDashboardElement = await driver.wait(
      // Renamed to avoid conflict with userField
      until.elementLocated(By.css(".username")),
      40000 // Generous timeout for the dashboard to load and element to be present
    );
    await driver.wait(
      until.elementIsVisible(usernameDashboardElement),
      10000, // Shorter wait for visibility once located
      "Username element not visible on dashboard within 10 seconds of being located."
    );
    console.log("Dashboard loaded: Username element found and visible.");

    // Now, I check if I can see the "demouser" text on the page.
    expect(await usernameDashboardElement.getText()).toContain("demouser");
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
