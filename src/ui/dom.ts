export type Child = Node | string | null | undefined | false | Child[];
export function h(tag: string, attrs: Record<string, any> = {}, ...children: Child[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'onclick') el.addEventListener('click', v);
    else if (k === 'onchange') el.addEventListener('change', v);
    else if (k === 'oninput') el.addEventListener('input', v);
    else if (k === 'style') el.setAttribute('style', v);
    else if (k === 'disabled') (el as HTMLButtonElement).disabled = !!v;
    else if (k === 'value') (el as HTMLInputElement).value = v;
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}
function append(el: HTMLElement, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(c));
  }
}
export const btn = (label: string, onclick: () => void, cls = '', disabled = false) => h('button', { class: cls, onclick, disabled }, label);
export function bar(ratio: number, cls = ''): HTMLElement {
  const b = h('div', { class: 'bar ' + cls }, h('i', { style: `width:${Math.max(0, Math.min(100, ratio * 100)).toFixed(1)}%` }));
  return b;
}
let toastTimer: number | undefined;
export function toast(text: string, ms = 2500) {
  document.querySelectorAll('.toast').forEach(e => e.remove());
  const t = h('div', { class: 'toast' }, text);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.remove(), ms);
}
export function selectEl(options: { value: string; label: string }[], value: string, onchange: (v: string) => void): HTMLSelectElement {
  const s = document.createElement('select');
  s.style.cssText = 'font:inherit;font-size:13px;background:#060e28;color:#f4f6ff;border:1px solid #e8ecff;border-radius:4px;padding:6px;max-width:100%';
  for (const o of options) { const op = document.createElement('option'); op.value = o.value; op.textContent = o.label; if (o.value === value) op.selected = true; s.append(op); }
  s.addEventListener('change', () => onchange(s.value));
  return s;
}
