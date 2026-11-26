# Release status tables

The workflow [`update-release-status.yml`](../workflows/update-release-status.yml) runs every 10 minutes
(and on demand) and regenerates the per-version tables in the release status issue
(created from [`release-status.md`](../ISSUE_TEMPLATE/release-status.md)) from [`status.csv`](status.csv).
The issue is only edited when the generated content differs.

Each generated table starts with a note saying that it is generated and that manual edits are overwritten. Anything
outside the tables (intro text, headings' extra text, notes below a table) is preserved, as are hyperlinks that were added
to a table's header cells (for example `[jdk21 AQA](https://github.com/adoptium/aqa-tests/issues/7984)`).

The issue title must start with an English month and a four digit year (for example `November 2026 Release Status ...`):
the title is matched with `[A-Za-z]+\s+\d{4}`, and the workflow does not update the issue if it cannot read it.

## Usage

1. After the release status issue is created, open a PR that sets `issue=<number>` in [`config.properties`](config.properties)
   (`main` is protected, and scheduled workflows only run from `main`). This is the "Enable Status Table Updates" step of the
   [release checklist](../ISSUE_TEMPLATE/release-checklist-swimlanes.md).
2. Nothing else is needed as the release progresses: the statuses are derived from the sources below. Only open a PR
   against [`status.csv`](status.csv) when a release will not ship something (see "Defaults and per-release exceptions").
3. After the release, open a PR that clears `issue=` so that the workflow does nothing between releases (the "Disable Status
   Table Updates" step of the release checklist). The workflow also does nothing once the status issue is closed.

## status.csv columns

`Version,Platform,AQAstatus,TCKstatus,publishStatus,installerStatus,imagesStatus,Notes`

- `Version`: used as the `###` heading. The JDK feature number (8, 11, 17, ...) selects which table in the issue is
  replaced; a table is appended if none exists. It can stay a template placeholder such as `jdk-21.0.X+Y`: the
  workflow replaces it from the release plan (see below). Set an exact tag such as `jdk8u514-b01` or `jdk-21.0.13.1+2`
  only for versions that are not in the release plan.
- `Platform`: `<arch>_<os>`, e.g. `x64_linux`, `aarch64_mac`, `ppc64_aix`, `x64_alpine-linux`
  (`x86-64_mac` is accepted as `x64_mac`). `x64_linux`, `x64_windows`, `x64_mac`, `aarch64_linux` and `aarch64_mac`
  are rendered in bold (not `aarch64_windows`).
- Status columns (the CSV only needs `NotStarted` or `NotPlanned`; the other values are derived): `Completed` (:heavy_check_mark:), `InProgress` (:hourglass_flowing_sand:),
  `NotStarted` (:pause_button:), `NotPlanned` (:no_entry:).
- `Notes`: free text; quote it if it contains a comma.
- Rows keep their CSV order. Lines starting with `#` and blank lines are ignored.

## Defaults and per-release exceptions

The rows in `status.csv` are permanent: the `NotPlanned` cells (for example mac images or AIX installers) and the Notes
come from the release status template and stay the same from cycle to cycle. Every other cell stays `NotStarted` and is
derived by the workflow as the release progresses.

When a particular release will not ship something, open a PR that sets the affected cells to `NotPlanned` (and, if useful,
adds a Note), and revert it in a PR after the release. Because `NotPlanned` is never overridden:

- If a platform will not be published, set `publishStatus` to `NotPlanned`. `installerStatus` and `imagesStatus` are only
  derived for published rows, so set them to `NotPlanned` too, otherwise they stay `NotStarted`.
- If only the installer or only the image will not be delivered, set just that cell.
- `AQAstatus` and `TCKstatus` can be set to `NotPlanned` as well, but publishing requires both to be `Completed`, so such a row
  never gets a derived `publishStatus`.

## Derived AQA and TCK status

On each run, `AQAstatus` and `TCKstatus` are also derived from the triage issues in
[`aqaRepo`](config.properties) (default `adoptium/aqa-tests`), found by listing the repository's issues updated since the start of the month before the
cycle and keeping those titled `Triage Automated Tests for <Month> <Year> ...`. (The issue list is used rather than search,
because search can return partial results without an error, which would reset cells.) `<Month> <Year>` is taken from the start of the release
status issue title. Each CSV row is matched on JDK feature number and platform (from the issue body
`Version: JDK8` / `Platform: x86-64_mac`, falling back to the title). If several issues match, the newest is used.

`AQAstatus` and `TCKstatus` are derived separately from the checklist in the issue body
(`- [x] Triage AQAvit tests ...` drives `AQAstatus`, `- [x] Triage TCK automated tests ...` drives `TCKstatus`):

| Triage issue state                                                                    | Derived value |
| ------------------------------------------------------------------------------------- | ------------- |
| closed as "not planned"                                                               | `NotPlanned`  |
| closed any other way, or this column's box is ticked                                  | `Completed`   |
| otherwise: has comments, was reopened, or the other column's box is ticked            | `InProgress`  |
| otherwise (open, no comments, nothing ticked)                                         | none: the `status.csv` value is used |

A derived value replaces the `status.csv` value, so a status can go backwards, for example a closed triage issue
that is reopened drops back from `Completed` to `InProgress` until its checklist is done and it is closed again.
A `NotPlanned` in `status.csv` is never overridden. `status.csv` itself is not rewritten, so the derived values only appear in the
issue tables, and `status.csv` remains the source for the columns that are not derived.

## Release tags

The tags of the cycle come from [`releasePlan.cfg`](https://github.com/adoptium/mirror-scripts/blob/master/releasePlan.cfg)
in mirror-scripts (`releasePlanUrl` in `config.properties`), e.g. `jdk21uGA="jdk-21.0.13.1-ga"`. For each JDK
version in the plan, `Version` is set to the full release name known to the Adoptium API (`jdk-21.0.13.1+2`,
`jdk8u514-b01`); until the API knows it, to the plan tag without a build number (`jdk-21.0.13.1`) and the derivations
below that need a release name are skipped. If the plan or the API cannot be read, the heading and the published, installer and image cells already shown in the issue
are kept for the affected versions.

Only the JDK version token of a `### JDK...` heading is replaced; text after it is kept
(`### JDK21 - Linux delayed` becomes `### jdk-21.0.13.1+2 - Linux delayed`), and other headings are left alone.

## Derived publish status

`publishStatus` is derived from the Adoptium API: for each distinct release name the workflow requests
`https://api.adoptium.net/v3/assets/release_name/eclipse/<release name>?project=jdk`. A row becomes `Completed` when the response contains a `jdk` binary for the
row's architecture and OS (`x64`/`mac`, `aarch64`/`alpine-linux`, ...; `arm32` and `ppcle64` map to the API's `arm` and `ppc64le`).

- A 404 means the tag is not published yet, so rows keep their `status.csv` value.
- Publishing is not allowed before testing completes, so `publishStatus` is only set when `AQAstatus` and `TCKstatus`
  (after the triage derivation above) are both `Completed`. If platforms are published earlier, the run logs one warning
  listing them and the table is not changed for those rows.
- Rows without a resolved release name (a placeholder or a plan tag without a build number) are not looked up.
- `NotPlanned` is never overridden. The derived value only ever sets `Completed`, so a value already in `status.csv` stays.
- If the API call fails (HTTP error or network), the cells already shown in the issue are kept for that version and a warning is logged.

## Derived installer and image status

`installerStatus` and `imagesStatus` are only derived for rows whose `publishStatus` is `Completed`, only ever set
`Completed`, never override `NotPlanned`, and keep the cell already shown in the issue when a lookup fails (a warning is logged). A 404 or a missing
image or package is not a failure: the cell shows the `status.csv` value.

| Column | Platform | `Completed` when |
| ------ | -------- | ---------------- |
| `installerStatus` | `mac`, `windows` | the Adoptium API binary for the platform has an `installer` (`.pkg`, `.msi`) |
| `installerStatus` | `linux` | the `deb` and `rpm` packages for the architecture exist on [packages.adoptium.net](https://packages.adoptium.net/) (anonymous Artifactory search for `temurin-<N>-jdk` packages of the release) |
| `installerStatus` | `alpine-linux` | the `apk` package for the architecture exists on packages.adoptium.net |
| `imagesStatus` | `linux`, `alpine-linux`, `windows` | a Docker Hub `eclipse-temurin:<version>_<build>-jdk*` tag has an image for the architecture (`-alpine*` tags for `alpine-linux`) |

Not derived: AIX has no installer or image, and mac has no image. Those rows keep their `status.csv` value
(normally `NotPlanned`). Linux package architectures are `amd64`/`x86_64`, `arm64`/`aarch64`, `armhf`/`armv7hl` (arm32),
`ppc64el`/`ppc64le`, `s390x` and `riscv64`; Alpine packages exist for `x86_64` and `aarch64` only. The Jenkins job
`create_installer_linux` is not used because it needs credentials.

Limits: Docker Hub's anonymous API is rate limited, and one request is made per version per run; an image for a platform
that is built in a different tag shape (e.g. `jdk-noble` only) is still found because every `-jdk*` variant tag is read.

An invalid status value fails the workflow run and leaves the issue unchanged.

Note: the scheduled run only fires from the default branch, and GitHub may delay or skip
`*/10` schedules under load.

## Tests

`node --test .github/release-status/update-status.test.js` runs [`update-status.test.js`](update-status.test.js) (Node 18 or later, no dependencies).
