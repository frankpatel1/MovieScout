(function () {
  const STORAGE_KEY = 'moviescout_cookie_consent_v1';

  function getConsent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: data }));
    } catch (e) {}
  }

  function initCookieConsent() {
    const existing = getConsent();
    if (!existing) {
      renderBanner();
    } else {
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: existing }));
    }
  }

  function renderBanner() {
    if (document.getElementById('cookie-consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner-wrapper';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie Consent');
    banner.innerHTML = `
      <div class="cookie-banner-header">
        <span class="cookie-banner-icon">🎬</span>
        <h4 class="cookie-banner-title">Cookie & Privacy Notice</h4>
      </div>
      <p class="cookie-banner-body">
        MovieScout uses essential cookies to remember your watch preferences and optional analytics to evaluate popular titles. Check out our <a href="privacy.html">Privacy Policy</a> for details.
      </p>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-btn cookie-btn-manage" id="btn-cookie-manage">Manage</button>
        <button type="button" class="cookie-btn cookie-btn-decline" id="btn-cookie-decline">Reject Non-Essential</button>
        <button type="button" class="cookie-btn cookie-btn-accept" id="btn-cookie-accept">Accept All</button>
      </div>
    `;

    document.body.appendChild(banner);
    banner.style.display = 'block';

    document.getElementById('btn-cookie-accept').addEventListener('click', function () {
      setConsent({ necessary: true, analytics: true, marketing: true, timestamp: Date.now() });
      banner.remove();
    });

    document.getElementById('btn-cookie-decline').addEventListener('click', function () {
      setConsent({ necessary: true, analytics: false, marketing: false, timestamp: Date.now() });
      banner.remove();
    });

    document.getElementById('btn-cookie-manage').addEventListener('click', function () {
      openPreferencesModal();
    });
  }

  function openPreferencesModal() {
    let modalOverlay = document.getElementById('cookie-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'cookie-modal-overlay';
      modalOverlay.className = 'cookie-modal-overlay';
      modalOverlay.innerHTML = `
        <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
          <h3 id="cookie-modal-title">Cookie Preferences</h3>
          <p class="cookie-category-desc" style="margin-bottom: 1.5rem;">Control which tracking categories you authorize on MovieScout.</p>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <span class="cookie-category-title">Essential & Navigation</span>
              <span style="font-size: 1.2rem; color: #94a3b8; font-weight: 700;">Always Active</span>
            </div>
            <p class="cookie-category-desc">Required to cache movie genres, pagination state, and session settings.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <label for="cookie-opt-analytics" class="cookie-category-title" style="cursor: pointer;">Analytics & Performance</label>
              <input type="checkbox" id="cookie-opt-analytics" checked style="transform: scale(1.3); cursor: pointer;">
            </div>
            <p class="cookie-category-desc">Gathers anonymized metrics on search frequency and page rendering times.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <label for="cookie-opt-marketing" class="cookie-category-title" style="cursor: pointer;">Entertainment Updates</label>
              <input type="checkbox" id="cookie-opt-marketing" style="transform: scale(1.3); cursor: pointer;">
            </div>
            <p class="cookie-category-desc">Used to suggest upcoming movie trailers matching your interest profile.</p>
          </div>

          <div class="cookie-modal-actions">
            <button type="button" class="cookie-btn cookie-btn-decline" id="cookie-modal-cancel">Close</button>
            <button type="button" class="cookie-btn cookie-btn-accept" id="cookie-modal-save">Save Settings</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      document.getElementById('cookie-modal-cancel').addEventListener('click', function () {
        modalOverlay.style.display = 'none';
      });

      document.getElementById('cookie-modal-save').addEventListener('click', function () {
        const analytics = document.getElementById('cookie-opt-analytics').checked;
        const marketing = document.getElementById('cookie-opt-marketing').checked;
        setConsent({ necessary: true, analytics, marketing, timestamp: Date.now() });
        modalOverlay.style.display = 'none';
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) banner.remove();
      });
    }

    const current = getConsent() || { analytics: true, marketing: false };
    document.getElementById('cookie-opt-analytics').checked = !!current.analytics;
    document.getElementById('cookie-opt-marketing').checked = !!current.marketing;

    modalOverlay.style.display = 'flex';
  }

  window.showCookieConsentPreferences = openPreferencesModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
