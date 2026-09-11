/* Website traffic only. Never read calculator fields or shared calculation URLs. */
(() => {
  'use strict';
  const id = 'G-23VJH8NXMV';
  const key = 'peptidebro-website-analytics';
  const pages = new Map([['/', 'Home'], ['/index.html', 'Home'], ['/calculator', 'Calculator'], ['/calculator.html', 'Calculator'], ['/support.html', 'Support'], ['/privacy.html', 'Privacy'], ['/terms.html', 'Terms'], ['/website-privacy.html', 'Website privacy']]);
  if (!pages.has(location.pathname) || location.search || location.hash) return;
  const blocked = navigator.globalPrivacyControl || navigator.doNotTrack === '1';
  let choice = null;
  try { choice = localStorage.getItem(key); } catch {}
  let started = false;
  const page = location.origin + location.pathname;
  function start() {
    if (started || blocked) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    let referrer = '';
    try { referrer = new URL(document.referrer).origin + '/'; } catch {}
    gtag('config', id, { page_location: page, page_referrer: referrer, page_title: pages.get(location.pathname), allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 7776000 });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      try {
        if (new URL(link.href).hostname === 'apps.apple.com') {
          gtag('event', 'app_store_click', { page_location: page, link_domain: 'apps.apple.com', transport_type: 'beacon' });
        }
      } catch {}
    });
  }
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Website analytics choice');
  panel.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:1000;max-width:600px;background:#fff;color:#17251c;padding:16px;border:1px solid #bcc8bf;border-radius:12px;box-shadow:0 4px 20px #0002;font:14px/1.5 system-ui';
  panel.innerHTML = '<p style="margin:0 0 10px">Allow optional analytics cookies to measure visits and App Store clicks? Calculator inputs are never collected. <a href="/website-privacy.html">Details</a></p>';
  function choose(value) {
    try { localStorage.setItem(key, value); } catch {}
    panel.remove();
    if (value === 'yes') start();
    else if (started) {
      window['ga-disable-' + id] = true;
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.trim().split('=')[0];
        if (!name.startsWith('_ga')) return;
        for (const domain of ['', ';domain=' + location.hostname, ';domain=.' + location.hostname]) document.cookie = name + '=;Max-Age=0;path=/' + domain;
      });
      location.reload();
    }
  }
  for (const [label, value] of [['Allow analytics', 'yes'], ['No thanks', 'no']]) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = 'margin-right:8px;padding:8px 12px;border:1px solid #526758;border-radius:6px;background:#fff;color:#17251c;cursor:pointer;font:inherit';
    button.addEventListener('click', () => choose(value));
    panel.append(button);
  }
  const settings = document.createElement('button');
  settings.textContent = 'Analytics preferences';
  settings.style.cssText = 'display:block;margin:12px auto;padding:6px 10px;font:inherit;cursor:pointer';
  settings.addEventListener('click', () => { document.body.append(panel); panel.querySelector('button').focus(); });
  if (!blocked) {
    (document.querySelector('footer') || document.body).append(settings);
    if (choice === 'yes') start();
    else if (choice !== 'no') document.body.append(panel);
  }
})();
