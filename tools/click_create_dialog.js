async function clickCreateNewDialog() {
  const code = `
    const card = page.locator('button:has-text("Create new dialog"), div:has-text("Create new dialog")').last();
    await card.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    return { clicked: true };
  `;
  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    console.log(await res.json());
  } catch (e) {
    console.error(e);
  }
}
clickCreateNewDialog();
