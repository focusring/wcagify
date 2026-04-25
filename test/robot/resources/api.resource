*** Settings ***
Documentation       Keywords that wrap the playground HTTP API the WCAGify
...                 browser extension talks to. The extension calls these same
...                 endpoints from its side panel; reusing them in tests keeps
...                 the contract honest.
...
...                 The Browser library is intentionally not imported here —
...                 every suite that uses these keywords also loads
...                 common.resource, which imports Browser with the project's
...                 standard arguments. Re-importing here with default args
...                 triggers a "library imported with different arguments"
...                 warning.

Library             Collections
Library             String


*** Variables ***
${BASE_URL}                 ${{os.environ.get('WCAGIFY_BASE_URL', 'http://localhost:3000')}}


*** Keywords ***
Get First Report Slug
    [Documentation]    Returns the slug of the first report exposed by
    ...    GET /api/reports — the same call the extension uses to populate its
    ...    "select report" dropdown.
    ${response}=    HTTP    ${BASE_URL}/api/reports
    Should Be Equal As Integers    ${response}[status]    200
    ${reports}=    Set Variable    ${response}[body]
    Should Not Be Empty    ${reports}    GET /api/reports returned no reports
    ${first}=    Get From List    ${reports}    0
    RETURN    ${first}[slug]

Get First Sample Id For Report
    [Documentation]    Returns the first sample-page id for the given report.
    ...    The extension requires a sample id when posting an issue.
    [Arguments]    ${slug}
    ${response}=    HTTP    ${BASE_URL}/api/reports
    ${reports}=    Set Variable    ${response}[body]
    FOR    ${report}    IN    @{reports}
        IF    "${report}[slug]" == "${slug}"
            ${samples}=    Set Variable    ${report}[sample]
            Should Not Be Empty    ${samples}    Report ${slug} has no samples
            ${first}=    Get From List    ${samples}    0
            RETURN    ${first}[id]
        END
    END
    Fail    Report with slug ${slug} not found in /api/reports response

Submit Issue Via Extension API
    [Documentation]    POSTs an issue payload identical to the one the
    ...    extension's IssueForm.vue sends, and returns the parsed response
    ...    body so callers can assert on the resulting markdown path.
    ...
    ...    The body is JSON-serialised and sent with an explicit
    ...    Content-Type header so Nuxt's `readBody` parses it correctly. The
    ...    Browser library's HTTP keyword does not auto-set Content-Type when
    ...    the body is a string, and form-encoded bodies fail Zod validation
    ...    on the server.
    [Arguments]
    ...    ${report}
    ...    ${title}
    ...    ${sc}
    ...    ${severity}
    ...    ${difficulty}
    ...    ${sample}
    ...    ${description}=${EMPTY}
    ${payload}=    Create Dictionary
    ...    report=${report}
    ...    title=${title}
    ...    sc=${sc}
    ...    severity=${severity}
    ...    difficulty=${difficulty}
    ...    sample=${sample}
    IF    "${description}" != "${EMPTY}"
        Set To Dictionary    ${payload}    description=${description}
    END
    ${json_body}=    Evaluate    json.dumps($payload)    json
    ${headers}=    Create Dictionary    Content-Type=application/json
    ${response}=    HTTP    ${BASE_URL}/api/issues    POST    ${json_body}    ${headers}
    Should Be Equal As Integers    ${response}[status]    200
    ...    msg=POST /api/issues returned ${response}[status]: ${response}[body]
    Should Be True    ${response}[body][success]
    RETURN    ${response}[body]
