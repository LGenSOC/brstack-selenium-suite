const { Builder, By, until } = require("selenium-webdriver");
// Key is not strictly needed for this specific test, but keeping it as it was in your original setup
// for consistency, though it's not used.
const { Key } = require("selenium-webdriver");
// Get browser settings from the 'browserstack.config.js' file.
// Ensure this path is correct relative to your test file.
const { capabilities } = require("../browserstack.config");

// 'describe' groups related tests together.
describe("Bstackdemo Login and Samsung Galaxy S20+ Favorite Test", () => {
  // This variable will hold the WebDriver instance.
  let driver;

  // This runs before each test. It sets up the browser and navigates to the sign-in page.
  beforeEach(async () => {
    // Verify BrowserStack credentials are available from environment variables.
    if (
      !process.env.BROWSERSTACK_USERNAME ||
      !process.env.BROWSERSTACK_ACCESS_KEY
    ) {
      throw new Error("BrowserStack credentials missing! Check Jenkins setup.");
    }

    // Select the specific capability you want to use from browserstack.config.js.
    // capabilities[0] is Windows Chrome
    // capabilities[1] is macOS Firefox
    // capabilities[2] is Samsung Galaxy S22
    // Choose the one you intend to run this test on. For the 'Galaxy S20+' test, you might want index 2.
    const selectedCapability = {
      ...capabilities[2], // <--- Change this index if you want a different browser/device from config
      // Explicitly set credentials to ensure they are used for the session.
      "browserstack.user": process.env.BROWSERSTACK_USERNAME,
      "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
    };

    // Build the WebDriver instance, connecting to BrowserStack's hub.
    driver = await new Builder()
      .usingServer(
        `https://${process.env.BROWSERSTACK_USERNAME}:${process.env.BROWSERSTACK_ACCESS_KEY}@hub-cloud.browserstack.com/wd/hub`
      )
      .withCapabilities(selectedCapability)
      .build();

    // Navigate to the sign-in page.
    await driver.get("https://www.bstackdemo.com/signin");
    console.log(`Mapsd to: ${await driver.getCurrentUrl()}`);

    // Robust wait for the main application container to load and be visible.
    try {
      await driver.wait(
        until.elementLocated(By.id("__next")),
        20000,
        "Main Next.js app container '__next' not found after initial load."
      );
      await driver.wait(
        until.elementIsVisible(await driver.findElement(By.id("__next"))),
        10000,
        "Main Next.js app container '__next' not visible after initial load."
      );
      console.log("Main '__next' container element visible.");
    } catch (error) {
      console.error(`Error waiting for initial page load: ${error.message}`);
      // Log current state for debugging.
      console.log(
        `Current URL during load error: ${await driver.getCurrentUrl()}`
      );
      console.log(
        `Page source during load error (first 500 chars): ${await driver.getPageSource().then((s) => s.substring(0, 500))}`
      );
      throw error; // Re-throw to fail the setup if the page doesn't load correctly.
    }
    // Give a short static pause as a buffer after initial DOM load, sometimes needed for dynamic content.
    await driver.sleep(1500);
  }, 60000); // Timeout for the beforeEach hook.

  // This runs after each test, ensuring the browser is closed cleanly.
  afterEach(async () => {
    if (driver) {
      await driver.quit();
      console.log("Browser session closed.");
    }
  }, 60000); // Timeout for the afterEach hook.

  // This is the actual test case.
  test("should log in, filter Samsung, favorite Galaxy S20+, and verify on favorites page", async () => {
    // --- Step 1: Log into www.bstackdemo.com ---
    console.log(
      "Attempting login using click-dropdown-option strategy for React Select components."
    );

    // Username selection
    const usernameDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("username")),
      15000,
      "Username dropdown wrapper (id='username') not found."
    );
    console.log("Username dropdown wrapper found.");
    await usernameDropdownWrapper.click();
    console.log("Clicked username dropdown wrapper to open options.");
    await driver.sleep(1500); // Give time for options to appear.

    const demouserOption = await driver.wait(
      until.elementLocated(
        By.xpath("//div[contains(@id, 'react-select') and text()='demouser']")
      ),
      10000,
      "Specific option 'demouser' not found in username dropdown."
    );
    await driver.wait(
      until.elementIsVisible(demouserOption),
      5000,
      "Option 'demouser' found but not visible."
    );
    await demouserOption.click();
    console.log("Selected 'demouser' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register.

    // Password selection (similar logic)
    const passwordDropdownWrapper = await driver.wait(
      until.elementLocated(By.id("password")),
      15000,
      "Password dropdown wrapper (id='password') not found."
    );
    console.log("Password dropdown wrapper found.");
    await passwordDropdownWrapper.click();
    console.log("Clicked password dropdown wrapper to open options.");
    await driver.sleep(1500); // Give time for options to appear.

    const testingisfun99Option = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@id, 'react-select') and text()='testingisfun99']"
        )
      ),
      10000,
      "Specific option 'testingisfun99' not found in password dropdown."
    );
    await driver.wait(
      until.elementIsVisible(testingisfun99Option),
      5000,
      "Option 'testingisfun99' found but not visible."
    );
    await testingisfun99Option.click();
    console.log("Selected 'testingisfun99' from dropdown.");
    await driver.sleep(1500); // Give time for selection to register.

    // Click the Login button
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

    // Important: Add a robust wait after login attempt for UI updates and dynamic content loading.
    await driver.sleep(7000); // Increased static wait for page transition.

    // --- CHECK FOR LOGIN ERROR MESSAGES ---
    try {
      // Wait briefly for a potential error message element to appear.
      const errorMessage = await driver.wait(
        until.elementLocated(
          By.css('.api-error, .error-message, [role="alert"]')
        ),
        5000 // Short wait, as we expect it not to be there on success.
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
      }
    } catch (e) {
      // If the element is not found, it means no error message was displayed, which is good.
      if (e.name === "TimeoutError" || e.name === "NoSuchElementError") {
        console.log(
          "No common error message element found, proceeding as expected (assuming successful login)."
        );
      } else {
        // Re-throw any other unexpected errors during error message check.
        console.warn("Unexpected error during error message check:", e.message);
        throw e;
      }
    }

    // --- LOGIN VERIFICATION: Directly check for dashboard elements ---
    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    );

    // Primary login verification: Wait for 'demouser' text in the header.
    try {
      const usernameTextElement = await driver.wait(
        until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
        30000, // Longer wait for the user info to appear.
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
      // Assert using Jest's built-in `expect`.
      expect(await usernameTextElement.getText()).toContain("demouser");
      console.log("Login verified: 'demouser' text found.");
    } catch (error) {
      console.warn(
        `Primary login verification (demouser text) failed: ${error.message}`
      );
      // Fallback: If demouser text fails, try to verify another key dashboard element, like the sort dropdown.
      console.warn(
        "Attempting secondary verification for dashboard presence (product sort dropdown)."
      );
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
    // Find the 'Samsung' filter checkbox by its associated text and click its visual checkmark.
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

    // Wait for the loading spinner to disappear, indicating filtering is complete.
    await driver.wait(
      until.stalenessOf(driver.findElement(By.css(".spinner"))),
      10000,
      "Spinner did not disappear within 10 seconds after filter selection."
    );
    console.log("Waited for filter to apply.");

    // Verify that *some* products are loaded after filtering.
    await driver.wait(
      until.elementsLocated(By.css(".shelf-item .shelf-item__title")),
      15000,
      "No product names found after filter applied, indicating filter might not have worked or page didn't load."
    );
    console.log(
      "Verified: Products are displayed after filtering (assuming the filter worked correctly)."
    );

    // --- Step 3: Favorite the "Galaxy S20+" device by clicking the heart icon ---
    // Find the "Galaxy S20+" product name.
    const galaxyS20PlusName = await driver.wait(
      until.elementLocated(By.xpath("//p[contains(text(), 'Galaxy S20+')]")),
      10000,
      "Galaxy S20+ product name not found on the filtered list."
    );
    console.log("Found 'Galaxy S20+' product.");

    // From the product name, find its parent shelf item to accurately locate the heart button.
    const parentShelfItem = await galaxyS20PlusName.findElement(
      By.xpath("./ancestor::div[contains(@class, 'shelf-item')]")
    );
    console.log("Found parent shelf item for 'Galaxy S20+'.");

    // Find the heart icon button within the specific product's shelf item.
    const favoriteHeartButton = await parentShelfItem.findElement(
      By.xpath(
        ".//div[@class='shelf-stopper']/button[./span/svg/*[local-name()='path']]"
      )
    );
    console.log("Found favorite heart button within 'Galaxy S20+' shelf item.");

    // Ensure the button is visible before clicking.
    await driver.wait(
      until.elementIsVisible(favoriteHeartButton),
      5000,
      "Favorite heart button found but not visible."
    );
    await favoriteHeartButton.click();
    console.log("Clicked the heart icon to favorite 'Galaxy S20+'.");

    // --- Wait for the favorites count to update in the header ---
    console.log("Waiting for favorites count to update in the header...");
    const favoritesCountElement = await driver.wait(
      until.elementLocated(By.id("favorites-count")),
      10000,
      "Favorites count element not found in header after favoriting."
    );
    // Wait for the count to be greater than 0, indicating the item was added.
    await driver.wait(
      async () => {
        const countText = await favoritesCountElement.getText();
        const count = parseInt(countText, 10);
        return count > 0;
      },
      10000, // Timeout for the condition to be met.
      "Favorites count did not update to > 0 within 10 seconds after favoriting."
    );
    console.log(
      `Favorites count updated to: ${await favoritesCountElement.getText()}`
    );

    // --- Step 4: Navigate directly to the Favorites page and verify the Galaxy S20+ ---
    console.log("Navigating directly to the Favorites page...");
    await driver.get("https://www.bstackdemo.com/favourites"); // Direct navigation to the favorites page.
    console.log(`Mapped to favorites page: ${await driver.getCurrentUrl()}`);

    // On the favorites page, verify the "Galaxy S20+" product is listed.
    const favoriteProductNameElement = await driver.wait(
      until.elementLocated(By.xpath("//p[contains(text(), 'Galaxy S20+')]")),
      15000,
      "Galaxy S20+ not found on Favorites page after navigation."
    );
    await driver.wait(
      until.elementIsVisible(favoriteProductNameElement),
      5000,
      "Galaxy S20+ found on favorites page but not visible."
    );
    const favoriteProductName = await favoriteProductNameElement.getText();
    // Assert that the text includes "Galaxy S20+".
    expect(favoriteProductName).toContain("Galaxy S20+");
    console.log("Verified: 'Galaxy S20+' is listed on the Favorites page.");

    // Additionally, verify that it is the only item on the favorites page (assuming a clean state).
    const allFavoriteProducts = await driver.findElements(
      By.css(".shelf-item")
    );
    expect(allFavoriteProducts.length).toBe(1);
    console.log(
      "Verified: Galaxy S20+ is the only item on the Favorites page."
    );

    console.log("--- TEST PASSED SUCCESSFULLY! --- 🎉");
  }, 120000); // Overall timeout for this test case (2 minutes).
});
