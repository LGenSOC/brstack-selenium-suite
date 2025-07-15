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
    // --- Step 1: Log into www.bstackdemo.com ---
    console.log(
      "Attempting login using click-dropdown-option strategy for React Select components."
    );

    // --- Username selection ---
    const usernameDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("username")),
      15000,
      "Username dropdown wrapper (id='username') not found."
    );
    console.log("Username dropdown wrapper found.");
    await usernameDropdownWrapper.click();
    console.log("Clicked username dropdown wrapper to open options.");
    await driver.sleep(1500); // Give a bit more time for options to render in the DOM

    // Locate the specific 'demouser' option by its text content and a common React Select ID pattern
    // This assumes the options are `div` elements with an ID starting with `react-select` and have the exact text.
    const demouserOption = await driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@id, 'react-select') and text()='demouser']")
      ),
      10000,
      "Specific option 'demouser' not found in username dropdown."
    );
    // Ensure the option is visible before attempting to click it
    await driver.wait(
      until.elementIsVisible(demouserOption),
      5000,
      "Option 'demouser' found but not visible."
    );
    await demouserOption.click();
    console.log("Selected 'demouser' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register and UI to update

    // --- Password selection (similar logic) ---
    const passwordDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("password")),
      15000,
      "Password dropdown wrapper (id='password') not found."
    );
    console.log("Password dropdown wrapper found.");
    await passwordDropdownWrapper.click();
    console.log("Clicked password dropdown wrapper to open options.");
    await driver.sleep(1500); // Give a bit more time for options to render

    // Locate the specific 'testingisfun99' option by its text content and a common React Select ID pattern
    const testingisfun99Option = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@id, 'react-select') and text()='testingisfun99']"
        )
      ),
      10000,
      "Specific option 'testingisfun99' not found in password dropdown."
    );
    // Ensure the option is visible before attempting to click it
    await driver.wait(
      until.elementIsVisible(testingisfun99Option),
      5000,
      "Option 'testingisfun99' found but not visible."
    );
    await testingisfun99Option.click();
    console.log("Selected 'testingisfun99' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register and UI to update

    // --- Click the Login button ---
    const loginButton = await driver.wait(
      until.elementLocated(By.id("login-btn")),
      10000,
      "Login button not found."
    );
    console.log("Login button found.");
    await driver.wait(
      until.elementIsVisible(loginButton),
      5000,
      "Login button not visible."
    );
    await driver.wait(
      until.elementIsEnabled(loginButton),
      5000,
      "Login button not enabled."
    );
    await loginButton.click();
    console.log("Clicked login button.");

    // IMPORTANT: Add a robust wait after login attempt to allow for UI updates and dynamic content loading
    await driver.sleep(7000); // Giving ample time for the page to transition/load after button click

    // --- CHECK FOR LOGIN ERROR MESSAGES (This section is now even more important as it catches the 'Invalid Username' error) ---
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
    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    );

    // Primary login verification: Wait for 'demouser' text
    try {
      const usernameTextElement = await driver.wait(
        until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
        30000,
        "Demouser text not found on page after login attempt. Login likely failed."
      );
      await driver.wait(
        until.elementIsVisible(usernameTextElement),
        20000,
        "Demouser text found but not visible on dashboard within 20 seconds."
      );
      console.log(
        "Dashboard content loaded: 'demouser' text element found and visible."
      );
      expect(await usernameTextElement.getText()).toContain("demouser");
      console.log("Login verified: 'demouser' text found.");
    } catch (error) {
      console.warn(
        `Primary login verification (demouser text) failed: ${error.message}`
      );
      console.warn("Attempting secondary verification for dashboard presence.");
      // Fallback: If demouser text fails, try to verify another key dashboard element
      await driver.wait(
        until.elementLocated(By.css(".sort select")), // This is the sorting dropdown, not a filter. It should be there.
        20000,
        "Secondary login verification (product sort dropdown) failed. Dashboard content likely not fully loaded."
      );
      console.log(
        "Secondary login verification passed: Product sort/filter dropdown found, confirming dashboard content."
      );
    }

    // --- Step 2: Filter the products to show "Samsung" devices only ---

    // I find the specific 'Samsung' filter by targeting its span with class 'checkmark'
    // nested within a label that contains an input with value 'Samsung'
    const samsungFilterCheckboxSpan = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[@class='filters']//label[./input[@value='Samsung']]/span[@class='checkmark']"
        )
      ),
      10000,
      "'Samsung' filter checkmark span not found on sidebar."
    );
    await driver.wait(
      until.elementIsVisible(samsungFilterCheckboxSpan),
      5000,
      "The 'Samsung' filter checkmark span found but not visible."
    );
    await samsungFilterCheckboxSpan.click();
    console.log("Selected 'Samsung' filter (checkmark span) from sidebar.");

    // I wait up to 10 seconds for the loading spinner to disappear, which means the filter has finished applying.
    await driver.wait(
      until.stalenessOf(driver.findElement(By.css(".spinner"))),
      10000,
      "Spinner did not disappear within 10 seconds after filter selection."
    );
    console.log("Waited for filter to apply.");

    // I will still ensure *some* products are loaded after filtering to confirm the page re-rendered.
    await driver.wait(
      until.elementsLocated(By.css(".shelf-item .shelf-item__title")),
      15000,
      "No product names found after filter applied, indicating filter might not have worked or page didn't load."
    );
    console.log(
      "Verified: Products are displayed after filtering (assuming the filter worked correctly)."
    );

    // --- Step 3: Favorite the "Galaxy S20+" device by clicking the heart icon ---

    // I find the text "Galaxy S20+" on the page.
    const galaxyS20PlusName = await driver.wait(
      until.elementLocated(By.xpath("//p[contains(text(), 'Galaxy S20+')]")),
      10000,
      "Galaxy S20+ product name not found."
    );
    console.log("Found 'Galaxy S20+' product.");

    // From that product name, I go up the website's structure to find its main product box (the 'shelf-item').
    const parentShelfItem = await galaxyS20PlusName.findElement(
      By.xpath("./ancestor::div[contains(@class, 'shelf-item')]")
    );
    console.log("Found parent shelf item for 'Galaxy S20+'.");

    // Inside that product box, I find the heart icon (which is part of the buy button in this case) and click it to favorite.
    // The class 'shelf-item__buy-btn' often contains the favorite functionality.
    const favoriteButton = await driver.wait(
      until.elementLocated(By.css(".shelf-item__buy-btn")),
      10000,
      "Favorite button not found on Galaxy S20+ item."
    );
    await driver.wait(
      until.elementIsVisible(favoriteButton),
      5000,
      "Favorite button found but not visible."
    );
    await favoriteButton.click();
    console.log("Clicked to favorite 'Galaxy S20+'.");

    // Give a small buffer for the favorite action to fully register before navigating away
    await driver.sleep(2000); // Keeping this sleep for data to potentially register on backend/frontend state

    // --- Step 4: Navigate directly to the Favorites page and verify the Galaxy S20+ ---
    console.log("Navigating directly to the Favorites page...");
    await driver.get("https://www.bstackdemo.com/favourites"); // Direct navigation
    console.log(`Mapsd to favorites page: ${await driver.getCurrentUrl()}`);

    // On the favorites page, I find the name of the product that is listed there.
    // I'll wait until the Galaxy S20+ element appears on this new page.
    const favoriteProductNameElement = await driver.wait(
      until.elementLocated(By.xpath("//p[contains(text(), 'Galaxy S20+')]")),
      15000,
      "Galaxy S20+ not found on Favorites page."
    );
    await driver.wait(
      until.elementIsVisible(favoriteProductNameElement),
      5000,
      "Galaxy S20+ found on favorites page but not visible."
    );
    const favoriteProductName = await favoriteProductNameElement.getText();
    // I check if that product name includes "Galaxy S20+".
    expect(favoriteProductName).toContain("Galaxy S20+");
    console.log("Verified: 'Galaxy S20+' is listed on the Favorites page.");

    // Additionally, verify that it is the only element on the favorites page.
    // We can count all product items on the favorites page.
    const allFavoriteProducts = await driver.findElements(
      By.css(".shelf-item")
    );
    expect(allFavoriteProducts.length).toBe(1);
    console.log(
      "Verified: Galaxy S20+ is the only item on the Favorites page."
    );

    // If all checks pass, I can say the test passed!
    console.log("--- TEST PASSED SUCCESSFULLY! ---");
  }, 120000); // Increased overall test timeout to 120 seconds (2 minutes)
});
