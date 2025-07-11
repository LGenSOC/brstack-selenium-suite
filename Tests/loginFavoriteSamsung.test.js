// I bring in the tools I need from Selenium, like how to build a browser,
// find things on a page (By), press special keys (Key), and wait for things (until).
const { Builder, By, Key, until } = require("selenium-webdriver");
// I bring in 'Chai', which helps me check if my tests pass or fail.
// I use 'expect' from Chai to say what I expect to happen.
const { expect } = require("chai");
// I get my browser settings (like Chrome, Firefox, or Samsung phone)
// from the 'browserstack.config.js' file that I just set up.
const { capabilities } = require("../browserstack.config");
// 'describe' is like a big box for all related tests.
// I'm giving my test suite a name: "Bstackdemo Login and Samsung Galaxy S20+ Favorite Test".
describe("Bstackdemo Login and Samsung Galaxy S20+ Favorite Test", function () {
  // I tell my test to wait up to 60 seconds (60000 milliseconds) for things to happen.
  // Tests on BrowserStack might take a bit longer to connect.
  this.timeout(60000);
  // This variable will hold my web browser driver, which is what controls the browser.
  let driver;

  // 'beforeEach' means "I do this code before *every* single test starts."
  // It's good for setting up my browser and going to the website each time.
  beforeEach(async function () {
    // I'll use the very first browser setting from my 'browserstack.config.js' file.
    // So, it will open Chrome on Windows 10 for this test example.
    const capability = capabilities[0];
    // This is where I tell Selenium to build and start the web browser.
    // I connect to BrowserStack's cloud server.
    driver = new Builder()
      .usingServer("https://hub-cloud.browserstack.com/wd/hub")
      .withCapabilities(capability) // I use my chosen browser settings
      .build(); // I make the browser driver ready

    // I tell the browser to go to the website I want to test.
    await driver.get("https://www.bstackdemo.com");
  });
  //'afterEach' means "I do this code after *every* single test finishes."
  // It's very important to close the browser after each test is done.
  afterEach(async function () {
    if (driver) {
      // If the browser is open, I close it cleanly.
      await driver.quit();
    }
  });
  // 'it' is one single test. I give it a clear name about what it should do.
  it("should log in, filter Samsung, favorite Galaxy S20+, and verify on favorites page", async function () {
    // --- Step 1: Log into www.bstackdemo.com ---

    // First, I find the "Sign In" button on the page by its ID and click it.
    await driver.findElement(By.id("signin")).click();
    console.log("Clicked 'Sign In' button.");
    // Now, I find the username input field and type "demouser" into it.
    await driver.findElement(By.css("#username input")).sendKeys("demouser");
    console.log("Entered username.");

    // I find the password input field, type "testingisfun99" into it,
    // and then press the ENTER key to submit the login form.
    await driver
      .findElement(By.css("#password input"))
      .sendKeys("testingisfun99", Key.RETURN);
    console.log("Entered password and pressed Enter.");
    // I wait up to 10 seconds until the website's address (URL) changes to include "dashboard".
    // This helps me know the login was successful.
    await driver.wait(until.urlContains("dashboard"), 10000);
    console.log("Navigated to dashboard after login.");

    // After logging in, I check if I can see the "demouser" text on the page.
    // I find the element that shows the username.
    const usernameElement = await driver.findElement(By.css(".username"));
    // I check if the text of that element actually includes "demouser".
    expect(await usernameElement.getText()).to.include("demouser");
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
    expect(firstProductName).to.include("Samsung");
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
    const favoritesCount = await driver
      .findElement(By.id("favorites-count"))
      .getText();
    // I expect the favorites count to now show "1".
    expect(favoritesCount).to.equal("1");
    console.log("Favorites count updated to 1.");
    // --- Step 4: Verify that the Galaxy S20+ is listed on the Favorites page ---

    // I find the "Favorites" link on the page by its ID and click it to go to the favorites page.
    await driver.findElement(By.id("favorites")).click();
    console.log("Clicked 'Favorites' link.");

    // I wait up to 10 seconds until the URL includes "favorites" to confirm I am on the correct page.
    await driver.wait(until.urlContains("favorites"), 10000);
    console.log("Navigated to Favorites page.");

    // On the favorites page, I find the name of the product that is listed there.
    const favoriteProductName = await driver
      .findElement(By.css(".shelf-item .shelf-item__title"))
      .getText();
    // I check if that product name includes "Galaxy S20+".
    expect(favoriteProductName).to.include("Galaxy S20+");
    console.log("Verified: 'Galaxy S20+' is listed on the Favorites page.");

    // If all checks pass, I can say the test passed!
    console.log("--- TEST PASSED SUCCESSFULLY! ---");
  });
});
