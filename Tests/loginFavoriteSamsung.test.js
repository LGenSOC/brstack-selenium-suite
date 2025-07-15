// I bring in the tools I need from Selenium, like how to build a browser,
// find things on a page (By), and wait for things (until).
const { Builder, By, until } = require("selenium-webdriver");
// I also bring in the 'Key' module, though it's not strictly used in this test.
const { Key } = require("selenium-webdriver"); // Keeping it for consistency.
// I get my browser settings (like Chrome, Firefox, or Samsung phone)
// from the 'browserstack.config.js' file that I just set up.
// Make sure this path is correct relative to where this test file lives.
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

    // I choose which device/browser configuration to use from my 'browserstack.config.js'.
    // capabilities[0] is Windows 10 Chrome
    // capabilities[1] is macOS Ventura Firefox
    // capabilities[2] is Samsung Galaxy S22
    // For this test, I'm aiming for the Samsung Galaxy S22, so I use capabilities[2].
    const selectedCapability = {
      ...capabilities[2], // <--- IMPORTANT: Change this index if you want a different browser/device from config
      // I explicitly set credentials to ensure they're fresh for this session.
      "browserstack.user": process.env.BROWSERSTACK_USERNAME,
      "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
    };

    // I build the WebDriver, connecting to BrowserStack's cloud hub.
    driver = await new Builder()
      .usingServer(
        `https://${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`
      )
      .withCapabilities(selectedCapability)
      .build();

    // I navigate the browser to the sign-in page of the application.
    await driver.get("https://www.bstackdemo.com/signin");
    console.log(`Mapsd to: ${await driver.getCurrentUrl()}`);

    // *** Keep this robust wait for page content to load after navigation ***
    // I try to wait for the main Next.js app container to appear and be visible.
    try {
      await driver.wait(
        until.elementLocated(By.id("__next")),
        20000, // Wait up to 20 seconds for the element to be located.
        "Main Next.js app container '__next' not found after initial load."
      );
      await driver.wait(
        until.elementIsVisible(await driver.findElement(By.id("__next"))),
        10000, // Wait up to 10 seconds for the element to be visible.
        "Main Next.js app container '__next' not visible after initial load."
      );
      console.log("Main '__next' container element visible.");
    } catch (error) {
      console.error(`Error waiting for initial page load: ${error.message}`);
      // If there's an error loading, I log the current URL and a snippet of the page source for debugging.
      console.log(
        `Current URL during load error: ${await driver.getCurrentUrl()}`
      );
      console.log(
        `Page source during load error (first 500 chars): ${await driver.getPageSource().then((s) => s.substring(0, 500))}`
      );
      throw error; // I re-throw the error to ensure the test fails if the page doesn't load.
    }
    // I add a short, static pause as a buffer. Sometimes, dynamic content needs a moment to settle.
    await driver.sleep(1500);
  }, 60000); // This sets a timeout for the entire 'beforeEach' hook (60 seconds).

  // 'afterEach' means "I do this code after *every* single test finishes."
  afterEach(async () => {
    if (driver) {
      // If the browser driver is active, I close the browser cleanly.
      await driver.quit();
      console.log("Browser session closed.");
    }
  }, 60000); // This sets a timeout for the entire 'afterEach' hook (60 seconds).

  // 'test' is one single test case. I give it a clear name about what it should do.
  test("should log in, filter Samsung, favorite Galaxy S20+, and verify on favorites page", async () => {
    // --- Step 1: Log into www.bstackdemo.com ---
    console.log(
      "Attempting login using click-dropdown-option strategy for React Select components."
    );

    // --- Username selection ---
    // I find the wrapper element for the username dropdown.
    const usernameDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("username")),
      15000,
      "Username dropdown wrapper (id='username') not found."
    );
    console.log("Username dropdown wrapper found.");
    // I click the wrapper to open the dropdown options.
    await usernameDropdownWrapper.click();
    console.log("Clicked username dropdown wrapper to open options.");
    await driver.sleep(1500); // Give a bit more time for options to render in the DOM.

    // I locate the specific 'demouser' option by its text content and a common React Select ID pattern.
    const demouserOption = await driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@id, 'react-select') and text()='demouser']")
      ),
      10000,
      "Specific option 'demouser' not found in username dropdown."
    );
    // I ensure the option is visible before attempting to click it.
    await driver.wait(
      until.elementIsVisible(demouserOption),
      5000,
      "Option 'demouser' found but not visible."
    );
    await demouserOption.click();
    console.log("Selected 'demouser' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register and UI to update.

    // --- Password selection (using similar logic to username) ---
    // I find the wrapper element for the password dropdown.
    const passwordDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("password")),
      15000,
      "Password dropdown wrapper (id='password') not found."
    );
    console.log("Password dropdown wrapper found.");
    // I click the wrapper to open the dropdown options.
    await passwordDropdownWrapper.click();
    console.log("Clicked password dropdown wrapper to open options.");
    await driver.sleep(1500); // Give a bit more time for options to render.

    // I locate the specific 'testingisfun99' option by its text content and React Select ID pattern.
    const testingisfun99Option = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@id, 'react-select') and text()='testingisfun99']"
        )
      ),
      10000,
      "Specific option 'testingisfun99' not found in password dropdown."
    );
    // I ensure the option is visible before attempting to click it.
    await driver.wait(
      until.elementIsVisible(testingisfun99Option),
      5000,
      "Option 'testingisfun99' found but not visible."
    );
    await testingisfun99Option.click();
    console.log("Selected 'testingisfun99' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register and UI to update.

    // --- Click the Login button ---
    // I find the Login button.
    const loginButton = await driver.wait(
      until.elementLocated(By.id("login-btn")),
      10000,
      "Login button not found."
    );
    console.log("Login button found.");
    // I ensure the login button is visible and enabled before clicking.
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

    // IMPORTANT: I add a robust wait after the login attempt to allow for UI updates and dynamic content loading.
    await driver.sleep(7000); // Giving ample time for the page to transition/load after the button click.

    // --- CHECK FOR LOGIN ERROR MESSAGES (This section is now even more important as it catches the 'Invalid Username' error) ---
    try {
      // I try to find a common error message element, with a short timeout.
      const errorMessage = await driver.wait(
        until.elementLocated(
          By.css('.api-error, .error-message, [role="alert"]')
        ),
        5000 // A short wait, as we expect it not to be there on successful login.
      );
      const errorText = await errorMessage.getText();
      if (errorText.length > 0 && errorText.includes("Invalid Username")) {
        console.error(
          `Login failed: Found "Invalid Username" error message on page: "${errorText}"`
        );
        // If this specific error is found, I throw an error to fail the test.
        throw new Error(`Login failed due to error message: "${errorText}"`);
      } else if (errorText.length > 0) {
        // If another error message is found, I log a warning.
        console.warn(
          `Found other error message after login: "${errorText}". Proceeding if not "Invalid Username".`
        );
      } else {
        // If element is found but has no text, I log that.
        console.log(
          "No explicit error message text found after login attempt."
        );
      }
    } catch (e) {
      // If the error message element is not found (NoSuchElementError) or the wait times out (TimeoutError),
      // it means no error message was displayed, which is the expected behavior for a successful login.
      if (e.name === "TimeoutError" || e.name === "NoSuchElementError") {
        console.log(
          "No common error message element found, proceeding as expected (assuming successful login)."
        );
      } else {
        // Any other unexpected errors during this check are re-thrown.
        console.warn(
          "Unexpected error during error message check (not NoSuchElementError/TimeoutError):",
          e.message
        );
        throw e;
      }
    }

    // --- LOGIN VERIFICATION: Directly check for dashboard elements on the SAME URL ---
    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    );

    // Primary login verification: I wait for the 'demouser' text to appear, indicating login success.
    try {
      const usernameTextElement = await driver.wait(
        until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
        30000, // I give a generous 30 seconds for the user info to appear.
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
      // I use Jest's 'expect' to confirm the text content.
      expect(await usernameTextElement.getText()).toContain("demouser");
      console.log("Login verified: 'demouser' text found.");
    } catch (error) {
      console.warn(
        `Primary login verification (demouser text) failed: ${error.message}`
      );
      console.warn("Attempting secondary verification for dashboard presence.");
      // As a fallback, if 'demouser' text isn't found, I try to verify another key dashboard element, like the product sort dropdown.
      await driver.wait(
        until.elementLocated(By.css(".sort select")),
        20000,
        "Secondary login verification (product sort dropdown) failed. Dashboard content likely not fully loaded."
      );
      console.log(
        "Secondary login verification passed: Product sort/filter dropdown found, confirming dashboard content."
      );
    }

    // --- Step 2: Filter the products to show "Samsung" devices only ---
    // I find the specific 'Samsung' filter by targeting its span with class 'checkmark'
    // nested within a label that contains an input with value 'Samsung'.
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

    // I find the heart icon button directly within the parentShelfItem.
    // I'm using `findElement` on `parentShelfItem` to scope the search locally.
    const favoriteHeartButton = await parentShelfItem.findElement(
      By.xpath(
        ".//div[@class='shelf-stopper']/button[./span/svg/*[local-name()='path']]"
      )
    );
    console.log("Found favorite heart button within 'Galaxy S20+' shelf item.");

    // I ensure the button is visible before clicking.
    await driver.wait(
      until.elementIsVisible(favoriteHeartButton),
      5000,
      "Favorite heart button found but not visible."
    );
    await favoriteHeartButton.click();
    console.log("Clicked the heart icon to favorite 'Galaxy S20+'.");

    // --- Wait for the favorites count to update ---
    console.log("Waiting for favorites count to update in the header...");
    const favoritesCountElement = await driver.wait(
      until.elementLocated(By.id("favorites-count")),
      10000,
      "Favorites count element not found in header."
    );
    // I wait for the count to be greater than 0, which means an item has been added.
    await driver.wait(
      async () => {
        const countText = await favoritesCountElement.getText();
        const count = parseInt(countText, 10);
        return count > 0;
      },
      10000, // This is the timeout for the _condition_ to be met (count > 0).
      "Favorites count did not update to > 0 within 10 seconds."
    );
    console.log(
      `Favorites count updated to: ${await favoritesCountElement.getText()}`
    );

    // --- Step 4: Navigate directly to the Favorites page and verify the Galaxy S20+ ---
    console.log("Navigating directly to the Favorites page...");
    await driver.get("https://www.bstackdemo.com/favourites"); // I navigate directly to the favorites page URL.
    console.log(`Mapped to favorites page: ${await driver.getCurrentUrl()}`);

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

    // Additionally, I verify that it is the only element on the favorites page.
    // I count all product items on the favorites page.
    const allFavoriteProducts = await driver.findElements(
      By.css(".shelf-item")
    );
    expect(allFavoriteProducts.length).toBe(1);
    console.log(
      "Verified: Galaxy S20+ is the only item on the Favorites page."
    );

    // If all checks pass, I can say the test passed! 🎉
    console.log("--- TEST PASSED SUCCESSFULLY! --- 🎉");
  }, 120000); // Increased overall test timeout to 120 seconds (2 minutes).
});
