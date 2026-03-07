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
  handleMobileNav();
  setupCalendarLinks();
});
