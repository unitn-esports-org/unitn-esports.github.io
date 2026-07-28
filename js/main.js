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

function setupEventModal(getCurrentLang, getI18nValue, getI18nData) {
  const modal = document.getElementById('event-modal');
  const modalDialog = document.querySelector('.event-modal-dialog');
  const modalImage = document.getElementById('event-modal-image');
  const modalTitle = document.getElementById('event-modal-title');
  const modalDate = document.getElementById('event-modal-date');
  const modalParticipants = document.getElementById('event-modal-participants');
  const modalDescription = document.getElementById('event-modal-description');
  const modalExtras = document.getElementById('event-modal-extras');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
  const eventCards = document.querySelectorAll('[data-event-modal-key]');

  if (!modal || !modalDialog || !modalImage || !modalTitle || !modalDate || !modalParticipants || !modalDescription || !modalExtras) {
    return;
  }

  let lastFocusedElement = null;
  let currentEventKey = null;

  function getEventData(eventKey) {
    const lang = getCurrentLang();
    const i18n = getI18nData();
    const localizedData = getI18nValue(i18n[lang], `record.${eventKey}`);
    if (localizedData) {
      return localizedData;
    }

    const fallbackLang = i18n.en ? 'en' : Object.keys(i18n)[0];
    return fallbackLang ? getI18nValue(i18n[fallbackLang], `record.${eventKey}`) : null;
  }

  function getEventTitle(card, eventData) {
    if (eventData && eventData.h3) {
      return eventData.h3;
    }

    const titleElement = card.querySelector('.feature-heading h3');
    return titleElement ? titleElement.innerHTML : '';
  }

  function getEventImage(card) {
    const image = card.querySelector('img');
    return image ? { src: image.getAttribute('src') || '', alt: image.getAttribute('alt') || '' } : { src: '', alt: '' };
  }

  function renderEventModal(eventKey) {
    const card = document.querySelector(`[data-event-modal-key="${eventKey}"]`);
    const eventData = getEventData(eventKey) || {};
    const title = getEventTitle(card || document.createElement('div'), eventData);
    const image = card ? getEventImage(card) : { src: '', alt: '' };
    const dateValue = eventData.date || '—';
    const participantsValue = eventData.participants || '—';
    const descriptionValue = eventData.description || '—';

    modalTitle.innerHTML = title;
    modalDate.innerHTML = dateValue;
    modalParticipants.innerHTML = participantsValue;
    modalDescription.innerHTML = descriptionValue;
    modalImage.src = image.src;
    modalImage.alt = image.alt || modalTitle.textContent || '';

    modalExtras.innerHTML = '';

    Object.keys(eventData)
      .filter(key => /^label\d+$/.test(key))
      .map(key => Number.parseInt(key.replace('label', ''), 10))
      .filter(Number.isFinite)
      .sort((left, right) => left - right)
      .forEach(index => {
        const label = eventData[`label${index}`];
        const value = eventData[`text${index}`];
        if (!label || !value) return;

        const row = document.createElement('p');
        row.className = 'paragraph s secondary event-modal-row';
        row.innerHTML = `<span class="event-modal-label">${label}</span> <span>${value}</span>`;
        modalExtras.appendChild(row);
      });
  }

  function openEventModal(eventKey) {
    currentEventKey = eventKey;
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    renderEventModal(eventKey);
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    modalDialog.focus();
  }

  function closeEventModal() {
    if (modal.hidden) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    currentEventKey = null;

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  eventCards.forEach(card => {
    card.addEventListener('click', () => openEventModal(card.getAttribute('data-event-modal-key')));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEventModal(card.getAttribute('data-event-modal-key'));
      }
    });
  });

  modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeEventModal);
  });

  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.classList.contains('event-modal-backdrop')) {
      closeEventModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeEventModal();
    }
  });

  return {
    refresh() {
      if (currentEventKey) {
        renderEventModal(currentEventKey);
      }
    },
    updateCloseLabel() {
      const lang = getCurrentLang();
      const i18n = getI18nData();
      const label = getI18nValue(i18n[lang], 'record.close-button') || 'Close';
      modalCloseButtons.forEach(button => {
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
      });
    }
  };
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
  let currentLang = 'en';
  let eventModal = null;
  fetch('i18n.json')
    .then(r => r.json())
    .then(data => {
      i18n = data;
      initI18n();
    });

  function setLang(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyTranslations(lang);
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    if (eventModal) {
      eventModal.updateCloseLabel();
      eventModal.refresh();
    }
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
    currentLang = lang;
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
  eventModal = setupEventModal(() => currentLang, getI18nValue, () => i18n);
  if (eventModal) {
    eventModal.updateCloseLabel();
  }

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
