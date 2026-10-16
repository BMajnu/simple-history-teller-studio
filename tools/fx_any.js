// Payload: screenshot whatever tab is active (visible).
await page.bringToFront();
await page.waitForTimeout(1200);
await page.screenshot({ path: 'tools/fx_cur.png' });
return { url: page.url(), title: await page.title().catch(() => '') };
