const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('request', request => {
      const url = request.url();
      if (url.includes('emulatorjs.org')) {
          console.log(url);
      }
  });

  const fileUrl = 'file://' + path.join(__dirname, '../snes/index.html');
  await page.goto(fileUrl);
  
  // Wait a bit to let it load
  await page.waitForTimeout(3000);
  
  // click the first game to trigger the emulator load
  const firstGame = await page.$('.game-card');
  if (firstGame) {
      await firstGame.click();
      await page.waitForTimeout(5000);
  }
  
  await browser.close();
}
main();
