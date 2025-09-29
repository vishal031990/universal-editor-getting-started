import { moveInstrumentation } from "../../scripts/scripts.js";
import { createOptimizedPicture } from "../../scripts/aem.js";

/* Banner V2 table structure (enhanced version):
   Row 0: Title
   Row 1: Description
   Row 2: Foreground Image
   Row 3: Background Image
   Row 4: Footnote
   Row 5: Primary CTA Text
   Row 6: Primary CTA Link
   Row 7: Secondary CTA Text
   Row 8: Secondary CTA Link
   Row 9: Animation Type (optional)
   Row 10: Color Theme (optional)
*/

export default function decorate(block) {
  block.classList.add('banner-v2');

  const rows = [...block.children];
  const data = {
    title: '',
    description: '',
    footnote: '',
    ctas: [],
    fgRow: null,
    bgRow: null,
    animationType: 'fade-up', // Default from Figma annotations
    colorTheme: 'purple', // Default theme based on Figma
  };

  // Parse content and identify rows
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const cellContent = cells[0];
    
    if (!cellContent) return;
    
    const textContent = cellContent.textContent.trim();
    const hasPicture = cellContent.querySelector('picture');
    
    console.log(`Banner V2 Row ${i}:`, textContent || (hasPicture ? 'HAS IMAGE' : 'EMPTY'));
    
    switch (i) {
      case 0:
        data.title = cellContent.innerHTML;
        break;
      case 1:
        data.description = cellContent.innerHTML;
        break;
      case 2:
        if (hasPicture) {
          data.fgRow = row;
          console.log('Found foreground image row');
        }
        break;
      case 3:
        if (hasPicture) {
          data.bgRow = row;
          console.log('Found background image row');
        }
        break;
      case 4:
        if (textContent) data.footnote = cellContent.innerHTML;
        break;
      case 5:
        if (textContent) {
          const nextRow = rows[i + 1];
          if (nextRow) {
            const nextCells = [...nextRow.children];
            const ctaLink = nextCells[0] ? nextCells[0].textContent.trim() : '#';
            const href = ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`;
            data.ctas.push({ text: textContent, href, style: 'primary' });
          }
        }
        break;
      case 7:
        if (textContent) {
          const nextRow = rows[i + 1];
          if (nextRow) {
            const nextCells = [...nextRow.children];
            const ctaLink = nextCells[0] ? nextCells[0].textContent.trim() : '#';
            const href = ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`;
            data.ctas.push({ text: textContent, href, style: 'secondary' });
          }
        }
        break;
      case 9:
        if (textContent) data.animationType = textContent.toLowerCase();
        break;
      case 10:
        if (textContent) data.colorTheme = textContent.toLowerCase();
        break;
    }
  });

  console.log('Banner V2 data parsed:', data);

  // Create enhanced structure based on Figma design
  const container = document.createElement('div');
  container.className = 'banner-v2-container';
  
  // Add theme class
  container.classList.add(`banner-v2-theme-${data.colorTheme}`);
  
  // Add animation class from Figma annotations
  container.classList.add(`banner-v2-animation-${data.animationType}`);

  const content = document.createElement('div');
  content.className = 'banner-v2-content';

  // Title with enhanced styling
  if (data.title) {
    const h1 = document.createElement('h1');
    h1.innerHTML = data.title;
    h1.className = 'banner-v2-title';
    content.append(h1);
  }

  // Description with enhanced styling
  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'banner-v2-description';
    desc.innerHTML = data.description;
    content.append(desc);
  }

  // Footnote
  if (data.footnote) {
    const footnote = document.createElement('div');
    footnote.className = 'banner-v2-footnote';
    footnote.innerHTML = data.footnote;
    content.append(footnote);
  }

  // Enhanced CTA section
  if (data.ctas.length) {
    const ctasDiv = document.createElement('div');
    ctasDiv.className = 'banner-v2-ctas';
    data.ctas.forEach((c) => {
      if (!c.text || !c.href) return;
      const a = document.createElement('a');
      a.textContent = c.text;
      a.href = c.href;
      a.className = `banner-v2-cta banner-v2-cta-${c.style || 'primary'}`;
      a.setAttribute('role', 'button');
      ctasDiv.append(a);
    });
    content.append(ctasDiv);
  }

  container.append(content);

  // Add decorative elements inspired by Figma design
  const decorativeElements = document.createElement('div');
  decorativeElements.className = 'banner-v2-decorative';
  
  // Create geometric elements based on Figma patterns
  for (let i = 0; i < 3; i++) {
    const circle = document.createElement('div');
    circle.className = `banner-v2-circle banner-v2-circle-${i + 1}`;
    decorativeElements.append(circle);
  }
  
  container.append(decorativeElements);

  // Clear and rebuild block
  block.textContent = '';
  block.append(container);

  // Add background image if exists
  if (data.bgRow) {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'banner-v2-bg';
    moveInstrumentation(data.bgRow, bgDiv);
    bgDiv.append(...data.bgRow.children);
    block.append(bgDiv);
    
    // Add enhanced gradient overlay
    const overlay = document.createElement('div');
    overlay.className = 'banner-v2-gradient-overlay';
    block.append(overlay);
  } else {
    block.classList.add('banner-v2-no-bg');
  }

  // Add foreground image if exists  
  if (data.fgRow) {
    const fgDiv = document.createElement('div');
    fgDiv.className = 'banner-v2-fg';
    moveInstrumentation(data.fgRow, fgDiv);
    fgDiv.append(...data.fgRow.children);
    block.append(fgDiv);
  }

  // Optimize all images
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Add intersection observer for animations (Figma: fade in and up, 600ms ease)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('banner-v2-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(block);
}