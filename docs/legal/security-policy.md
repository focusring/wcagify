# Security Policy

_Last updated: March 22, 2026_

## 1. Introduction

This security policy describes how WCAGify handles security and what you can do to keep your own installation secure. WCAGify is an open-source, self-hosted application developed by focusring.io.

## 2. Architecture

WCAGify is designed with security as a core principle:

- **Self-hosted**: all data remains on your own infrastructure. No data is sent to external servers operated by focusring.io or third parties.
- **No external runtime dependencies**: WCAGify does not connect to external services during use.
- **No user accounts**: WCAGify does not have a built-in authentication system. Access control is handled at the infrastructure level.
- **No database**: audit data is stored as markdown files on the file system.

## 3. Browser Extension

The WCAGify browser extension follows Chrome's Manifest V3 security model:

- **Minimal permissions**: the extension only requests the permissions necessary for its functionality (activeTab, tabs, scripting, storage, sidePanel).
- **No external code**: all JavaScript is bundled within the extension package. No code is loaded or executed from external servers.
- **Content Security Policy**: the extension enforces a strict CSP that only allows scripts from the extension itself.
- **Local storage**: settings are stored exclusively in Chrome's local storage.
- **User-initiated activation**: the element picker and page access are only activated when the user explicitly requests it.

## 4. Recommendations for Your Installation

Since WCAGify is self-hosted, you are responsible for its security. We recommend the following:

### Access Control

- Place WCAGify behind authentication if it contains audit data that should not be public.
- Use a reverse proxy (such as Nginx or Caddy) with HTTPS.
- Restrict access to trusted networks or users.

### HTTPS

- Always use HTTPS in production.
- The browser extension only supports HTTPS connections to your WCAGify instance (in addition to localhost for development).

### Updates

- Keep WCAGify up to date with the latest version.
- Check the [GitHub releases](https://github.com/focusring/wcagify/releases) for security updates.

### Backups

- Regularly back up your audit data (the markdown files and uploads).
- Audit data is difficult to recover if lost.

## 5. Reporting Vulnerabilities

Found a security vulnerability in WCAGify? Please report it responsibly:

- **Do not** report it via a public GitHub issue.
- Contact us via a private message on [GitHub](https://github.com/focusring/wcagify/security).
- We aim to respond within 5 business days.
- We value responsible disclosure and credit researchers (with permission) in our release notes.

## 6. Open Source

The full source code of WCAGify is publicly available on [GitHub](https://github.com/focusring/wcagify). You can inspect, audit, and contribute to the security of the project.

## 7. Changes

Changes to this security policy will be published on this page.

## 8. Contact

For security-related questions, please contact us via [GitHub](https://github.com/focusring/wcagify/security).
