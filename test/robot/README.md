# WCAGify Robot Framework e2e suite

Regression and integration tests covering the **WCAGify browser extension** running against the **playground app**. The Vitest+Playwright suite under [test/e2e/](../e2e/) covers individual API and UI behaviours; this Robot Framework suite focuses on the cross-component integration: an unpacked Chromium extension plus a live Nuxt server.

## Stack

| Tool                                                                | Version   | Why                                                                                       |
| ------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| [Robot Framework](https://pypi.org/project/robotframework/)         | 7.4.2     | Test runner / DSL                                                                         |
| [Browser library](https://pypi.org/project/robotframework-browser/) | 19.14.2   | Playwright-powered browser keywords; supports MV3 extensions via `New Persistent Context` |
| Python                                                              | >= 3.10   | Required by the Browser library                                                           |
| Node.js + pnpm                                                      | from repo | Runs the playground dev server and builds the extension                                   |

## One-time setup

Browser library 19.x requires **Python ≥ 3.10**. macOS ships with 3.9 so you may need to install a newer interpreter first:

```bash
brew install python@3.12   # or any 3.10+ flavour
```

Then bootstrap the suite (creates a venv at `test/robot/.venv`, installs Robot + Browser library, downloads Playwright browsers):

```bash
pnpm test:robot:setup
```

The setup script picks the highest available `python3.10`–`python3.13` binary on `PATH` and fails fast with installation hints if none is found.

## Running the suite

The suite expects:

1. The extension to have been built — its compiled `dist/` is what Chromium loads via `--load-extension`.
2. The playground dev server to be reachable. By default it points at `http://localhost:3000`.

```bash
# In one terminal — build the extension and start the playground
pnpm ext:build
pnpm dev

# In another terminal — run all Robot suites
pnpm test:robot

# Run a single suite or pass extra robot CLI args:
pnpm test:robot -- tests/02_extension_api_contract.robot
pnpm test:robot -- --include smoke
```

Override the target URL with `WCAGIFY_BASE_URL`, e.g. against a deployed instance:

```bash
WCAGIFY_BASE_URL=https://wcagify.example.com robot test/robot/tests
```

Run headless (uses Chromium's "new" headless mode so the MV3 extension still loads):

```bash
WCAGIFY_HEADLESS=true robot test/robot/tests
```

## Suite layout

```
test/robot/
├── pyproject.toml          # Python project metadata
├── requirements.txt        # Pinned Robot + Browser library versions
├── scripts/
│   ├── setup.sh            # Creates .venv, installs deps, runs `rfbrowser init`
│   └── run.sh              # Activates the venv and runs `robot`
├── resources/
│   ├── common.resource     # Browser launch, extension wiring, shared waits
│   └── api.resource        # /api/reports + /api/issues helpers (the contract the extension consumes)
├── tests/
│   ├── 01_playground_loads_with_extension.robot
│   ├── 02_extension_api_contract.robot
│   └── 03_extension_to_app_round_trip.robot
├── .venv/                  # Python virtualenv (gitignored)
└── results/                # robot output.xml / log.html / report.html (gitignored)
```

## What each test covers

| File                                       | Scenario                                                                                                                           | Why it matters                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `01_playground_loads_with_extension.robot` | Chromium boots with the unpacked extension; the playground's reports table renders and a report detail page opens.                 | Catches regressions where a content-script change breaks the host page (CSP, layout, navigation).                          |
| `02_extension_api_contract.robot`          | `GET /api/reports` and `POST /api/issues` accept the exact shape the extension sends.                                              | Locks the HTTP contract between extension and server — drift here breaks the side panel without any extension code change. |
| `03_extension_to_app_round_trip.robot`     | Submit an issue via the extension's API, reload the report page, assert the new issue is rendered with its WCAG success criterion. | End-to-end: extension → server → Nuxt Content → rendered report.                                                           |

## Notes on Chrome extensions in Playwright / Browser library

- MV3 extensions only load with a **persistent context** (`New Persistent Context`). Browser library exposes the standard Playwright argument list including `userDataDir` and `args`.
- `--disable-extensions-except=<path>` plus `--load-extension=<path>` are passed via `args=` so only the WCAGify build is active.
- Standard Playwright headless mode strips extensions; we append `--headless=new` when `WCAGIFY_HEADLESS=true` so CI can still load them.
- The user-data dir is wiped on every suite run (`Reset User Data Dir` keyword) to keep extension storage clean between runs.
