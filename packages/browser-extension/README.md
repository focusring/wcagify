<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="../../docs/public/wcagify-dark.svg" />
    <source media="(prefers-color-scheme: dark)" srcset="../../docs/public/wcagify-light.svg" />
    <img src="../../docs/public/wcagify.svg" alt="WCAGify logo" width="240" height="120" />
  </picture>
</p>

# @wcagify/browser-extension

Browser extension for WCAGify.

## Development

```bash
pnpm ext:dev
```

## Build & Install

```bash
pnpm ext:build
```

### Loading the extension in a Chromium-based browser

These steps work for Google Chrome, Microsoft Edge, Brave, Arc, Vivaldi, and other Chromium-based browsers.

1. Build the extension using the command above. This creates a `dist` folder inside `packages/browser-extension/`.
2. Open your browser and navigate to the extensions page:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
   - **Other Chromium browsers**: `chrome://extensions` usually works
3. Enable **Developer mode** using the toggle in the top-right corner of the page.
4. Click the **Load unpacked** button that appears after enabling developer mode.
5. In the file picker, navigate to and select the `packages/browser-extension/dist` folder.
6. The WCAGify extension icon should now appear in your browser toolbar. If it doesn't, click the puzzle piece icon (Extensions menu) in the toolbar and pin WCAGify.

### Connecting to your WCAGify instance

1. Click the WCAGify extension icon in the toolbar to open the side panel.
2. Enter the URL of your running WCAGify instance (e.g. `http://localhost:3000`).
3. Click **Connect** to verify the connection. The extension will fetch available reports from your instance.

### Updating the extension

After pulling new changes and rebuilding with `pnpm ext:build`, go back to the extensions page and click the reload icon on the WCAGify extension card to load the updated version.

## License

[MIT](../../LICENSE)
