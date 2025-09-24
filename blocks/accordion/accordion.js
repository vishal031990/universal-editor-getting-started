/* Accessible accordion block
 * Authoring expectation: a default Franklin block table where each row becomes an item.
 * Row structure: Column 1 = Question (text), Column 2 = Answer (rich text / HTML)
 */

function collapseAll(container) {
  container
    .querySelectorAll('.accordion-trigger[aria-expanded="true"]')
    .forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.hidden = true;
    });
}

import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  block.classList.add("accordion");

  const single = block.dataset.single === "true"; // optional author metadata to allow only one open

  const rows = [...block.children];
  const wrapper = document.createElement("div");
  wrapper.className = "accordion-items";

  rows.forEach((row, index) => {
    const cols = [...row.children];
    if (cols.length === 0) return; // skip empties

    const questionSource = cols[0];
    const answerSource = cols[1];

    const item = document.createElement("div");
    item.className = "accordion-item";

    const btn = document.createElement("button");
    const triggerId = `accordion-trigger-${index}`;
    const panelId = `accordion-panel-${index}`;
    btn.id = triggerId;
    btn.type = "button";
    btn.className = "accordion-trigger";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", panelId);
    const triggerTextSpan = document.createElement("span");
    triggerTextSpan.className = "accordion-trigger-text";
    // moveInstrumentation to keep authoring metadata
    moveInstrumentation(questionSource, triggerTextSpan);
    triggerTextSpan.innerHTML = questionSource.innerHTML.trim();
    const iconSpan = document.createElement("span");
    iconSpan.className = "accordion-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    btn.append(triggerTextSpan, iconSpan);

    const panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "accordion-panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", triggerId);
    if (answerSource) {
      // Preserve original answer node(s) including instrumentation markers
      const frag = document.createDocumentFragment();
      [...answerSource.childNodes].forEach((n) => {
        frag.append(n.cloneNode(true));
      });
      moveInstrumentation(answerSource, panel);
      panel.append(frag);
    }

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (single) collapseAll(wrapper);
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });

    item.append(btn, panel);
    wrapper.append(item);
  });

  block.innerHTML = "";
  block.append(wrapper);
}
