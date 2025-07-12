const commonCapabilities = {
  "browserstack.user": process.env.BROWSERSTACK_USERNAME,
  "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
  build: "BSTACK Tech Challenge",
  name: "Tech Challenge Test",
  "browserstack.debug": true,
  "browserstack.networkLogs": true,
};

// --- ADDING NEW DIAGNOSTIC LINES HERE ---
console.log(
  "Node.js BROWSERSTACK_USERNAME:",
  process.env.BROWSERSTACK_USERNAME
);
console.log(
  "Node.js BROWSERSTACK_ACCESS_KEY:",
  process.env.BROWSERSTACK_ACCESS_KEY
);
// --- ENDING NEW DIAGNOSTIC LINES ---

const capabilities = [];

// Configuration for Windows 10 Chrome
capabilities.push({
  ...commonCapabilities,
  os: "Windows",
  os_version: "10",
  browserName: "Chrome",
});

// Configuration for macOS Ventura Firefox
capabilities.push({
  ...commonCapabilities,
  os: "OS X",
  os_version: "Ventura",
  browserName: "Firefox",
});

// Configuration for Samsung Galaxy S22 (Real Mobile Device)
capabilities.push({
  ...commonCapabilities,
  device: "Samsung Galaxy S22",
  realMobile: "true",
  browserName: "Android", // Use "Android" for mobile browsers on real devices
});

module.exports = {
  capabilities,
};
