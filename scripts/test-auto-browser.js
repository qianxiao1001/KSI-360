import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', (msg) => console.log('[BROWSER]', msg.text()));
    page.on('error', (err) => console.error('[BROWSER ERROR]', err));
    
    // Set up console message and alert listener
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      console.log('Alert message:', alertMessage);
      await dialog.accept();
    });

    console.log('Opening app at http://localhost:5175/KSI360/');
    await page.goto('http://localhost:5175/KSI360/', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Waiting for admin password input...');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    console.log('Entering admin password: KSI2026');
    await page.type('input[type="password"]', 'KSI2026');

    console.log('Clicking admin button...');
    await page.click('button[type="submit"]');

    // Wait for admin page to load
    await new Promise(r => setTimeout(r, 2000));

    console.log('Clicking DB test button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const testBtn = buttons.find(b => b.textContent.includes('DB 测试写入'));
      if (testBtn) {
        console.log('Found and clicking test button');
        testBtn.click();
      } else {
        console.log('Test button not found');
      }
    });

    // Wait for alert
    await new Promise(r => setTimeout(r, 3000));

    console.log('Alert captured:', alertMessage);
    
    if (alertMessage.includes('成功')) {
      console.log('✓ Test PASSED: Database write successful');
      process.exit(0);
    } else if (alertMessage.includes('失败')) {
      console.log('✗ Test FAILED:', alertMessage);
      process.exit(1);
    } else if (alertMessage) {
      console.log('Result:', alertMessage);
      process.exit(0);
    } else {
      console.log('No alert received - checking logs');
      process.exit(1);
    }

  } catch (error) {
    console.error('Test error:', error);
    process.exit(2);
  } finally {
    await browser.close();
  }
})();
