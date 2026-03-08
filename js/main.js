// --- Calendar Links ---
function setupCalendarLinks() {
  const iframe = document.querySelector('#gcalIframe');
  const gcalSubscribe = document.querySelector('#gcalSubscribe');
  const icsDownload = document.querySelector('#icsDownload');
  if (!iframe || !gcalSubscribe || !icsDownload) return;
  const placeholderId = 'unitn_e-sports@outlook.it';
  const src = iframe.getAttribute('src') || '';
  let calId = null;
  try {
    const url = new URL(src);
    calId = url.searchParams.get('src') || null;
  } catch (e) {
    calId = null;
  }
  if (!calId) calId = placeholderId;
  gcalSubscribe.href = `https://www.google.com/calendar/render?cid=${encodeURIComponent(calId)}`;
  icsDownload.href = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calId)}/public/calendar-unitn-esports.ics`;
  icsDownload.setAttribute('download', 'events.ics');
}

function handleMobileNav() {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  mobileToggle.addEventListener("click", () => {
    navigation.classList.toggle("open");
    mobileToggle.classList.toggle("active");
  });

  document.documentElement.addEventListener("click", (event) => {
    if (!mobileToggle.contains(event.target) && !navigation.contains(event.target)) {
      navigation.classList.remove("open");
      mobileToggle.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // --- i18n Translation ---
  // Load i18n data and handle language switching
  let i18n = {};
  fetch('i18n.json')
    .then(r => r.json())
    .then(data => {
      i18n = data;
      initI18n();
    });

  function setLang(lang) {
    if (!i18n[lang]) return;
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function applyTranslations(lang) {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getI18nValue(i18n[lang], key);
      if (value) el.innerHTML = value;
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getI18nValue(i18n[lang], key);
      if (value) el.setAttribute('placeholder', value);
    });
  }

  function getI18nValue(obj, key) {
    // key can be nested: contact.label.name
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
  }

  function initI18n() {
    // Set initial language
    let lang = localStorage.getItem('lang');
    if (!lang || !i18n[lang]) {
      lang = navigator.language && i18n[navigator.language.slice(0,2)] ? navigator.language.slice(0,2) : 'en';
    }
    setLang(lang);
    // Add event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  // --- Theme Icon Initial State and Toggle ---
  function updateThemeIcons(theme) {
    var sun_icon = document.getElementById('theme-icon-sun');
    var moon_icon = document.getElementById('theme-icon-moon');
    if (theme === 'dark') {
      if (sun_icon) sun_icon.style.display = 'inline';
      if (moon_icon) moon_icon.style.display = 'none';
    } else {
      if (sun_icon) sun_icon.style.display = 'none';
      if (moon_icon) moon_icon.style.display = 'inline';
    }
  }

  // Set initial icon state
  (function() {
    var html = document.documentElement;
    if (html.classList.contains('theme-dark')) {
      updateThemeIcons('dark');
    } else {
      updateThemeIcons('light');
    }
  })();
  handleMobileNav();
  setupCalendarLinks();

  const html = document.documentElement;

  // --- Dyslexic Font Toggle ---
  const dyslexicToggle = document.getElementById('dyslexic-toggle');
  function setDyslexicFont(enabled) {
    html.classList.toggle('font-dyslexic', enabled);
    localStorage.setItem('dyslexic-font', enabled ? 'enabled' : 'disabled');

    if (dyslexicToggle) {
      const actionLabel = enabled ? 'Disable dyslexic font' : 'Enable dyslexic font';
      dyslexicToggle.classList.toggle('active', enabled);
      dyslexicToggle.setAttribute('aria-pressed', String(enabled));
      dyslexicToggle.setAttribute('aria-label', actionLabel);
      dyslexicToggle.setAttribute('title', actionLabel);
    }
  }

  const savedDyslexicFont = localStorage.getItem('dyslexic-font');
  setDyslexicFont(savedDyslexicFont === 'enabled');

  if (dyslexicToggle) {
    dyslexicToggle.addEventListener('click', () => {
      const isEnabled = html.classList.contains('font-dyslexic');
      setDyslexicFont(!isEnabled);
    });
  }

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  function setTheme(theme) {
    if (theme === 'light') {
      html.classList.remove('theme-dark');
      html.classList.add('theme-light');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      html.classList.remove('theme-light');
      html.classList.add('theme-dark');
      if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to light theme');
    }
    updateThemeIcons(theme);
    localStorage.setItem('theme', theme);
  }
  
  // Load theme from storage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setTheme(savedTheme);
  } else {
    // Set initial state based on class
    if (html.classList.contains('theme-light')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = html.classList.contains('theme-dark');
      setTheme(isDark ? 'light' : 'dark');
    });
  }
});
