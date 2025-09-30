import { moveInstrumentation } from "../../scripts/scripts.js";

/* Banner V3 Dual Variant (Hero / Showcase)
 * Table schema (hero mode):
 * 0 Heading
 * 1 Subheading
 * 2 Terms
 * 3 Primary CTA Text
 * 4 Primary CTA URL
 * 5 Secondary CTA Text
 * 6 Secondary CTA URL
 * 7 Background Image
 * 8 Foreground Image
 * 9 Overlay Gradient (true/false)
 *
 * Showcase detection: if no CTA texts provided and foreground exists OR a data-variant="showcase" attribute present on block, we switch to showcase variant:
 * - Keep placeholder space for foreground even if absent (layout 6/6)
 * - Gap becomes 10px (desktop) and specific paddings already match hero but foreground padded 57px desktop/tablet
 * - Heading size enforced 50/58. We keep hero heading style otherwise.
 */

function firstCell(row) { return row?.querySelector(':scope > div'); }
function cellHTML(row) { return firstCell(row)?.innerHTML?.trim() || ''; }
function cellText(row) { return firstCell(row)?.textContent?.trim() || ''; }
function cellImage(row) {
  const c = firstCell(row);
  if (!c) return null;
  const img = c.querySelector('picture, img');
  return img ? img.cloneNode(true) : null;
}

export default function decorate(block) {
  block.classList.add('banner-v3');

  const rows = [...block.children];

  const data = {
    heading: cellText(rows[0]) || 'Hero heading',
    subheading: cellHTML(rows[1]) || '',
    terms: cellHTML(rows[2]) || '',
    primaryText: cellText(rows[3]) || '',
    primaryUrl: cellText(rows[4]) || '',
    secondaryText: cellText(rows[5]) || '',
    secondaryUrl: cellText(rows[6]) || '',
    background: cellImage(rows[7]),
    foreground: cellImage(rows[8]),
    overlay: (cellText(rows[9]) || 'true').toLowerCase() !== 'false',
  };

  // Determine variant
  const explicitVariant = block.dataset.variant?.toLowerCase();
  let showcase = explicitVariant === 'showcase';
  if (!showcase) {
    const noCtas = !data.primaryText && !data.secondaryText;
    if (noCtas && data.foreground) showcase = true;
  }
  if (showcase) block.classList.add('banner-v3--showcase');

  // Root clears original authoring
  block.textContent = '';

  // Background image
  if (data.background) {
    const bg = document.createElement('div');
    bg.className = 'banner-v3-bg-wrapper';
    // If it's a picture keep sources; else wrap img
    if (data.background.matches('picture')) {
      data.background.classList.add('banner-v3-bg');
      bg.appendChild(data.background);
    } else {
      const img = data.background;
      img.classList.add('banner-v3-bg');
      bg.appendChild(img);
    }
    block.appendChild(bg);
    block.classList.add('has-bg');
  }

  if (data.overlay) {
    const overlay = document.createElement('div');
    overlay.className = 'banner-v3-overlay';
    block.appendChild(overlay);
  } else {
    block.classList.add('no-overlay');
  }

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  const content = document.createElement('div');
  content.className = 'hero-content';

  // Heading
  if (data.heading) {
    const h = document.createElement('h1');
    h.className = 'hero-heading';
    h.textContent = data.heading;
    content.appendChild(h);
  }

  // Subheading
  if (data.subheading) {
    const sub = document.createElement('div');
    sub.className = 'hero-subheading';
    sub.innerHTML = data.subheading;
    content.appendChild(sub);
  }

  // Buttons
  const buttons = document.createElement('div');
  buttons.className = 'hero-buttons';
  let hasButtons = false;
  if (data.primaryText && data.primaryUrl) {
    const a = document.createElement('a');
    a.className = 'btn btn-primary';
    a.href = data.primaryUrl;
    a.textContent = data.primaryText;
    a.setAttribute('role', 'button');
    buttons.appendChild(a);
    hasButtons = true;
  }
  if (data.secondaryText && data.secondaryUrl) {
    const a = document.createElement('a');
    a.className = 'btn btn-secondary';
    a.href = data.secondaryUrl;
    a.textContent = data.secondaryText;
    a.setAttribute('role', 'button');
    buttons.appendChild(a);
    hasButtons = true;
  }
  if (hasButtons) content.appendChild(buttons);

  // Terms
  if (data.terms) {
    const terms = document.createElement('div');
    terms.className = 'hero-terms';
    terms.innerHTML = data.terms;
    content.appendChild(terms);
  }

  inner.appendChild(content);

  // Foreground visual (placed after content so flex can push it to side)
  if (data.foreground) {
    const fgWrap = document.createElement('div');
    fgWrap.className = 'hero-foreground';
    fgWrap.appendChild(data.foreground);
    inner.appendChild(fgWrap);
  } else {
    block.classList.add('no-foreground');
    if (showcase) {
      // maintain layout space placeholder (hidden but preserves alignment when design expects two columns)
      const placeholder = document.createElement('div');
      placeholder.className = 'hero-foreground placeholder';
      inner.appendChild(placeholder);
    }
  }

  block.appendChild(inner);

  // Instrumentation for Universal Editor move
  moveInstrumentation(block, inner);
}
