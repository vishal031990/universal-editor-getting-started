import { moveInstrumentation } from "../../scripts/scripts.js";
import { createOptimizedPicture } from "../../scripts/aem.js";

/**
 * Banner V2 Component
 * Enhanced hero banner based on banner-component design
 * 
 * Content structure:
 * Row 0: Title (Hero headline)
 * Row 1: Subtitle (Description text)
 * Row 2: Terms/Footnote (with optional link)
 * Row 3: Primary CTA Text
 * Row 4: Primary CTA Link
 * Row 5: Secondary CTA Text
 * Row 6: Secondary CTA Link  
 * Row 7: Background Image
 * Row 8: Foreground/Main Image
 */

export default function decorate(block) {
  block.classList.add('banner-v2');
  
  const rows = [...block.children];
  const data = {
    title: '',
    subtitle: '',
    terms: '',
    ctas: [],
    bgImage: null,
    fgImage: null
  };

  // Parse content rows
  rows.forEach((row, index) => {
    const cells = [...row.children];
    const cellContent = cells[0];
    
    if (!cellContent) return;
    
    const textContent = cellContent.textContent.trim();
    const picture = cellContent.querySelector('picture');
    
    console.log(`Banner V2 Row ${index}:`, textContent || (picture ? 'IMAGE' : 'EMPTY'));
    
    switch (index) {
      case 0: // Title
        data.title = cellContent.innerHTML;
        break;
        
      case 1: // Subtitle
        data.subtitle = cellContent.innerHTML;
        break;
        
      case 2: // Terms/Footnote
        data.terms = cellContent.innerHTML;
        break;
        
      case 3: // Primary CTA Text
        if (textContent && rows[index + 1]) {
          const linkCell = rows[index + 1].children[0];
          const href = linkCell ? linkCell.textContent.trim() : '#';
          data.ctas.push({
            text: textContent,
            href: href.startsWith('http') ? href : `https://${href}`,
            type: 'primary'
          });
        }
        break;
        
      case 5: // Secondary CTA Text
        if (textContent && rows[index + 1]) {
          const linkCell = rows[index + 1].children[0];
          const href = linkCell ? linkCell.textContent.trim() : '#';
          data.ctas.push({
            text: textContent,
            href: href.startsWith('http') ? href : `https://${href}`,
            type: 'secondary'
          });
        }
        break;
        
      case 7: // Background Image
        if (picture) {
          data.bgImage = picture.cloneNode(true);
        }
        break;
        
      case 8: // Foreground Image
        if (picture) {
          data.fgImage = picture.cloneNode(true);
        }
        break;
    }
  });

  console.log('Banner V2 data parsed:', data);

  // Clear and rebuild block
  block.textContent = '';

  // Background Layer
  if (data.bgImage) {
    const bgDiv = document.createElement('div');
    bgDiv.className = 'hero-background';
    
    // Optimize and add background image
    const bgImg = data.bgImage.querySelector('img');
    if (bgImg) {
      const optimizedPic = createOptimizedPicture(
        bgImg.src, 
        bgImg.alt || 'Background', 
        false, 
        [{ width: '1920' }]
      );
      bgDiv.append(optimizedPic);
    } else {
      bgDiv.append(data.bgImage);
    }
    
    // Add gradient overlay
    const gradientOverlay = document.createElement('div');
    gradientOverlay.className = 'gradient-overlay';
    bgDiv.append(gradientOverlay);
    
    block.append(bgDiv);
  } else {
    // If no background image, add default gradient background
    block.classList.add('default-gradient');
  }

  // Removed floating decorative elements

  // Main Content Container
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';

  // Content Section
  const contentSection = document.createElement('div');
  contentSection.className = 'content-section';

  // Title
  if (data.title) {
    const title = document.createElement('h1');
    title.className = 'hero-title';
    title.innerHTML = data.title;
    contentSection.append(title);
  }

  // Subtitle
  if (data.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'hero-subtitle';
    subtitle.innerHTML = data.subtitle;
    contentSection.append(subtitle);
  }

  // Terms
  if (data.terms) {
    const terms = document.createElement('p');
    terms.className = 'hero-terms';
    terms.innerHTML = data.terms;
    contentSection.append(terms);
  }

  // CTA Buttons
  if (data.ctas.length > 0) {
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'hero-buttons';
    
    data.ctas.forEach(cta => {
      const btn = document.createElement('a');
      btn.href = cta.href;
      btn.className = `btn btn-${cta.type}`;
      btn.textContent = cta.text;
      btn.setAttribute('role', 'button');
      buttonsDiv.append(btn);
    });
    
    contentSection.append(buttonsDiv);
  }

  heroContent.append(contentSection);

  // Image Section
  if (data.fgImage) {
    const imageSection = document.createElement('div');
    imageSection.className = 'image-section';
    
    const fgContainer = document.createElement('div');
    fgContainer.className = 'foreground-image';
    
    const fgImg = data.fgImage.querySelector('img');
    if (fgImg) {
      const optimizedPic = createOptimizedPicture(
        fgImg.src,
        fgImg.alt || 'Hero image',
        false,
        [{ width: '750' }]
      );
      fgContainer.append(optimizedPic);
    } else {
      fgContainer.append(data.fgImage);
    }
    
    imageSection.append(fgContainer);
    heroContent.append(imageSection);
  }

  block.append(heroContent);

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = block.querySelectorAll(
    '.hero-title, .hero-subtitle, .hero-terms, .hero-buttons, .foreground-image'
  );
  animatedElements.forEach(el => observer.observe(el));

  // Add reduced motion support
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    block.classList.add('reduced-motion');
  }
}