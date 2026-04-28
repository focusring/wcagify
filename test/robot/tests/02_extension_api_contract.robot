*** Settings ***
Documentation       Locks in the HTTP contract between the WCAGify browser
...                 extension and the playground app. The extension's
...                 IssueForm.vue posts to /api/issues with a fixed payload
...                 shape; if the playground server changes that contract
...                 silently, this suite fails before users notice.

Resource            ../resources/common.resource
Resource            ../resources/api.resource

Suite Setup         Open Playground With Extension Loaded
Suite Teardown      Close Browser    ALL


*** Test Cases ***
GET /api/reports Exposes The Shape The Extension Consumes
    [Documentation]    The extension's "select report" UI relies on slug,
    ...    title and sample[] being present on each report. Drift here breaks
    ...    the side panel without any extension code change.
    [Tags]    extension    api    contract
    ${response}=    HTTP    ${BASE_URL}/api/reports
    Should Be Equal As Integers    ${response}[status]    200
    ${reports}=    Set Variable    ${response}[body]
    Should Not Be Empty    ${reports}
    ${first}=    Get From List    ${reports}    0
    Dictionary Should Contain Key    ${first}    slug
    Dictionary Should Contain Key    ${first}    title
    Dictionary Should Contain Key    ${first}    sample
    ${samples}=    Set Variable    ${first}[sample]
    Should Not Be Empty    ${samples}
    ${sample}=    Get From List    ${samples}    0
    Dictionary Should Contain Key    ${sample}    id
    Dictionary Should Contain Key    ${sample}    title
    Dictionary Should Contain Key    ${sample}    url

POST /api/issues Accepts An Extension-Style Payload
    [Documentation]    Reproduces the exact payload the extension sends when
    ...    a tester clicks "Submit issue" in the side panel and confirms the
    ...    server creates a markdown file under content/.
    [Tags]    extension    api    contract
    ${slug}=    Get First Report Slug
    ${sample}=    Get First Sample Id For Report    ${slug}
    ${result}=    Submit Issue Via Extension API
    ...    report=${slug}
    ...    title=Robot smoke — focus indicator missing on nav
    ...    sc=2.4.7
    ...    severity=High
    ...    difficulty=Low
    ...    sample=${sample}
    ...    description=Reported by Robot Framework integration suite.
    Dictionary Should Contain Key    ${result}    path
    Should End With    ${result}[path]    .md
