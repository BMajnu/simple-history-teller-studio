// Payload: screenshot the Studio app window (visible proof).
await page.bringToFront();
await page.waitForTimeout(1500);
await page.screenshot({ path: 'tools/fx_app.png' });
return { url: page.url(), title: await page.title().catch(() => '') };
