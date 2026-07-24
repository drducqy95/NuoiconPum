import puppeteer from 'puppeteer';
import { exec } from 'child_process';

const server = exec('PORT=3001 npm run start');

(async () => {
  await new Promise(r => setTimeout(r, 3000));
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
  server.kill();
})();
