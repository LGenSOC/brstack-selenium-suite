const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert"); // For assertions

async function loginFavouriteSamsungTest() {
  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://www.bstackdemo.com/"); // Replace with the actual URL if different

    // 1. Login to the application
    console.log("Attempting to log in...");
    const signInLink = await driver.wait(
      until.elementLocated(By.id("signin")),
      10000
    );
    await signInLink.click();

    const usernameField = await driver.wait(
      until.elementLocated(By.id("react-select-2-input")),
      10000
    );
    await usernameField.sendKeys("demouser");
    await driver.findElement(By.id("react-select-2-input")).sendKeys(By.ENTER); // Select the entered value

    const passwordField = await driver.wait(
      until.elementLocated(By.id("react-select-3-input")),
      10000
    );
    await passwordField.sendKeys("testingisfun99");
    await driver.findElement(By.id("react-select-3-input")).sendKeys(By.ENTER); // Select the entered value

    const loginButton = await driver.findElement(By.id("login-btn"));
    await loginButton.click();
    console.log("Login button clicked.");

    // Wait for successful login (e.g., username visible)
    await driver.wait(until.elementLocated(By.className("username")), 10000);
    const loggedInUser = await driver
      .findElement(By.className("username"))
      .getText();
    assert.strictEqual(
      loggedInUser,
      "demouser",
      "Login failed: 'demouser' not found."
    );
    console.log(`Successfully logged in as: ${loggedInUser}`);

    // 2. Locate and favorite the Galaxy S20
    console.log("Attempting to favorite Galaxy S20...");
    const galaxyS20ShelfItem = await driver.findElement(
      By.css('[data-sku="samsung-S20-device-info.png"]')
    );
    console.log("Found Galaxy S20 shelf item.");

    const favoriteHeartButton = await driver.wait(
      until.elementLocated(By.xpath(".//div[@class='shelf-stopper']/button")),
      10000,
      "Heart button for Galaxy S20 not found within the shelf item."
    );
    await driver.wait(
      until.elementIsVisible(favoriteHeartButton),
      5000,
      "Heart button not visible."
    );
    await driver.wait(
      until.elementIsEnabled(favoriteHeartButton),
      5000,
      "Heart button not enabled."
    );

    await favoriteHeartButton.click();
    console.log("Clicked heart button for Galaxy S20, adding to favorites.");

    // Verify the 'clicked' class is added
    const buttonClasses = await favoriteHeartButton.getAttribute("class");
    assert.ok(
      buttonClasses.includes("clicked"),
      "Heart button for Galaxy S20 did not get 'clicked' class."
    );
    console.log(
      "Heart button for Galaxy S20 now has 'clicked' class (indicating favorited)."
    );

    // 3. Navigate to Favourites page
    console.log("Navigating to Favourites page...");
    const favouritesLink = await driver.findElement(By.id("favourites"));
    await favouritesLink.click();
    console.log("Navigated to Favourites page.");

    // 4. Verify Galaxy S20 is present on the Favourites page
    console.log("Verifying Galaxy S20 on Favourites page...");
    await driver.wait(
      until.elementLocated(By.xpath("//p[text()='Galaxy S20']")),
      10000,
      "Galaxy S20 not found on Favourites page."
    );
    console.log(
      "Galaxy S20 successfully verified on Favourites page. 🎉 Test Passed!"
    );
  } catch (error) {
    console.error("Test Failed: An error occurred:", error);
    // Take a screenshot on error for debugging
    if (driver) {
      const screenshot = await driver.takeScreenshot();
      require("fs").writeFileSync(
        "error_screenshot_login_fav.png",
        screenshot,
        "base64"
      );
      console.log("Screenshot taken: error_screenshot_login_fav.png");
    }
    assert.fail(error); // Re-throw or fail the test explicitly
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

// Execute the test function
loginFavouriteSamsungTest();
