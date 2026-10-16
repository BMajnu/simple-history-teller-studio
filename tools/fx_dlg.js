// Payload: dump upload dialog state (no focus steal).
const ctx = browser.contexts()[0];
const pg = ctx.pages().find((p) => (p.url() || '').includes('studio.youtube.com')) || page;
const dom = await pg.evaluate(() => ({
  url: location.href,
  titleBox: !!document.querySelector('#title-textarea #textbox'),
  anyTextbox: Array.from(document.querySelectorAll('[id*="textarea"]')).map((el) => el.id || el.tagName).slice(0, 8),
  steps: Array.from(document.querySelectorAll('ytcp-uploads-dialog [step], .step-title, ytcp-stepper')).map((el) => (el.innerText || '').trim().slice(0, 60)).slice(0, 8),
  body: document.body.innerText.slice(0, 600),
})).catch((e) => ({ err: 1 }));
await pg.screenshot({ path: 'tools/fx_dlg.png', timeout: 15000 }).catch(() => {});
return dom;
