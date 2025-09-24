import { moveInstrumentation } from "../../scripts/scripts.js";
import { createOptimizedPicture } from "../../scripts/aem.js";

/* Banner table structure (simplified - no empty rows):
   Row 0: Title
   Row 1: Description
   Row 2: Foreground Image
   Row 3: Background Image
   Row 4: Footnote
   Row 5: CTA Text
   Row 6: CTA Link
*/

export default function decorate(block) {
  block.classList.add('banner');

  const rows = [...block.children];
  const data = {
    title: '',
    description: '',
    footnote: '',
    ctas: [],
    fg: null,
    bg: null,
  };

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const cellContent = cells[0];
    
    if (!cellContent) return; // Skip empty rows
    
    const textContent = cellContent.textContent.trim();
    const img = cellContent.querySelector('img');
    
    console.log(`Row ${i}:`, textContent || (img ? 'HAS IMAGE' : 'EMPTY'));
    
    // Simplified row parsing structure
    if (i === 0) {
      // Row 0: Title
      data.title = cellContent.innerHTML;
    } else if (i === 1) {
      // Row 1: Description
      data.description = cellContent.innerHTML;
    } else if (i === 2 && img) {
      // Row 2: Foreground Image
      data.fg = img;
      console.log('Found foreground image:', img.src);
    } else if (i === 3 && img) {
      // Row 3: Background Image
      data.bg = img;
      console.log('Found background image:', img.src);
    } else if (i === 4 && textContent) {
      // Row 4: Footnote
      data.footnote = cellContent.innerHTML;
    } else if (i === 5 && textContent) {
      // Row 5: CTA Text - get link from next row
      const nextRow = rows[i + 1];
      if (nextRow) {
        const nextCells = [...nextRow.children];
        const ctaLink = nextCells[0] ? nextCells[0].textContent.trim() : '#';
        const href = ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`;
        data.ctas.push({ text: textContent, href });
      }
    }
  });

  // Debug: log the parsed data
  console.log('Banner data parsed:', data);

  // clear block
  block.textContent = '';

  // Create main container structure
  const container = document.createElement('div');
  container.className = 'banner-container';

  const content = document.createElement('div');
  content.className = 'banner-content';

  // Title
  if (data.title) {
    const h1 = document.createElement('h1');
    h1.innerHTML = data.title;
    content.append(h1);
  }

  // Description
  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'banner-description';
    desc.innerHTML = data.description;
    content.append(desc);
  }

  // Footnote
  if (data.footnote) {
    const footnote = document.createElement('div');
    footnote.className = 'banner-footnote';
    footnote.innerHTML = data.footnote;
    content.append(footnote);
  }

  // CTA
  if (data.ctas.length) {
    const ctasDiv = document.createElement('div');
    ctasDiv.className = 'banner-ctas';
    data.ctas.forEach((c) => {
      if (!c.text || !c.href) return;
      const a = document.createElement('a');
      a.textContent = c.text;
      a.href = c.href;
      a.className = 'banner-cta-primary';
      a.setAttribute('role', 'button');
      ctasDiv.append(a);
    });
    content.append(ctasDiv);
  }

  container.append(content);
  block.append(container);

  // Background picture
  if (data.bg && data.bg.src) {
    const bgPic = createOptimizedPicture(data.bg.src, data.bg.alt || '', false, []);
    moveInstrumentation(data.bg, bgPic.querySelector('img'));
    bgPic.classList.add('banner-bg');
    block.append(bgPic);

    // Add gradient overlay when background image exists
    const overlay = document.createElement('div');
    overlay.className = 'banner-gradient-overlay';
    block.append(overlay);
  } else {
    // No background image, add a class to use CSS gradient only
    block.classList.add('banner-no-bg');
  }

  // Foreground image
  if (data.fg && data.fg.src) {
    const fgPic = createOptimizedPicture(data.fg.src, data.fg.alt || '', false, []);
    moveInstrumentation(data.fg, fgPic.querySelector('img'));
    fgPic.classList.add('banner-fg');
    block.append(fgPic);
  }
}
