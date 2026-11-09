(() => {
  const GA4_MEASUREMENT_ID = 'G-5QJ7JNEMNP';
  const CONSENT_STORAGE_KEY = 'nursery-analytics-consent';
  const DEVICE_EXCLUSION_STORAGE_KEY = 'nursery-analytics-device-excluded';
  const DEVELOPER_TRAFFIC_STORAGE_KEY = 'nursery-analytics-developer-traffic';
  let googleAnalyticsLoaded = false;

  const loadGoogleAnalytics = () => {
    if (googleAnalyticsLoaded ||
        localStorage.getItem(DEVICE_EXCLUSION_STORAGE_KEY) === 'true') return;
    googleAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      debug_mode: localStorage.getItem(DEVELOPER_TRAFFIC_STORAGE_KEY) === 'true'
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };

  window.trackNurseryEvent = (eventName, parameters = {}) => {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consent !== 'accepted' ||
        localStorage.getItem(DEVICE_EXCLUSION_STORAGE_KEY) === 'true') return;
    window.gtag('event', eventName, parameters);
  };

  const banner = document.createElement('aside');
  banner.className = 'analytics-consent-banner';
  banner.setAttribute('aria-label', 'Analytics privacy choices');
  banner.setAttribute('aria-live', 'polite');
  banner.hidden = true;

  const message = document.createElement('p');
  message.textContent = 'May we use Google Analytics to understand visits and plant-page interactions? Analytics loads only if you accept. We do not send your name, phone number, email address, or form contents to analytics.';

  const actions = document.createElement('div');
  actions.className = 'analytics-consent-actions';

  const acceptButton = document.createElement('button');
  acceptButton.className = 'analytics-consent-accept';
  acceptButton.type = 'button';
  acceptButton.textContent = 'Accept analytics';

  const rejectButton = document.createElement('button');
  rejectButton.className = 'analytics-consent-reject';
  rejectButton.type = 'button';
  rejectButton.textContent = 'Reject';

  actions.append(acceptButton, rejectButton);
  banner.append(message, actions);

  const settingsButton = document.createElement('button');
  settingsButton.className = 'analytics-privacy-settings';
  settingsButton.type = 'button';
  settingsButton.textContent = 'Privacy settings';
  settingsButton.setAttribute('aria-label', 'Change analytics privacy settings');

  document.body.append(banner, settingsButton);

  const hideBanner = () => {
    banner.hidden = true;
    settingsButton.hidden = false;
  };

  acceptButton.addEventListener('click', () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    hideBanner();
    loadGoogleAnalytics();
    window.trackNurseryEvent('analytics_consent', { choice: 'accepted' });
  });

  rejectButton.addEventListener('click', () => {
    const wasLoaded = googleAnalyticsLoaded;
    localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected');
    hideBanner();
    if (wasLoaded) {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      window.location.reload();
    }
  });

  settingsButton.addEventListener('click', () => {
    settingsButton.hidden = true;
    banner.hidden = false;
    acceptButton.focus();
  });

  const savedChoice = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (localStorage.getItem(DEVICE_EXCLUSION_STORAGE_KEY) === 'true') {
    settingsButton.hidden = false;
  } else if (savedChoice === 'accepted') {
    settingsButton.hidden = false;
    loadGoogleAnalytics();
  } else if (savedChoice === 'rejected') {
    settingsButton.hidden = false;
  } else {
    settingsButton.hidden = true;
    banner.hidden = false;
  }
})();
