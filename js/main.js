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

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
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
