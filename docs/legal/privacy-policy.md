# Privacy Policy

_Last updated: March 22, 2026_

## 1. Introduction

This privacy policy describes how WCAGify handles data. WCAGify is an open-source, self-hosted WCAG audit tool developed by focusring.io.

## 2. What Data Do We Process?

**Short answer: none.**

WCAGify is a self-hosted application. All data remains on the user's infrastructure. We have no access to your data and do not collect, process, or store any personal data.

## 3. The WCAGify Application (Self-Hosted)

- All audit data (reports, findings, images) is stored on your own server.
- WCAGify does not connect to any external servers operated by focusring.io.
- No analytics, tracking, or telemetry is collected.
- No cookies are placed by WCAGify itself.

## 4. The Browser Extension

The WCAGify browser extension:

- **Stores locally**: the URL of your WCAGify instance, the selected report, language preference, and theme setting. These are stored in Chrome's local storage and are not sent to us or third parties.
- **Reads page information**: when you activate the element picker, the extension reads the DOM of the current page to highlight elements and generate a CSS selector. This only occurs when you explicitly click "Pick Element".
- **Communicates with your own instance**: the extension sends data exclusively to the WCAGify instance you have configured yourself. No data is sent to us or any other external parties.
- **Does not collect personal data**: the extension does not collect names, email addresses, location data, browsing history, or any other personal data.

## 5. PDF Generation

When you export an audit report as an accessible PDF, WCAGify sends the report content to a WeasyPrint PDF service for rendering. This service processes the report content solely to generate the PDF and does not store any data. If you self-host the PDF service, no data leaves your infrastructure.

## 6. Third-Party Data

WCAGify does not use external analytics services, advertising networks, or any other third-party services that process personal data.

## 7. The Documentation Website (wcagify.com)

The WCAGify documentation website is a static website. No personal data is collected through this website.

## 8. Security

Since WCAGify is self-hosted, you are responsible for the security of your installation. See our [Security Policy](/legal/beveiligingsverklaring) for recommendations.

## 9. Your Rights

Since we do not collect personal data, there is no data to view, correct, or delete. If you have questions about data within your own WCAGify instance, you manage it yourself.

## 10. Changes

Changes to this privacy policy will be published on this page. Please check this page regularly.

## 11. Contact

For questions about this privacy policy, please contact us via [GitHub](https://github.com/focusring/wcagify/issues).
