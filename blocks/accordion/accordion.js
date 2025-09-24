/* Accessible accordion block
 * Authoring expectation: a default Franklin block table where each row becomes an item.
 * Row structure: Column 1 = Question (text), Column 2 = Answer (rich text / HTML)
 */

function collapseAll(container) {
  container.querySelectorAll('.accordion-trigger[aria-expanded="true"]').forEach((btn) => {
    btn.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (panel) panel.hidden = true;
  });
}

export default function decorate(block) {
  block.classList.add('accordion');

  const single = block.dataset.single === 'true'; // optional author metadata to allow only one open

  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-items';

  rows.forEach((row, index) => {
    const cols = [...row.children];
    if (cols.length === 0) return; // skip empties

    const qText = cols[0].innerHTML.trim();
    const answerHTML = cols[1] ? cols[1].innerHTML : '';

    const item = document.createElement('div');
    item.className = 'accordion-item';

    const btn = document.createElement('button');
    const triggerId = `accordion-trigger-${index}`;
    const panelId = `accordion-panel-${index}`;
    btn.id = triggerId;
    btn.type = 'button';
    btn.className = 'accordion-trigger';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.innerHTML = `<span class="accordion-trigger-text">${qText}</span><span class="accordion-icon" aria-hidden="true"></span>`;

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'accordion-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);
    panel.innerHTML = answerHTML;

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (single) collapseAll(wrapper);
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });

    item.append(btn, panel);
    wrapper.append(item);
  });

  block.innerHTML = '';
  block.append(wrapper);
}
