---
name: Retrospectives
about: Retrospective Template
title: 'General Retrospective for <month> <year> Releases'
labels: Retrospective
assignees: ''

---

**Summary**

A retrospective for the release named in the title. 

All community members can add items to this agenda via comments.

This will be a Zoom call, with about a week of notice in the #release Slack channel.

The host will make a checklist of actions as we go through the agenda.

Everyone is welcome to attend.

**Details**

Time: 1:30pm UK / 8:30am Ontario
Date: The first Wednesday of the month after the release
URL: [Meeting link](https://eclipse.zoom.us/j/81872484707?pwd=dGl1QzcrTllWUkNWRUVGNzdYVUx4dz09)

**Assignee Tasks**

- [ ] Use the AI prompt (below) to generate a release summary, then paste it into a new comment.
- [ ] Announce the start of the retrospective on the Slack #release channel.
- [ ] Host the retrospective and compile a checklist of actions.
- [ ] Complete any actions assigned to the host.
- [ ] Create a new retrospective issue for the next release.
- [ ] Close this issue.

<details>
<summary> Note: AI Prompt (click to expand)</summary>

Use this prompt verbatim with any AI assistant that can browse GitHub to generate a retrospective bullet-point summary for the most recently completed Temurin release.

## The Prompt

```
Prepare a release summary comment for a Temurin release. If the month and year have not been provided, ask for them before proceeding.

--- Data to fetch ---

Using GitHub MCP tools only (no unauthenticated REST or CLI calls):
1. Release status issue in `adoptium/temurin` — title: `[month] [year]*Release Status per Platform, Version & Binary Type`
2. Release checklist issue in `adoptium/temurin` — title: `Checklist for Temurin Release [month] [year]`
3. All AQAvit activities issues in `adoptium/aqa-tests` — title: `[month] [year] Release AQAvit Activities*`, plus every child triage issue linked within them.

If any of the above cannot be found, stop and report a specific error.

There must be one AQAvit Activities issue per JDK major version in the release status issue. Report an error if any are missing.

--- Version coverage check ---

Fetch https://www.java.com/releases/ and find every JDK major version released in [month] [year]. If any are absent from the release status issue, add a negative bullet. If all are present, say nothing about it.

JDK8 note: the Adoptium version is always one higher than the minor version shown on that site (e.g. site says 8u100 → expect 8u101 at Adoptium).

--- Interpretation rules (never treat these as positives or negatives) ---

- `:no_entry:` = not planned. Not a failure.
- Triage issue checkboxes (including compliance testing and "Triage TCK automated tests") = not a review point.
- Release checklist tickbox completion = not a review point.
- Comment counts = not indicative of a problem.
- Number of JDK versions in the release = not a review point.

--- TCK/JCK confidentiality ---

Never mention specific TCK/JCK test names, test classes, or failure messages. Infrastructure, setup, timeouts, and suite-level pass/fail status may be referenced.

--- Output format ---

Wrap the entire output in a plain text code block (so links are not rendered).
Title: `### Release Summary for [month] [year]`
Two sections: `#### Positives` and `#### Negatives`, each with 3–7 bullets.
Each bullet: one sentence under 20 words (excluding the link), ending with `[Link](https://github.com/...)` pointing to the source issue or comment.
No bold text, no sub-bullets, no bullet without a source link.

This is a release summary comment to be added to the retrospective issue, not the retrospective itself.
```

## Usage notes

- Copy and paste the prompt to begin. Supply release month and year when asked.
- Works with any AI that can browse GitHub.
- If no valid issues are found, this prompt will fail.
</details>

<details>
<summary>Note: Automated tasks (click to expand)</summary>

No manual actions are required for these tasks. This is just a list for future reference.

- Slack reminders:
  - Post retrospective URL in \#Release around the start of the new release.
  - Announce the retrospective's date + time on \#Release in advance.
-  Repeating event on Google calendar. 
  - Add meeting to the Adoptium calendar.

</details>

**TLDR**

Add proposed agenda items as comments below.
