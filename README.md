# Currency Compass PWA

A small, installable multi-currency converter. Default currencies: CAD, EUR, USD and GBP. Add other currencies with **Add currency**.

## Features

- Enter an amount directly in any currency row; that row becomes the reference and all other rows recalculate immediately. Switch conversion direction simply by typing in a different row.
- Add/remove currencies from a built-in list of common currencies.
- Refresh exchange rates on demand; automatic refresh on launch/return to the app and approximately every 6 hours while open.
- Stores the latest rate table locally, so conversions can still work offline using the last saved rates.
- Optional Wi-Fi-only automatic refresh setting.
- Installable PWA with a service worker for app-shell caching.

## Exchange rates and connectivity notes

The app uses the public endpoint `https://open.er-api.com/v6/latest/USD` and computes cross-rates from its USD reference table. This is an indicative market reference, not a bank/card quote; rates are not guaranteed to be tick-by-tick real-time and may update on the provider's schedule. Review the provider's current terms and usage limits before relying on it for a production/commercial application.

Browsers do not consistently expose whether a device is connected through Wi-Fi or mobile data. This app only performs **automatic** refreshes in Wi-Fi-only mode when the browser reports `wifi` or `ethernet`; if the connection type is unknown it pauses auto-refresh. A manual refresh button can still fetch rates when online. No web app can guarantee that the operating system will keep it running in the background for a scheduled refresh. It refreshes when opened/returned to, not as a guaranteed background job.

## Publish with GitHub Pages

1. Download and unzip the project.
2. Create a GitHub repository (public or private; Pages availability depends on your GitHub plan and repository visibility).
3. Upload the contents of this folder to the repository root (so `index.html` is at the root).
4. In **Settings → Pages**, choose **Deploy from a branch**, select your default branch (usually `main`) and folder `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site. Open the published HTTPS URL.
6. On your phone or computer, use the browser's **Install app** / **Add to Home Screen** option.

GitHub Pages is a static host, which is sufficient for this app. Do not open `index.html` directly from Finder/Explorer if you want PWA installation/service-worker support; use GitHub Pages or a local development server.

## Run locally

Python 3 is enough. In this folder, run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Files

- `index.html` — app structure
- `styles.css` — responsive interface
- `app.js` — currencies, conversions, settings and rate fetching
- `manifest.webmanifest` — installable PWA metadata
- `sw.js` — app-shell offline cache
- `icons/` — app icons


## App updates (version 1.1.0)

The app is configured to update itself after you publish a new version to the same GitHub Pages URL:

1. Change `APP_VERSION` in `sw.js` for every release (for example `1.1.0` → `1.1.1`).
2. Upload/commit the updated project files to the same GitHub repository and branch.
3. GitHub Pages publishes the new files at the same URL.
4. The installed app checks for a new service worker when it opens and when it returns to the foreground.
5. If an update is found, it displays an in-app **Mettre à jour** prompt. Tapping it activates the new version and reloads the app.

You do **not** need to send the URL to your phone again or recreate the home-screen icon. The installed icon continues to point to the same web app address. The app must connect to the internet to discover and download a release; the previous cached version remains available offline until the update is installed.

Note: browser and operating-system policies control update-check timing. The app checks on launch/return, but cannot guarantee an instantaneous update while fully closed or offline. Keep the GitHub Pages URL, manifest `start_url`, and scope stable between releases.
