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
- [ ] Host the retrospective and compile a checklist of actions.
- [ ] Complete any actions assigned to the host.
- [ ] Create a new retrospective issue for the next release.
- [ ] Close this issue.

<details>
<summary> Note: AI Prompt (click to expand)</summary>

Use this prompt verbatim with any AI assistant that can browse GitHub to generate a retrospective bullet-point summary for the most recently completed Temurin release.

## The Prompt

```
Prepare a retrospective comment for the most recent Temurin release.

First, ask me for the release month and year. Do not continue until a valid month and year are supplied. Use the [month] and [year] values throughout.

Fetch the following GitHub issues plus all their comments:
- The most recent issue in `adoptium/temurin` whose title starts with `[month] [year]`, optionally followed by a JDK identifier, and ends with `Release Status per Platform, Version & Binary Type`
- The most recent issue in `adoptium/temurin` titled: `Checklist for Temurin Release [month] [year]`
- Every issue in `adoptium/aqa-tests` whose title starts with `[month] [year] Release AQAvit Activities`, including every child or linked issue referenced within them

From all of that content, identify the primary positives (things that went well, met targets, or improved) and negatives (blockers, failures, delays, regressions, or repeated concerns). Favour points that are concrete, mentioned by multiple people, or actionable in a retro.

Write the output as two sections — **Positives** and **Negatives** — each with 3–7 bullet points. Each bullet is one short sentence (under 20 words) ending with a markdown link to its best supporting source: `[Link](url)`. No sub-bullets, no bold text within bullets, no bullet without a source.
```

## Usage notes

- Paste as-is — no substitutions needed. The AI derives the release month and year directly from the GitHub issues.
- Works with any assistant that can browse GitHub (e.g. ChatGPT with browsing, Claude with tools, Gemini with extensions).
- If the checklist issue title format has changed or no valid issue is found, tell the AI which month and year to use instead.
</details>

<details>
<summary>Note: Automated tasks (click to expand)</summary>

No manual actions are required for these tasks. This is just a list for future reference.

- Slack reminders:
  - Post retrospective URL in \#Release around the start of the new release.
  - Announce the retrospective's date + time on \#Release a week in advance.
  - Announce the start of the retrospective on #Slack.
-  Repeating event on Google calendar. 
  - Add meeting to the Adoptium calendar.

</details>

**TLDR**

Add proposed agenda items as comments below.
