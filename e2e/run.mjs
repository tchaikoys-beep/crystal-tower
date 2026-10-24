import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { createServer } from 'vite';
const server = await createServer({ root: '/home/user/crystal-tower', server: { port: 5173, strictPort: true } });
await server.listen();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const dir = '/tmp/claude-0/-home-user/76c2b766-ca9a-5e27-a4c5-81695450aebc/scratchpad/shots/';
const shot = (n) => page.screenshot({ path: dir + n + '.png' });
await page.goto('http://localhost:5173/');
await page.waitForTimeout(500);
await shot('01-title');
await page.getByRole('button', { name: '選ぶ' }).nth(2).click();
await page.waitForTimeout(300);
await shot('02-hub');
await page.getByRole('button', { name: /塔へ登る/ }).click();
await page.waitForTimeout(300);
await shot('03-tower');
// 戦う（オート）
for (let i = 0; i < 12; i++) {
  const fight = page.getByRole('button', { name: /^戦う$|に挑む$/ });
  const climb = page.getByRole('button', { name: /階へ登る/ });
  const inspect = page.getByRole('button', { name: '調べる' });
  if (await fight.count()) {
    await fight.first().click();
    await page.waitForTimeout(400);
    if (i === 0) await shot('04-battle');
    // 戦闘終了を待つ
    await page.getByRole('button', { name: /結果へ|逃げた|全滅/ }).waitFor({ timeout: 60000 });
    if (i === 0) await shot('05-battle-end');
    await page.getByRole('button', { name: /結果へ|逃げた|全滅/ }).click();
    await page.waitForTimeout(200);
    if (i === 0) await shot('06-result');
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(200);
  } else if (await inspect.count()) { await inspect.click(); await page.waitForTimeout(200); }
  else if (await climb.count()) { await climb.click(); await page.waitForTimeout(200); }
  else break;
}
await shot('07-tower-later');
await page.getByRole('button', { name: 'メニュー' }).click();
await page.waitForTimeout(200);
await shot('08-menu-party');
await page.getByRole('button', { name: 'ステータス' }).click();
await page.waitForTimeout(200);
await shot('08b-status');
await page.getByRole('button', { name: '装備' }).click();
await page.waitForTimeout(200);
await page.locator('.item').first().click();
await page.waitForTimeout(200);
await shot('09-menu-equip');
await page.getByRole('button', { name: 'アビリティ' }).click();
await page.waitForTimeout(200);
await shot('10-menu-ability');
await page.getByRole('button', { name: '作戦' }).click();
await page.waitForTimeout(200);
await shot('11-menu-gambit');
await page.getByRole('button', { name: '戻る' }).click();
await page.getByRole('button', { name: '拠点へ' }).click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: '合成屋' }).click();
await page.waitForTimeout(200);
await shot('11b-synth');
await page.getByRole('button', { name: 'リロール' }).click();
await page.waitForTimeout(200);
await shot('11c-synth-reroll');
await page.getByRole('button', { name: '戻る' }).click();
await page.getByRole('button', { name: '転生の祭壇' }).click();
await page.waitForTimeout(200);
await shot('12-rebirth');
await page.getByRole('button', { name: '転生ボード' }).click();
await page.waitForTimeout(200);
await shot('13-board');
// 手動戦闘テスト
await page.getByRole('button', { name: '戻る' }).click();
await page.getByRole('button', { name: /塔へ登る/ }).click();
await page.waitForTimeout(200);
const fight = page.getByRole('button', { name: /^戦う$|に挑む$/ });
if (await fight.count()) {
  await fight.first().click();
  await page.waitForTimeout(300);
  const autoBtn = page.getByRole('button', { name: /オート:ON/ });
  if (await autoBtn.count()) await autoBtn.click();
  await page.waitForTimeout(2500);
  await shot('14-manual');
  const atk = page.getByRole('button', { name: 'たたかう' });
  if (await atk.count()) { await atk.click(); await page.waitForTimeout(300); await shot('15-manual-target'); }
}
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
await server.close();
