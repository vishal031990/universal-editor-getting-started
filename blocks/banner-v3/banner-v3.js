import { moveInstrumentation } from "../../scripts/scripts.js";

/* Banner V2 (Hero Banner)
 * Authoring table structure (rows):
 * 0: Heading (rich text or text)
 * 1: Subheading / Description (rich text)
 * 2: Status Badge Text (e.g. "Designed and developed")
 * 3: Status Badge Icon (optional image)
 * 4: Inline Link Text (optional)
 * 5: Inline Link URL (optional)
 * 6: Foreground Image (optional image)
 * 7: Meta: Designer (optional)
 * 8: Meta: Last Updated (optional)
 * 9: Meta: Version (optional)
 * Additional rows ignored for now
 */

function getCell(row) { return row?.children?.[0]; }
function getText(row) { return getCell(row)?.textContent?.trim() || ""; }
function getHTML(row) { return getCell(row)?.innerHTML?.trim() || ""; }

export default function decorate(block) {
  block.classList.add("banner-v3");

  const rows = [...block.children];

  const data = {
    heading: getText(rows[0]) || "Hero banner",
    description: getHTML(rows[1]) || "",
    statusText: getText(rows[2]) || "",
    statusIcon: null,
    linkText: getText(rows[4]) || "",
    linkUrl: getText(rows[5]) || "",
    foregroundImage: null,
    metaDesigner: getText(rows[7]) || "-",
    metaUpdated: getText(rows[8]) || "-",
    metaVersion: getText(rows[9]) || "1.0.0",
  };

  // Extract possible images (status icon & foreground)
  const statusIconCell = getCell(rows[3]);
  if (statusIconCell) {
    const img = statusIconCell.querySelector('img, picture');
    if (img) data.statusIcon = img.cloneNode(true);
  }

  const fgImgCell = getCell(rows[6]);
  if (fgImgCell) {
    const img = fgImgCell.querySelector('img, picture');
    if (img) data.foregroundImage = img.cloneNode(true);
  }

  // Build structure
  const wrapper = document.createElement('div');
  wrapper.className = 'banner-inner';

  const content = document.createElement('div');
  content.className = 'content';

  // Top line (logo placeholder + status + links) - simplified
  const topLine = document.createElement('div');
  topLine.className = 'top-line';

  const logoRow = document.createElement('div');
  logoRow.className = 'logo-row';
  // If you want to support a logo cell in future, append it here.

  const statusAndLinks = document.createElement('div');
  statusAndLinks.className = 'status-and-links';

  if (data.statusText) {
    const badge = document.createElement('div');
    badge.className = 'status-badge';

    if (data.statusIcon) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'icon';
      iconWrap.appendChild(data.statusIcon);
      badge.appendChild(iconWrap);
    }

    const badgeText = document.createElement('span');
    badgeText.textContent = data.statusText;
    badge.appendChild(badgeText);
    statusAndLinks.appendChild(badge);
  }

  if (data.linkText && data.linkUrl) {
    const links = document.createElement('div');
    links.className = 'links';
    const link = document.createElement('a');
    link.className = 'inline-link';
    link.href = data.linkUrl;
    link.textContent = data.linkText;
    links.appendChild(link);
    statusAndLinks.appendChild(links);
  }

  topLine.appendChild(logoRow);
  topLine.appendChild(statusAndLinks);
  content.appendChild(topLine);

  // Heading
  if (data.heading) {
    const h1 = document.createElement('h1');
    h1.className = 'hero-heading';
    h1.textContent = data.heading;
    content.appendChild(h1);
  }

  // Description
  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'description';
    desc.innerHTML = data.description;
    content.appendChild(desc);
  }

  wrapper.appendChild(content);

  // Meta panel
  const metaPanel = document.createElement('div');
  metaPanel.className = 'meta-panel';
  const metaItems = [
    { label: 'Designer', value: data.metaDesigner },
    { label: 'Last updated', value: data.metaUpdated },
    { label: 'Version', value: data.metaVersion },
  ];
  metaItems.forEach(({ label, value }) => {
    const group = document.createElement('div');
    group.className = 'meta-group';

    const lab = document.createElement('span');
    lab.className = 'meta-label';
    lab.textContent = label;

    const val = document.createElement('span');
    val.className = 'meta-value';
    val.textContent = value || '-';

    group.append(lab, val);
    metaPanel.appendChild(group);
  });

  wrapper.appendChild(metaPanel);

  // Foreground image (placed after meta for flex ordering adjustments)
  if (data.foregroundImage) {
    data.foregroundImage.classList.add('foreground-image');
    wrapper.appendChild(data.foregroundImage);
  }

  // Replace original table
  block.textContent = '';
  block.appendChild(wrapper);

  // Move instrumentation for UE
  moveInstrumentation(block, wrapper);
}
