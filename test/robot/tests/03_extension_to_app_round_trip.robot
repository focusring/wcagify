*** Settings ***
Documentation       Full round-trip integration: launch Chromium with the
...                 WCAGify extension, post an issue using the same API call
...                 the extension makes from its side panel, then reload the
...                 report page in the playground and confirm the new issue
...                 is rendered. Exercises the complete extension -> server
...                 -> Nuxt Content -> rendered report path.

Library             DateTime
Resource            ../resources/common.resource
Resource            ../resources/api.resource

Suite Setup         Open Playground With Extension Loaded
Suite Teardown      Close Browser    ALL


*** Test Cases ***
Issue Submitted Via Extension API Appears On The Report Page
    [Documentation]    Submits an issue with a unique title, waits for Nuxt
    ...    Content to pick the new file up, navigates to the report page and
    ...    asserts the issue is visible in the #issues section together with
    ...    its WCAG success criterion.
    [Tags]    extension    integration    round-trip
    Wait Until Reports Table Visible

    ${slug}=    Get First Report Slug
    ${sample}=    Get First Sample Id For Report    ${slug}
    ${ts}=    Get Current Date    result_format=epoch
    ${title}=    Set Variable    Robot e2e — keyboard trap ${ts}

    Submit Issue Via Extension API
    ...    report=${slug}
    ...    title=${title}
    ...    sc=2.1.2
    ...    severity=High
    ...    difficulty=Medium
    ...    sample=${sample}
    ...    description=Keyboard focus gets trapped in the email input field.

    # Nuxt Content debounces filesystem indexing; give it a moment before we
    # navigate, otherwise the report page renders without the new issue.
    Sleep    3s    reason=Allow Nuxt Content to index the freshly-written markdown file
    Reload Report Page Until Issue Appears    ${slug}    ${title}

    Get Text    \#issues    contains    ${title}
    Get Text    \#issues    contains    2.1.2


*** Keywords ***
Reload Report Page Until Issue Appears
    [Documentation]    Navigates to the report detail page and retries up to
    ...    three times. The dev server can HMR-reload after a content write,
    ...    which occasionally aborts the first navigation.
    [Arguments]    ${slug}    ${title}
    FOR    ${attempt}    IN RANGE    3
        ${status}    ${_}=    Run Keyword And Ignore Error
        ...    Go To    ${BASE_URL}/reports/${slug}    wait_until=networkidle
        IF    "${status}" == "PASS"
            ${found}    ${_}=    Run Keyword And Ignore Error
            ...    Wait For Elements State    \#issues    visible    timeout=15s
            IF    "${found}" == "PASS"
                ${html}=    Get Text    \#issues
                IF    """${title}""" in """${html}"""
                    RETURN
                END
            END
        END
        Sleep    2s    reason=Retry navigation after HMR or indexing delay
    END
    Fail    Issue "${title}" did not appear on /reports/${slug} after 3 attempts
