import { moveInstrumentation } from "../../scripts/scripts.js";

/* Countdown Timer Block
 * Table schema:
 * 0 Pre Message (e.g., "Christmas sale ends in:")
 * 1 Target Date/Time (YYYY-MM-DD HH:MM:SS or ISO format)
 * 2 Post Message (shown after countdown ends, e.g., "Sale has ended!")
 * 3 Font Color (hex color for text, default: #ffffff)
 * 4 Background Color (hex color for background, default: #772bcb)
 *
 * Responsive behavior:
 * - Desktop (big): Full width, large text (40px)
 * - Tablet (slim): Medium width, medium text (28px)
 * - Mobile (little): Compact width, smaller text (20px)
 */

function firstCell(row) { return row?.querySelector(':scope > div'); }
function cellText(row) { return firstCell(row)?.textContent?.trim() || ''; }

function formatTime(value) {
  return value.toString().padStart(2, '0');
}

function calculateTimeLeft(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days: formatTime(days),
      hours: formatTime(hours),
      minutes: formatTime(minutes),
      seconds: formatTime(seconds),
      expired: false
    };
  }

  return {
    days: '00',
    hours: '00', 
    minutes: '00',
    seconds: '00',
    expired: true
  };
}

function updateCountdown(block, targetDate, postMessage) {
  const timeLeft = calculateTimeLeft(targetDate);
  
  const daysEl = block.querySelector('.countdown-days');
  const hoursEl = block.querySelector('.countdown-hours');
  const minutesEl = block.querySelector('.countdown-minutes');
  const secondsEl = block.querySelector('.countdown-seconds');
  const preMessageEl = block.querySelector('.countdown-pre-message');
  const postMessageEl = block.querySelector('.countdown-post-message');
  const timerEl = block.querySelector('.countdown-display');

  if (timeLeft.expired) {
    // Show post message and hide countdown
    if (preMessageEl) preMessageEl.style.display = 'none';
    if (timerEl) timerEl.style.display = 'none';
    if (postMessageEl) {
      postMessageEl.style.display = 'block';
      postMessageEl.textContent = postMessage || 'Time has expired!';
    }
    return false; // Stop the timer
  }

  // Update countdown values
  if (daysEl) daysEl.textContent = timeLeft.days;
  if (hoursEl) hoursEl.textContent = timeLeft.hours;
  if (minutesEl) minutesEl.textContent = timeLeft.minutes;
  if (secondsEl) secondsEl.textContent = timeLeft.seconds;

  return true; // Continue the timer
}

export default function decorate(block) {
  block.classList.add('countdown-timer');

  let data = {};
  
  // Check if this is Universal Editor format (has data-aue attributes)
  const ueElements = block.querySelectorAll('[data-aue-prop]');
  
  if (ueElements.length > 0) {
    // Universal Editor format - extract data from data-aue-prop elements
    const preMessageEl = block.querySelector('[data-aue-prop="preMessage"]');
    const targetDateEl = block.querySelector('[data-aue-prop="targetDate"]');
    const postMessageEl = block.querySelector('[data-aue-prop="postMessage"]');
    const fontColorEl = block.querySelector('[data-aue-prop="fontColor"]');
    const backgroundColorEl = block.querySelector('[data-aue-prop="backgroundColor"]');
    
    data = {
      preMessage: preMessageEl?.textContent?.trim() || preMessageEl?.innerText?.trim() || 'Countdown ends in:',
      targetDate: targetDateEl?.textContent?.trim() || targetDateEl?.innerText?.trim() || '',
      postMessage: postMessageEl?.textContent?.trim() || postMessageEl?.innerText?.trim() || 'Time has expired!',
      fontColor: fontColorEl?.textContent?.trim() || fontColorEl?.innerText?.trim() || '#ffffff',
      backgroundColor: backgroundColorEl?.textContent?.trim() || backgroundColorEl?.innerText?.trim() || '#772bcb',
    };
    
    // Debug logging for troubleshooting
    console.log('Countdown Timer UE Format Data:', data);
  } else {
    // Traditional Franklin table format
    const rows = [...block.children];
    data = {
      preMessage: cellText(rows[0]) || 'Countdown ends in:',
      targetDate: cellText(rows[1]) || '',
      postMessage: cellText(rows[2]) || 'Time has expired!',
      fontColor: cellText(rows[3]) || '#ffffff',
      backgroundColor: cellText(rows[4]) || '#772bcb',
    };
    
    // Debug logging for troubleshooting
    console.log('Countdown Timer Table Format Data:', data);
  }

  // Validate target date
  if (!data.targetDate) {
    block.innerHTML = `
      <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 8px; background: #ffe6e6;">
        <strong>Error: Missing Target Date</strong><br>
        Please provide a target date for the countdown timer.<br>
        Format: YYYY-MM-DD HH:MM:SS (e.g., 2024-12-25 23:59:59)
      </div>
    `;
    console.error('Countdown Timer Error: No target date provided', data);
    return;
  }
  
  // Validate date format
  const targetDateObj = new Date(data.targetDate);
  if (isNaN(targetDateObj.getTime())) {
    block.innerHTML = `
      <div style="color: red; padding: 20px; border: 2px solid red; border-radius: 8px; background: #ffe6e6;">
        <strong>Error: Invalid Date Format</strong><br>
        Target date "${data.targetDate}" is not valid.<br>
        Please use format: YYYY-MM-DD HH:MM:SS (e.g., 2024-12-25 23:59:59)
      </div>
    `;
    console.error('Countdown Timer Error: Invalid date format', data.targetDate);
    return;
  }

  // Clear original content
  block.textContent = '';

  // Debug: Add viewport info to help troubleshoot responsive issues
  console.log('Countdown Timer Debug:', {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    data: data
  });

  // Create countdown structure
  const container = document.createElement('div');
  container.className = 'countdown-container';
  container.style.backgroundColor = data.backgroundColor;
  container.style.color = data.fontColor;

  // Pre message
  const preMessage = document.createElement('div');
  preMessage.className = 'countdown-pre-message';
  preMessage.textContent = data.preMessage;
  container.appendChild(preMessage);

  // Countdown timer
  const timer = document.createElement('div');
  timer.className = 'countdown-display';

  // Time units
  const timeUnits = [
    { value: '00', label: 'Days', class: 'countdown-days' },
    { value: '00', label: 'Hrs', class: 'countdown-hours' },
    { value: '00', label: 'Mins', class: 'countdown-minutes' },
    { value: '00', label: 'Secs', class: 'countdown-seconds' }
  ];

  timeUnits.forEach((unit, index) => {
    const unitContainer = document.createElement('div');
    unitContainer.className = 'countdown-unit';

    const valueEl = document.createElement('span');
    valueEl.className = `countdown-value ${unit.class}`;
    valueEl.textContent = unit.value;

    const labelEl = document.createElement('span');
    labelEl.className = 'countdown-label';
    labelEl.textContent = unit.label;

    unitContainer.appendChild(valueEl);
    unitContainer.appendChild(labelEl);
    timer.appendChild(unitContainer);

    // Add separator colon (except for last item)
    if (index < timeUnits.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'countdown-separator';
      separator.textContent = ':';
      timer.appendChild(separator);
    }
  });

  container.appendChild(timer);

  // Post message (hidden initially)
  const postMessage = document.createElement('div');
  postMessage.className = 'countdown-post-message';
  postMessage.textContent = data.postMessage;
  postMessage.style.display = 'none';
  container.appendChild(postMessage);

  block.appendChild(container);

  // Start countdown
  const startCountdown = () => {
    updateCountdown(block, data.targetDate, data.postMessage);
    
    const interval = setInterval(() => {
      const shouldContinue = updateCountdown(block, data.targetDate, data.postMessage);
      if (!shouldContinue) {
        clearInterval(interval);
      }
    }, 1000);
  };

  // Initialize countdown
  startCountdown();

  // Instrumentation for Universal Editor
  moveInstrumentation(block, container);
}
