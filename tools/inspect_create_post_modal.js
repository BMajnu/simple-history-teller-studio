const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));

  const info = await page.evaluate(() => {
    // Find heading or div with text "Create post"
    const headers = Array.from(document.querySelectorAll('h2, span, div')).filter(el => el.innerText === 'Create post');
    const header = headers[0];
    if (!header) return { found: false };

    // Traverse up to the modal container
    let container = header;
    while (container && container.parentElement && !container.classList.contains('x1n2onr6')) {
      container = container.parentElement;
      if (container.getAttribute('aria-label') === 'Create post' || container.tagName === 'FORM') break;
    }

    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
      accept: i.accept,
      multiple: i.multiple
    }));

    const textareas = Array.from(document.querySelectorAll('[contenteditable="true"]')).map(t => ({
      text: t.innerText,
      aria: t.getAttribute('aria-label')
    }));

    // Find all icons under "Add to your post"
    const addSection = Array.from(document.querySelectorAll('*')).find(el => el.innerText === 'Add to your post');
    let addButtons = [];
    if (addSection && addSection.parentElement) {
      addButtons = Array.from(addSection.parentElement.querySelectorAll('div[role="button"], div[aria-label]')).map(b => ({
        aria: b.getAttribute('aria-label'),
        html: b.outerHTML.slice(0, 100)
      }));
    }

    return { fileInputs, textareas, addButtons };
  });

  console.log('Modal elements:', JSON.stringify(info, null, 2));
  process.exit(0);
})();
