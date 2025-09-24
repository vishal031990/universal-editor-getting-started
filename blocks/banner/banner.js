import { moveInstrumentation } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/* Expected authoring table (similar to hero but simplified):
   Row 1: Title | Description (richtext)
   Row 2: CTA1 Text | CTA1 Link
   Row 3: CTA2 Text | CTA2 Link
   Row 4: Foreground Image | Background Image
*/

export default function decorate(block) {
  block.classList.add('banner');

  const rows = [...block.children];
  const data = {
    title: '',
    description: '',
    ctas: [],
    fg: null,
    bg: null,
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    if (i === 0) {
      data.title = cells[0] ? cells[0].innerHTML.trim() : '';
      data.description = cells[1] ? cells[1].innerHTML : '';
    } else if (i === 1) {
      if (cells[0] && cells[1]) data.ctas.push({ text: cells[0].textContent.trim(), href: cells[1].querySelector('a') ? cells[1].querySelector('a').href : cells[1].textContent.trim(), style: 'primary' });
    } else if (i === 2) {
      if (cells[0] && cells[1]) data.ctas.push({ text: cells[0].textContent.trim(), href: cells[1].querySelector('a') ? cells[1].querySelector('a').href : cells[1].textContent.trim(), style: 'secondary' });
    } else if (i === 3) {
      if (cells[0]) data.fg = cells[0].querySelector('img');
      if (cells[1]) data.bg = cells[1].querySelector('img');
    }
  });

  // clear block
  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'banner-inner';

  // Title
  if (data.title) {
    const h1 = document.createElement('h1');
    h1.innerHTML = data.title; // instrumentation preserved via move later
    inner.append(h1);
  }

  // Description
  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'banner-description';
    desc.innerHTML = data.description;
    inner.append(desc);
  }

  // CTAs
  if (data.ctas.length) {
    const ctasDiv = document.createElement('div');
    ctasDiv.className = 'banner-ctas';
    data.ctas.forEach((c) => {
      if (!c.text || !c.href) return;
      const a = document.createElement('a');
      a.textContent = c.text;
      a.href = c.href;
      a.className = c.style;
      a.setAttribute('role', 'button');
      ctasDiv.append(a);
    });
    inner.append(ctasDiv);
  }

  block.append(inner);

  // Background picture
  if (data.bg) {
    const bgPic = createOptimizedPicture(data.bg.src, data.bg.alt || '', false, []);
    moveInstrumentation(data.bg, bgPic.querySelector('img'));
    bgPic.classList.add('banner-bg');
    block.append(bgPic);
  }

  // Foreground image
  if (data.fg) {
    const fgPic = createOptimizedPicture(data.fg.src, data.fg.alt || '', false, []);
    moveInstrumentation(data.fg, fgPic.querySelector('img'));
    fgPic.classList.add('banner-fg');
    block.append(fgPic);
  }
}
