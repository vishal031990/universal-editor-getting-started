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
    fgRow: null,
    bgRow: null,
  };

  // Parse content and identify image rows
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const cellContent = cells[0];
    
    if (!cellContent) return;
    
    const textContent = cellContent.textContent.trim();
    const hasPicture = cellContent.querySelector('picture');
    
    console.log(`Row ${i}:`, textContent || (hasPicture ? 'HAS IMAGE' : 'EMPTY'));
    
    if (i === 0) {
      data.title = cellContent.innerHTML;
    } else if (i === 1) {
      data.description = cellContent.innerHTML;
    } else if (i === 2 && hasPicture) {
      data.fgRow = row; // Keep the whole row for processing later
      console.log('Found foreground image row');
    } else if (i === 3 && hasPicture) {
      data.bgRow = row; // Keep the whole row for processing later
      console.log('Found background image row');
    } else if (i === 4 && textContent) {
      data.footnote = cellContent.innerHTML;
    } else if (i === 5 && textContent) {
      const nextRow = rows[i + 1];
      if (nextRow) {
        const nextCells = [...nextRow.children];
        const ctaLink = nextCells[0] ? nextCells[0].textContent.trim() : '#';
        const href = ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`;
        data.ctas.push({ text: textContent, href, style: 'primary' });
      }
    } else if (i === 7 && textContent) {
      // Row 7: Secondary CTA Text - get link from next row
      const nextRow = rows[i + 1];
      if (nextRow) {
        const nextCells = [...nextRow.children];
        const ctaLink = nextCells[0] ? nextCells[0].textContent.trim() : '#';
        const href = ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`;
        data.ctas.push({ text: textContent, href, style: 'secondary' });
      }
    }
  });

  console.log('Banner data parsed:', data);

  // Create new structure
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
      a.className = `banner-cta-${c.style || 'primary'}`;
      a.setAttribute('role', 'button');
      ctasDiv.append(a);
    });
    content.append(ctasDiv);
  }

  container.append(content);

  // Clear and rebuild block
  block.textContent = '';
  block.append(container);

  // Add background image if exists
  if (data.bgRow) {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'banner-bg';
    moveInstrumentation(data.bgRow, bgDiv);
    bgDiv.append(...data.bgRow.children);
    block.append(bgDiv);
    
    // Add gradient overlay
    const overlay = document.createElement('div');
    overlay.className = 'banner-gradient-overlay';
    block.append(overlay);
  } else {
    block.classList.add('banner-no-bg');
  }

  // Add foreground image if exists  
  if (data.fgRow) {
    const fgDiv = document.createElement('div');
    fgDiv.className = 'banner-fg';
    moveInstrumentation(data.fgRow, fgDiv);
    fgDiv.append(...data.fgRow.children);
    block.append(fgDiv);
  }

  // Optimize all images like cards.js does
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
