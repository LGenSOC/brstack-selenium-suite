const { Builder, By, until } = require("selenium-webdriver");
const assert = require("chai").assert;

describe("Samsung Product Favoriting Test", function () {
  let driver;
  this.timeout(15000);

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://your-app-url.com/products");
  });

  it("should filter products by Samsung", async function () {
    // Wait for and click Samsung filter checkbox
    const samsungCheckbox = await driver.wait(
      until.elementLocated(
        By.xpath('//label[input[@value="Samsung"]]/span[@class="checkmark"]')
      ),
      5000
    );
    await samsungCheckbox.click();

    // Wait for filtering to complete by checking product count
    await driver.wait(async () => {
      const countElement = await driver.findElement(
        By.css(".products-found span")
      );
      const countText = await countElement.getText();
      return countText.includes("7 Product(s) found");
    }, 5000);
  });

  it("should add Samsung Galaxy S20 to favorites", async function () {
    // Find Galaxy S20 product by its ID
    const galaxyS20 = await driver.wait(
      until.elementLocated(By.id("10")),
      5000
    );

    // Click the heart icon (note the 'clicked' class indicates favorited state)
    const heartIcon = await galaxyS20.findElement(
      By.css(".shelf-stopper button")
    );
    await heartIcon.click();

    // Verify visual feedback - heart should have 'clicked' class
    const heartClass = await heartIcon.getAttribute("class");
    assert.include(
      heartClass,
      "clicked",
      "Heart icon should show as favorited"
    );
  });

  it("should show Galaxy S20 in favorites page", async function () {
    // Navigate to favorites
    const favoritesLink = await driver.findElement(By.id("favourites"));
    await favoritesLink.click();

    // Wait for favorites page to load
    await driver.wait(until.urlContains("/favourites"), 5000);

    // Verify Galaxy S20 appears in favorites
    const favProduct = await driver.wait(
      until.elementLocated(By.xpath('//p[contains(text(), "Galaxy S20")]')),
      5000
    );
    assert.isTrue(
      await favProduct.isDisplayed(),
      "Galaxy S20 should be in favorites"
    );
  });

  after(async function () {
    await driver.quit();
  });
});
