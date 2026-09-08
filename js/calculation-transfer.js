/* Arithmetic inputs only. Payloads stay in the URL fragment, never in a server query. */
(function (root) {
  'use strict';
  const kinds = {
    mode: ['powder', 'premixed', 'blend'], amountUnit: ['mg', 'mcg'],
    concentrationUnit: ['mgPerML', 'mcgPerML'], syringe: ['u100', 'u40'],
    barrel: ['half03', 'half05', 'full10']
  };
  function validate(value) {
    if (!value || value.format !== 'peptidebro-calculation' || value.version !== 1) throw new Error('Unsupported calculation format.');
    for (const [key, choices] of Object.entries(kinds)) if (!choices.includes(value[key])) throw new Error('Unsupported ' + key + '.');
    for (const key of ['vialMg', 'waterML', 'concentration', 'blendBMg', 'amount']) {
      if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < 0) throw new Error('Invalid ' + key + '.');
    }
    if (value.amount <= 0 || (value.mode === 'premixed' ? value.concentration <= 0 : value.vialMg <= 0 || value.waterML <= 0)) throw new Error('Complete the vial and amount fields first.');
    const clean = {format: value.format, version: value.version};
    for (const key of [...Object.keys(kinds), 'vialMg', 'waterML', 'concentration', 'blendBMg', 'amount']) clean[key] = value[key];
    const result = calculate(clean);
    if (![result.concentrationMgML, result.volumeML, result.units].every(n => Number.isFinite(n) && n > 0)) throw new Error('These values do not produce a valid calculation.');
    return clean;
  }
  function calculate(v) {
    const concentrationMgML = v.mode === 'premixed' ? v.concentration / (v.concentrationUnit === 'mcgPerML' ? 1000 : 1) : v.vialMg / v.waterML;
    const volumeML = v.amount / (v.amountUnit === 'mcg' ? 1000 : 1) / concentrationMgML;
    const units = volumeML * (v.syringe === 'u100' ? 100 : 40);
    return {concentrationMgML, volumeML, units};
  }
  function encode(value) {
    return btoa(JSON.stringify(validate(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(payload) {
    if (!payload || payload.length > 44000 || !/^[A-Za-z0-9_-]+$/.test(payload)) throw new Error('This transfer link is incomplete or invalid.');
    let raw = payload.replace(/-/g, '+').replace(/_/g, '/');
    raw += '='.repeat((4 - raw.length % 4) % 4);
    try { return validate(JSON.parse(atob(raw))); } catch (_) { throw new Error('This calculation could not be read. Ask for a new link or file.'); }
  }
  function link(value, origin = 'https://peptidebro.app') { return origin + '/transfer.html#' + encode(value); }
  const api = {validate, calculate, encode, decode, link};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PeptideBroTransfer = api;
})(typeof window === 'undefined' ? globalThis : window);
