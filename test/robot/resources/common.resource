*** Settings ***
Documentation       Shared keywords used by all WCAGify Robot Framework e2e suites.
...                 Centralises Browser library setup, extension launch parameters
...                 and standard waits so individual test files stay declarative.

Library             Browser    auto_closing_level=SUITE    enable_presenter_mode=False
Library             OperatingSystem
Library             Process
Library             String


*** Variables ***
# Override with WCAGIFY_BASE_URL=... to point at a deployed instance.
${BASE_URL}                 ${{os.environ.get('WCAGIFY_BASE_URL', 'http://localhost:3000')}}

# Path to the unpacked extension that Chromium will load. The extension must be
# built with `pnpm ext:build` before running the suite.
${EXT_PATH}                 ${CURDIR}/../../../packages/browser-extension/dist

# Per-suite Chromium profile. Persistent contexts require a directory; we wipe
# it before each suite so tests do not leak state between runs.
${USER_DATA_DIR}            ${CURDIR}/../.user-data

# WCAGIFY_HEADLESS=true switches Chromium to the new headless mode, which is
# the only headless flavour that loads MV3 extensions.
${HEADLESS}                 ${{os.environ.get('WCAGIFY_HEADLESS', 'false').lower() == 'true'}}


*** Keywords ***
Open Playground With Extension Loaded
    [Documentation]    Launches a Chromium persistent context with the WCAGify
    ...    extension installed via `--load-extension` and opens the playground
    ...    home page. Returns the new page so callers can chain interactions.
    ${ext}=    Normalize Path    ${EXT_PATH}
    Verify Extension Build Exists    ${ext}
    Reset User Data Dir
    ${args}=    Build Chromium Args    ${ext}
    New Persistent Context
    ...    userDataDir=${USER_DATA_DIR}
    ...    browser=chromium
    ...    headless=${HEADLESS}
    ...    viewport={"width": 1400, "height": 900}
    ...    args=${args}
    New Page    ${BASE_URL}

Verify Extension Build Exists
    [Documentation]    Fails fast with a helpful message when the extension has
    ...    not been built yet — the suite cannot exercise the extension without
    ...    its compiled manifest.
    [Arguments]    ${ext}
    ${manifest}=    Set Variable    ${ext}/manifest.json
    ${exists}=    Run Keyword And Return Status    File Should Exist    ${manifest}
    IF    not ${exists}
        Fail    Extension build not found at ${manifest}. Run `pnpm ext:build` from the repo root before running this suite.
    END

Reset User Data Dir
    [Documentation]    Wipes the Chromium profile so each suite starts from a
    ...    clean state — extensions read storage from this directory.
    Run Keyword And Ignore Error    Remove Directory    ${USER_DATA_DIR}    recursive=True
    Create Directory    ${USER_DATA_DIR}

Build Chromium Args
    [Documentation]    Returns the Chromium CLI flags required to load the
    ...    unpacked WCAGify extension. `--headless=new` is appended when
    ...    WCAGIFY_HEADLESS is true so the extension still loads in CI.
    [Arguments]    ${ext}
    ${args}=    Create List
    ...    --disable-extensions-except\=${ext}
    ...    --load-extension\=${ext}
    ...    --no-first-run
    ...    --no-default-browser-check
    IF    ${HEADLESS}
        Append To List    ${args}    --headless\=new
    END
    RETURN    ${args}

Wait Until Reports Table Visible
    [Documentation]    Waits for the playground home page to render the reports
    ...    table — the canonical signal that the Nuxt app has finished SSR and
    ...    Nuxt Content has indexed the report collection.
    Wait For Elements State    table    visible    timeout=30s
