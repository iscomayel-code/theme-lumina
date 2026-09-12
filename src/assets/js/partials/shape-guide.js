/**
 * Wires the visual shape guide to the real product options form.
 *
 * The tiles are rendered server-side from `product.options[].details[]`, but the form
 * controls themselves are created by the <salla-product-options> web component, so the
 * matching control may not exist yet when this runs — hence the observer below.
 *
 * Selecting a tile drives the native control and dispatches a bubbling `change`, which
 * is what the product form already listens for to refresh the price. Nothing here
 * duplicates that logic.
 */

/** Collects matches from the document and any open shadow roots. */
function deepQuery(selector, root = document, found = []) {
  found.push(...root.querySelectorAll(selector));

  root.querySelectorAll('*').forEach((el) => {
    if (el.shadowRoot) deepQuery(selector, el.shadowRoot, found);
  });

  return found;
}

function findControl(optionId, detailId) {
  const name = `options[${optionId}]`;

  const input = deepQuery(`input[name="${name}"][value="${detailId}"]`)[0];
  if (input) return { type: 'input', el: input };

  const select = deepQuery(`select[name="${name}"]`)[0];
  if (select?.querySelector(`option[value="${detailId}"]`)) return { type: 'select', el: select };

  return null;
}

function select(optionId, detailId) {
  const control = findControl(optionId, detailId);
  if (!control) return false;

  if (control.type === 'select') {
    control.el.value = String(detailId);
  } else {
    control.el.checked = true;
  }

  control.el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/** Mirrors whatever the form currently holds back onto the tiles. */
function syncTiles(section, optionId) {
  const name = `options[${optionId}]`;
  const checked = deepQuery(`input[name="${name}"]:checked`)[0];
  const select = deepQuery(`select[name="${name}"]`)[0];
  const current = checked?.value ?? select?.value;

  if (current === undefined) return;

  section.querySelectorAll('.lumina-shapes__tile').forEach((tile) => {
    tile.setAttribute('aria-pressed', String(tile.dataset.detailId === String(current)));
  });
}

export default function initShapeGuide() {
  const section = document.querySelector('.lumina-shapes[data-option-id]');
  if (!section) return;

  const optionId = section.dataset.optionId;

  section.addEventListener('click', (event) => {
    const tile = event.target.closest('.lumina-shapes__tile');
    if (!tile || tile.disabled) return;

    if (select(optionId, tile.dataset.detailId)) {
      syncTiles(section, optionId);
    }
  });

  // Keep tiles in step when the shopper uses the native selector instead.
  document.querySelector('.product-form')
    ?.addEventListener('change', () => syncTiles(section, optionId));

  // <salla-product-options> renders asynchronously; sync once its controls appear.
  const observer = new MutationObserver(() => {
    if (findControl(optionId, section.querySelector('.lumina-shapes__tile')?.dataset.detailId)) {
      syncTiles(section, optionId);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
}
