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
      // You can add a build name here if you want to group your Jenkins builds in BrowserStack
      // "build": `Jenkins Build - ${process.env.JENKINS_NODE_COOKIE || 'Local'} - ${new Date().toLocaleString()}`,
      // "name": "Bstackdemo Login Test"
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

    // **Username (React Select component)**
    const usernameDropdown = await driver.wait(
      until.elementLocated(By.id("username")),
      15000,
      "Username dropdown container (id='username') not found."
    );
    console.log("Username dropdown container found.");

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

    // **VERIFY USERNAME INPUT VALUE**
    // Find the hidden input associated with the React Select component
    const usernameInput = await driver.findElement(
      By.id("react-select-2-input")
    );
    const actualUsernameValue = await driver.executeScript(
      "return arguments[0].value;",
      usernameInput
    );
    console.log(
      `Actual username input value after selection: '${actualUsernameValue}'`
    );
    if (actualUsernameValue !== "demouser") {
      console.warn(
        "Username input value mismatch after selection. Forcing value via JavaScript."
      );
      await driver.executeScript(
        "arguments[0].value = 'demouser';",
        usernameInput
      );
      await driver.executeScript(
        "arguments[0].dispatchEvent(new Event('change'));",
        usernameInput
      );
      await driver.executeScript(
        "arguments[0].dispatchEvent(new Event('input'));",
        usernameInput
      ); // Also dispatch input event
    }

    // **Password (React Select component)**
    const passwordDropdown = await driver.wait(
      until.elementLocated(By.id("password")),
      15000,
      "Password dropdown container (id='password') not found."
    );
    console.log("Password dropdown container found.");

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

    // **VERIFY PASSWORD INPUT VALUE**
    // Find the hidden input associated with the React Select component
    const passwordInput = await driver.findElement(
      By.id("react-select-3-input")
    );
    const actualPasswordValue = await driver.executeScript(
      "return arguments[0].value;",
      passwordInput
    );
    console.log(
      `Actual password input value after selection: '${actualPasswordValue}'`
    );
    if (actualPasswordValue !== "testingisfun99") {
      console.warn(
        "Password input value mismatch after selection. Forcing value via JavaScript."
      );
      await driver.executeScript(
        "arguments[0].value = 'testingisfun99';",
        passwordInput
      );
      await driver.executeScript(
        "arguments[0].dispatchEvent(new Event('change'));",
        passwordInput
      );
      await driver.executeScript(
        "arguments[0].dispatchEvent(new Event('input'));",
        passwordInput
      ); // Also dispatch input event
    }

    // =================================================
    // ROBUST WAIT FOR OVERLAYS TO DISAPPEAR
    try {
      // Find elements that *might* be overlays/spinners.
      const overlays = await driver.findElements(
        By.css(
          'div[class*="css-"], div.ReactModal__Overlay, .loader, .spinner, [aria-busy="true"]'
        )
      );
      // Check each found overlay for staleness.
      for (let overlay of overlays) {
        try {
          await driver.wait(until.stalenessOf(overlay), 5000); // Shorter wait per element
          console.log("An overlay or loader disappeared.");
        } catch (e) {
          if (e.name === "TimeoutError") {
            console.warn(
              "An overlay or loader did not become stale within 5 seconds."
            );
          } else {
            console.warn(`Error waiting for overlay: ${e.message}`);
          }
        }
      }
      console.log(
        "Finished checking for potential intercepting overlays/loaders."
      );
    } catch (e) {
      if (e.name !== "NoSuchElementError") {
        // Only log if it's not just that the overlay wasn't found initially
        console.warn(
          "Could not check for overlays or unexpected error during initial find:",
          e.message
        );
      } else {
        console.log("No common intercepting overlay elements found.");
      }
    }
    // =================================================

    // Find the login form and submit it
    const loginForm = await driver.wait(
      until.elementLocated(By.css("form.w-80")), // Target the form directly
      15000,
      "Login form not found."
    );
    console.log("Login form found.");

    // Attempt to submit the form directly via JavaScript
    console.log("Attempting to submit form via JavaScript.");
    await driver.executeScript("arguments[0].submit();", loginForm);
    console.log("Form submitted via JavaScript.");

    // IMPORTANT: Add a longer wait after login attempt to allow for UI updates and dynamic content loading
    await driver.sleep(4000); // Increased significantly to 4 seconds for page content to load

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

    // --- LOGIN VERIFICATION: Directly check for dashboard elements on the SAME URL ---
    // Since manual login shows the content appearing on https://www.bstackdemo.com/?signin=true,
    // we don't wait for a URL change. We directly wait for dashboard elements.

    console.log(
      `Current URL before dashboard verification: ${await driver.getCurrentUrl()}`
    ); // Should still be ?signin=true

    // Now, confirm dashboard content loaded by waiting for the 'demouser' text itself.
    // This element should appear on the https://www.bstackdemo.com/?signin=true page after successful login.
    const usernameTextElement = await driver.wait(
      until.elementLocated(By.xpath("//span[contains(text(), 'demouser')]")),
      20000, // Long wait as this confirms successful login content is present
      "Demouser text not found on page after login attempt. Login likely failed."
    );
    await driver.wait(
      until.elementIsVisible(usernameTextElement),
      10000,
      "Demouser text found but not visible on dashboard within 10 seconds."
    );
    console.log(
      "Dashboard content loaded: 'demouser' text element found and visible."
    );

    // Now, I check if I can see the "demouser" text on the page.
    expect(await usernameTextElement.getText()).toContain("demouser");
    console.log("Login verified: 'demouser' text found.");

    // You can also add a check for the presence of the product list or filter options
    // to further confirm that the main content has loaded, as these would appear post-login.
    await driver.wait(
      until.elementLocated(By.css(".sort select")), // The filter dropdown
      15000,
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

    // IMPORTANT: Even though the main content stays on ?signin=true, the "favorites" link
    // *might* change the URL. Let's keep a flexible wait for URL to contain "favorites"
    // or just directly check for the presence of the favorite product.
    // Given the previous behavior, it's safer to directly check for the product on the favorites page content.
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
  }, 60000); // Set timeout for the test itself (60 seconds)
});
