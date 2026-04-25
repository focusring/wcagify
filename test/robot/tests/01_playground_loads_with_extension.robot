*** Settings ***
Documentation       Verifies that the playground app renders correctly when
...                 Chromium is launched with the WCAGify browser extension
...                 loaded as an unpacked MV3 extension. Catches regressions
...                 where the extension's content script or service worker
...                 would break the host page.

Resource            ../resources/common.resource

Suite Setup         Open Playground With Extension Loaded
Suite Teardown      Close Browser    ALL


*** Test Cases ***
Reports Table Renders With Extension Installed
    [Documentation]    Smoke test: the playground home page must surface the
    ...    reports table even though Chromium is running with the extension
    ...    injected into every page.
    [Tags]    smoke    extension    playground
    Wait Until Reports Table Visible
    ${rows}=    Get Element Count    table tbody tr
    Should Be True    ${rows} > 0    Expected at least one report row but got ${rows}
    Get Text    table    contains    AA

Report Detail Page Opens From The Reports Table
    [Documentation]    Clicking the first report link must navigate to the
    ...    detail page and render the executive summary section. This proves
    ...    that client-side navigation still works while the extension's
    ...    content script is present in the page.
    [Tags]    extension    playground    navigation
    Wait Until Reports Table Visible
    Click    table a >> nth=0
    Wait For Elements State    \#executive-summary    visible    timeout=30s
    ${url}=    Get Url
    Should Contain    ${url}    /reports/
    Wait For Elements State    \#issues    visible    timeout=10s
