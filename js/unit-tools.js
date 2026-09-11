(function(root) {
  'use strict';
  function convert(kind, value, direction, volume) {
    if (value === '' || value == null) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    let result;
    if (kind === 'mass') result = direction === 'reverse' ? n / 1000 : n * 1000;
    else if (kind === 'syringe') result = direction === 'reverse' ? n / 100 : n * 100;
    else if (kind === 'concentration') {
      if (volume === '' || volume == null || !Number.isFinite(Number(volume)) || Number(volume) <= 0) return null;
      result = (direction === 'reverse' ? n / 1000 : n) / Number(volume);
    } else return null;
    return Number.isFinite(result) && (kind !== 'concentration' || Number.isFinite(result * 1000)) ? result : null;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { convert };
  if (!root.document) return;
  const form = document.querySelector('[data-unit-tool]');
  if (!form) return;
  const input = form.querySelector('#amount'), direction = form.querySelector('#direction');
  const volume = form.querySelector('#volume'), result = form.querySelector('output');
  const label = form.querySelector('[data-amount-label]');
  const format = n => n.toLocaleString('en-US', {maximumSignificantDigits: 12});
  function update() {
    const kind = form.dataset.unitTool, reverse = direction.value === 'reverse';
    label.textContent = kind === 'syringe' ? (reverse ? 'U-100 syringe markings (units)' : 'Volume (mL)') : (reverse ? 'Mass (mcg)' : 'Mass (mg)');
    const n = convert(kind, input.value, direction.value, volume && volume.value);
    if (n === null) { result.textContent = 'Enter a non-negative amount' + (volume ? ' and a final volume greater than zero.' : '.'); return; }
    const unit = kind === 'mass' ? (reverse ? 'mg' : 'mcg') : kind === 'syringe' ? (reverse ? 'mL' : 'U-100 units') : 'mg/mL';
    result.textContent = format(n) + ' ' + unit + (volume ? ' = ' + format(n * 1000) + ' mcg/mL' : '');
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  update();
})(typeof window !== 'undefined' ? window : globalThis);
