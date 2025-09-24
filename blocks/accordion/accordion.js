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
  // Heuristic to detect Universal Editor authoring context (presence of instrumentation root attributes)
  const inEditor = !!document.querySelector("[data-aue-resource]");

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
    // Preserve instrumentation for the accordion-item itself (row level)
    moveInstrumentation(row, item);

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
    // moveInstrumentation to keep authoring metadata for the question cell itself
    moveInstrumentation(questionSource, triggerTextSpan);
    // move (not clone) all child nodes to preserve any nested instrumentation
    while (questionSource.firstChild) {
      triggerTextSpan.append(questionSource.firstChild);
    }
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
      // Create a wrapper for answer content so we can retain instrumentation cleanly
      const answerWrapper = document.createElement("div");
      answerWrapper.className = "accordion-answer";
      moveInstrumentation(answerSource, answerWrapper);
      while (answerSource.firstChild) {
        answerWrapper.append(answerSource.firstChild); // move nodes preserves richtext markers
      }
      panel.append(answerWrapper);
    }

    // In editor, expand the first item by default so rich text becomes immediately editable
    if (inEditor && index === 0) {
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
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
