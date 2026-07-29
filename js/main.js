// Set up calendar links for Google Calendar and ICS file download
function setupCalendarLinks() {

  // Grab necessary elements by their IDs
  const iframe = document.querySelector('#gcalIframe');
  const gcalSubscribe = document.querySelector('#gcalSubscribe');
  const icsDownload = document.querySelector('#icsDownload');
  
  // If any of the elements are missing, exit the function early
  if (!iframe || !gcalSubscribe || !icsDownload) return;
  
  // Define a placeholder calendar ID to use if the iframe's src doesn't provide one
  const placeholderId = 'unitn_e-sports@outlook.it';

  // Extract the calendar ID from the iframe's src attribute
  // default to an empty string if the src attribute is not present
  const src = iframe.getAttribute('src') || '';

  // Attempt to parse the src URL and extract the 'src' query parameter, which contains the calendar ID
  let calId = null;
  try {
    const url = new URL(src);
    calId = url.searchParams.get('src') || null;
  } catch (e) {
    calId = null;
  }
  if (!calId) calId = placeholderId;

  // Set the href attributes for the Google Calendar subscription link and the ICS download link
  gcalSubscribe.href = `https://www.google.com/calendar/render?cid=${encodeURIComponent(calId)}`;
  icsDownload.href = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calId)}/public/calendar-unitn-esports.ics`;
  icsDownload.setAttribute('download', 'events.ics');
}

// Set up the event modal functionality
function setupEventModal(getCurrentLang, getI18nValue, getI18nData) {

  // Grab necessary elements by their IDs and classes
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

  // If any of the required elements are missing, exit the function early
  if (!modal || !modalDialog || !modalImage || !modalTitle || !modalDate || !modalParticipants || !modalDescription || !modalExtras) {
    return;
  }

  // Initialize variables to keep track of the last focused element and the current event key
  let lastFocusedElement = null;
  let currentEventKey = null;

  // Function to retrieve event data based on the event key and current language
  function getEventData(eventKey) {

    const lang = getCurrentLang();
    const i18n = getI18nData();

    // Attempt to retrieve localized data for the event key in the current language
    const localizedData = getI18nValue(i18n[lang], `record.${eventKey}`);
    
    // If localized data is found, return it
    if (localizedData) {
      return localizedData;
    }

    // If no localized data is found, fall back to the first available language
    const fallbackLang = i18n.en ? 'en' : Object.keys(i18n)[0];
    return fallbackLang ? getI18nValue(i18n[fallbackLang], `record.${eventKey}`) : null;
  }

  // Function to retrieve the event title from the card or event data
  function getEventTitle(card, eventData) {
    if (eventData && eventData.h3) {
      return eventData.h3;
    }

    // If no title is found in the event data, attempt to retrieve it from the card's DOM structure
    const titleElement = card.querySelector('.feature-heading h3');
    return titleElement ? titleElement.innerHTML : '';
  }

  // Function to retrieve the event image from the card
  function getEventImage(card) {
    const image = card.querySelector('img');
    return image ? { src: image.getAttribute('src') || '', alt: image.getAttribute('alt') || '' } : { src: '', alt: '' };
  }

  // Function to render the event modal with the appropriate data based on the event key
  // Populates the modal's title, date, participants, description, image, and any additional labeled data
  function renderEventModal(eventKey) {

    // Retrieve the card element associated with the event key and the corresponding event data
    const card = document.querySelector(`[data-event-modal-key="${eventKey}"]`);
    const eventData = getEventData(eventKey) || {};
    const title = getEventTitle(card || document.createElement('div'), eventData);
    const image = card ? getEventImage(card) : { src: '', alt: '' };
    const dateValue = eventData.date || '—';
    const participantsValue = eventData.participants || '—';
    const descriptionValue = eventData.description || '—';

    // Populate the modal elements with the retrieved data
    modalTitle.innerHTML = title;
    modalDate.innerHTML = dateValue;
    modalParticipants.innerHTML = participantsValue;
    modalDescription.innerHTML = descriptionValue;
    modalImage.src = image.src;
    modalImage.alt = image.alt || modalTitle.textContent || '';
    
    // Handle additional labeled data (label1, label2, etc.) and populate the modal extras section
    // (not all modals are equal, some have more fields than others)
    modalExtras.innerHTML = '';

    // Iterate through the eventData keys to find any labeled data and create corresponding rows in the modal
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

  // Function to open the event modal, render its content, and manage focus for accessibility
  function openEventModal(eventKey) {

    // If the modal is already open for the same event, do nothing
    currentEventKey = eventKey;

    // Store the last focused element to return focus to it when the modal is closed
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Render the modal content based on the event key and make the modal visible
    renderEventModal(eventKey);

    // Show the modal and update its ARIA attributes for accessibility
    modal.hidden = false;

    // Set ARIA attributes to indicate that the modal is now visible
    modal.setAttribute('aria-hidden', 'false');

    // Add a class to the document element to indicate that a modal is open (for styling purposes)
    document.documentElement.classList.add('modal-open');

    // Focus the modal dialog for accessibility
    modalDialog.focus();
  }

  // Function to close the event modal, hide it, and return focus to the last focused element
  function closeEventModal() {
    // If the modal is already hidden, do nothing
    if (modal.hidden) {
      return;
    }

    // Hide the modal and update its ARIA attributes for accessibility
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');

    // Clear the current event key to indicate that no event is currently being displayed in the modal
    currentEventKey = null;

    // Return focus to the last focused element if it exists
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  // Add event listeners to each event card to open the modal when clicked or activated via keyboard
  eventCards.forEach(card => {
    card.addEventListener('click', () => openEventModal(card.getAttribute('data-event-modal-key')));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEventModal(card.getAttribute('data-event-modal-key'));
      }
    });
  });

  // Add event listeners to each modal close button to close the modal when clicked
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeEventModal);
  });

  // Add event listener to the modal backdrop to close the modal when clicked outside the dialog
  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.classList.contains('event-modal-backdrop')) {
      closeEventModal();
    }
  });

  // Add event listener to the document to close the modal when the Escape key is pressed
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeEventModal();
    }
  });

  // Return an object with methods to refresh the modal content and update the close button label based on the current language
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

// Function to handle the mobile navigation toggle functionality
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

// Initialize the application once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {

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

  // Function to set the current language, store it in localStorage, and apply translations to the page
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

  // Function to modify site content in order to apply translation
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

  // Function to obtain the corresponding i18n value
  function getI18nValue(obj, key) {
    // key can be nested: contact.label.name
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
  }

  // Function to set i18n related functionality
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

  // Function to update theme icons
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

  // Set initial theme icon state
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

  // Define constant reference to documentElement for better readability
  const html = document.documentElement;

  // Dyslexic font toggle functionality
  const dyslexicToggle = document.getElementById('dyslexic-toggle');
  function setDyslexicFont(enabled) {
    html.classList.toggle('font-dyslexic', enabled);
    localStorage.setItem('dyslexic-font', enabled ? 'enabled' : 'disabled');

    // Update the toggle button's state and accessibility attributes
    if (dyslexicToggle) {
      const actionLabel = enabled ? 'Disable dyslexic font' : 'Enable dyslexic font';
      dyslexicToggle.classList.toggle('active', enabled);
      dyslexicToggle.setAttribute('aria-pressed', String(enabled));
      dyslexicToggle.setAttribute('aria-label', actionLabel);
      dyslexicToggle.setAttribute('title', actionLabel);
    }
  }

  // Load dyslexic font preference from localStorage and apply it
  const savedDyslexicFont = localStorage.getItem('dyslexic-font');
  setDyslexicFont(savedDyslexicFont === 'enabled');

  // Add event listener to the dyslexic font toggle button to switch the font on click
  if (dyslexicToggle) {
    dyslexicToggle.addEventListener('click', () => {
      const isEnabled = html.classList.contains('font-dyslexic');
      setDyslexicFont(!isEnabled);
    });
  }

  // Theme toggle functionality
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
