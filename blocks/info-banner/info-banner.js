import { moveInstrumentation } from "../../scripts/scripts.js";

/* Info Banner Block
 * Structure: 
 * Row 0: Banner Type (warning, error, success, info)
 * Row 1: Alert Title
 * Row 2: Alert Description
 * Row 3: Button Text (optional)
 * Row 4: Button Link (optional)  
 * Row 5: Link Text (optional)
 * Row 6: Link URL (optional)
 * Row 7: Show Close Button (true/false, optional)
 */

// SVG Icons as constants (inline to avoid external dependencies)
const WARNING_ICON_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L22 20H2L12 2Z" stroke="#FF8E26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 9V13" stroke="#FF8E26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 17H12.01" stroke="#FF8E26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CLOSE_ICON_SVG = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4L4 12" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 4L12 12" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ERROR_ICON_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="#DC2626" stroke-width="2"/>
  <path d="M15 9L9 15" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 9L15 15" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const SUCCESS_ICON_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 11.08V12A10 10 0 1 1 5.93 7.01" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 4L12 14.01L9 11.01" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const INFO_ICON_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="#2563EB" stroke-width="2"/>
  <path d="M12 16V12" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 8H12.01" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function getIconSVG(bannerType) {
  switch (bannerType?.toLowerCase()) {
    case 'error':
      return ERROR_ICON_SVG;
    case 'success':
      return SUCCESS_ICON_SVG;
    case 'info':
      return INFO_ICON_SVG;
    case 'warning':
    default:
      return WARNING_ICON_SVG;
  }
}

export default function decorate(block) {
  block.classList.add('info-banner');

  const rows = [...block.children];
  
  // Parse content from table rows
  const data = {
    bannerType: 'warning',
    title: 'Alert Title',
    description: 'Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries.',
    buttonText: '',
    buttonLink: '',
    linkText: '',
    linkUrl: '',
    showCloseButton: true
  };

  // Extract data from rows
  rows.forEach((row, index) => {
    const cell = row.children[0];
    const content = cell?.textContent?.trim();
    
    if (!content) return;
    
    switch (index) {
      case 0:
        data.bannerType = content.toLowerCase() || 'warning';
        break;
      case 1:
        data.title = content;
        break;
      case 2:
        data.description = cell.innerHTML;
        break;
      case 3:
        data.buttonText = content;
        break;
      case 4:
        data.buttonLink = content;
        break;
      case 5:
        data.linkText = content;
        break;
      case 6:
        data.linkUrl = content;
        break;
      case 7:
        data.showCloseButton = content.toLowerCase() === 'true';
        break;
    }
  });

  // Add banner type class
  block.classList.add(data.bannerType);

  // Create the banner structure
  const banner = document.createElement('div');
  banner.className = 'info-banner-wrapper';

  // Accent bar
  const accentBar = document.createElement('div');
  accentBar.className = 'accent-bar';
  banner.appendChild(accentBar);

  // Banner content container
  const bannerContent = document.createElement('div');
  bannerContent.className = 'banner-content';

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  // Warning icon
  const iconContainer = document.createElement('div');
  iconContainer.className = 'warning-icon';
  iconContainer.innerHTML = getIconSVG(data.bannerType);
  contentWrapper.appendChild(iconContainer);

  // Inner content
  const innerContent = document.createElement('div');
  innerContent.className = 'inner-content';

  // Alert title
  const alertTitle = document.createElement('div');
  alertTitle.className = 'alert-title';
  alertTitle.textContent = data.title;
  innerContent.appendChild(alertTitle);

  // Alert description
  const alertDescription = document.createElement('div');
  alertDescription.className = 'alert-description';
  alertDescription.innerHTML = data.description;
  innerContent.appendChild(alertDescription);

  // Actions container (if button or link exists)
  if (data.buttonText || data.linkText) {
    const actions = document.createElement('div');
    actions.className = 'actions';

    // Button
    if (data.buttonText && data.buttonLink) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button';
      
      const button = document.createElement('a');
      button.className = 'button-text';
      button.textContent = data.buttonText;
      button.href = data.buttonLink;
      
      buttonContainer.appendChild(button);
      actions.appendChild(buttonContainer);
    }

    // Link
    if (data.linkText && data.linkUrl) {
      const link = document.createElement('a');
      link.className = 'link';
      link.textContent = data.linkText;
      link.href = data.linkUrl;
      actions.appendChild(link);
    }

    innerContent.appendChild(actions);
  }

  contentWrapper.appendChild(innerContent);

  // Close button
  if (data.showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = CLOSE_ICON_SVG;
    closeButton.setAttribute('aria-label', 'Close banner');
    
    closeButton.addEventListener('click', () => {
      block.classList.add('hidden');
    });
    
    contentWrapper.appendChild(closeButton);
  }

  bannerContent.appendChild(contentWrapper);
  banner.appendChild(bannerContent);

  // Replace block content
  block.textContent = '';
  block.appendChild(banner);

  // Move instrumentation for Universal Editor
  moveInstrumentation(block, banner);
}
