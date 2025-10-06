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

  if (timeLeft.expired) {
    // Show post message and hide countdown
    if (preMessageEl) preMessageEl.style.display = 'none';
    if (postMessageEl) {
      postMessageEl.style.display = 'block';
      postMessageEl.textContent = postMessage || 'Time has expired!';
    }
    block.querySelector('.countdown-timer').style.display = 'none';
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
  block.classList.add('countdown');

  const rows = [...block.children];

  const data = {
    preMessage: cellText(rows[0]) || 'Countdown ends in:',
    targetDate: cellText(rows[1]) || '',
    postMessage: cellText(rows[2]) || 'Time has expired!',
    fontColor: cellText(rows[3]) || '#ffffff',
    backgroundColor: cellText(rows[4]) || '#772bcb',
  };

  // Validate target date
  if (!data.targetDate) {
    block.innerHTML = '<p style="color: red; padding: 20px;">Error: Please provide a target date for the countdown timer.</p>';
    return;
  }

  // Add variant class
  block.classList.add(`countdown--${data.variant}`);

  // Add variant class
  block.classList.add(`countdown--${data.variant}`);

  // Clear original content
  block.textContent = '';

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
  timer.className = 'countdown-timer';

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
