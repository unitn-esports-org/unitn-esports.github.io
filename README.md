# UniTn E-sports
Github pages repository per il sito dell'associazione

## Google Calendar integration

1. Get your Google Calendar ID:
	- In Google Calendar go to Settings → select the calendar → "Integrate calendar" → copy the "Calendar ID" (looks like `abcd1234@group.calendar.google.com`) or use the public iCal address.
2. Embed the calendar:
	- Open `index.html` and find the iframe in the Calendar section.
	- Replace `your_calendar_id` in the iframe `src` with your calendar ID. Example:
	  `https://calendar.google.com/calendar/embed?src=abcd1234%40group.calendar.google.com&ctz=Europe%2FRome`
3. Subscribe / Download links:
	- The site automatically builds the Google Calendar and .ics links from the iframe `src`. If you replace the `src` the buttons will point to the correct calendar.
4. Make the calendar public:
	- If you want anyone to see events on the embedded calendar, make it public in Google Calendar settings. For private calendars consider using authenticated APIs (not implemented here).

## Editing translations (i18n)

Translations are stored in `i18n.json` at the repository root. To add or modify strings:

- Open `i18n.json` and edit the `en` and `it` objects. Keys map to the `data-i18n` attributes in `index.html`.
- To add a new translatable element, add a `data-i18n="path.to.key"` attribute to the HTML element, then add the corresponding key/value under both locales in `i18n.json`.
- For input placeholders use `data-i18n-placeholder` with the matching key found under the `ph` object (e.g. `contact.ph.name`).

Note: The site loads `i18n.json` at runtime (works when deployed to GitHub Pages or served via a web server). If you open `index.html` via `file://` in the browser, some browsers may block fetching `i18n.json`.  
**Because of this, only editing the text in `index.html` will not work, because the strings from the JSON file will be immediatly loaded and override the changes.**


## Local testing
For local testing, serve the folder with a simple static server, for example using Python:

```powershell
python -m http.server 8000
# then open http://localhost:8000
```

**Necessary for i18n and JavaScript functionality to work**: the site must be served via HTTP, not opened directly as a file.

### Mobile testing

When testing the site for mobile devices, you can use the browser's developer tools to simulate a mobile viewport, or use a local network server and access it from your mobile device.
