---
name: Release Checklist - Swimlanes (For deployment by Release Champions only)
about: Streamlined release checklist organized by swimlanes and automation level
title: Checklist for Temurin Release <Month> <Year>
labels: ''
assignees: ''

---

> **NOTE:** Replace placeholder values (e.g., `<Month>`, `<Year>`, `TEMPLATE_UPDATEME`) when creating this issue, then remove this notice.

This release checklist coordinates all activities across the Adoptium release lifecycle, based on [RELEASING.md](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md) and the [Adoptium Release Process](https://github.com/adoptium/adoptium/wiki/Adoptium-Release-Process).

### Release Types

| Type | Description |
| :--- | :--- |
| **Feature** | A new JDK version is released. All checklist items apply. |
| **CPU** | Quarterly Critical Patch Update. All checklist items apply. |
| **CSPU** | Critical Security Patch Update (between CPU cycles). Items marked ⚠️ **CSPU: Optional** may be skipped at the Release Champion's discretion. |

### Release Information

| Field | Value |
| :--- | :--- |
| **Target Release Date** | `YYYY-MM-DD` |
| **Release Champion** | @username |
| **Compliance Release Lead (CRL)** | @username |
| **Release Status Issue** | [Link to Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Retrospective Issue** | [Link to Retrospective Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Planned Absences** | |

---

### Swimlane & Automation Guide

Activities are categorized by the **5 release swimlanes** and tagged with automation levels:

* 🏗️ **JDK Production**: Source mirroring, build pipelines, binary signing, artifact generation, and publishing.
* 🧪 **Test & Compliance**: AQA test execution & triage, Temurin Compliance (TCK), and test node maintenance.
* 📦 **Installers**: Native OS installers (Linux packages, Windows MSI, macOS PKG & notarization, Homebrew).
* 🐳 **Container Images**: Official Docker Hub and Eclipse Temurin container image builds, tests, and manifest updates.
* 📢 **Communications & Program**: Status tracking, website banners, release notes, documentation, announcements, and retrospectives.

**Automation Legend:**
* 🤖 **[Automated]** — System triggers/runs automatically; human monitors or verifies completion.
* ⚙️ **[Partially Automated]** — Tool/script assisted; human triggers or provides parameters.
* 👤 **[Manual]** — Human action or cross-team coordination required.

---

## 1. Pre-Release Preparation (T-2 Weeks to T-1 Day)

### 📢 Communications & Program
- [ ] 👤 **Name Release Leads:** Confirm **Release Champion** and **Compliance Release Lead (CRL)**.
- [ ] 👤 **Identify Release Versions:** Confirm expected GA versions from [java.com/releases](https://www.java.com/releases/).
- [ ] 👤 **Create Tracking Issues:**
  - [ ] [Create Release Status Issue](https://github.com/adoptium/temurin/issues/new?template=release-status.md) in `adoptium/temurin`.
  - [ ] [Create Public Retrospective Issue](https://github.com/adoptium/temurin/issues/new?template=retrospectives.md) in `adoptium/temurin`.
  - [ ] CRL: Create private retrospective issue for Temurin Compliance.
- [ ] 👤 **Update Slack:** Post bookmark links to tracking issues in the `#release` channel.

### 🏗️ JDK Production
- [ ] 👤 **Branching Notification:** Post [branching announcement](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#branching-message-for-build-related-repositories) to `#build` and `#release`.
- [ ] ⚙️ **Create Build Release Branches:** Create `vYYYY.MM.NN` branches on [temurin-build](https://github.com/adoptium/temurin-build), [ci-jenkins-pipelines](https://github.com/adoptium/ci-jenkins-pipelines), and [jenkins-helper](https://github.com/adoptium/jenkins-helper).
- [ ] ⚙️ **Update Configurations:**
  - [ ] Update [releaseVersions](https://github.com/adoptium/ci-jenkins-pipelines/blob/master/pipelines/build/regeneration/release_pipeline_generator.groovy#L10) with upcoming release versions.
  - [ ] Update [releasePlan.cfg](https://github.com/adoptium/mirror-scripts/blob/master/releasePlan.cfg) with expected tags.
- [ ] ⚙️ **Regenerate Release Pipelines:** Run [release-pipeline-generator](https://ci.adoptopenjdk.net/job/build-scripts/job/utils/job/release-pipeline-generator) using the release tags and latest stable `aqa-tests` release reference.
- [ ] 🤖 **Verify Marketplace Updater:** Confirm [temurin-updater workflow](https://github.com/adoptium/marketplace-data/actions/workflows/temurin-updater.yml) is active and not suspended.
- [ ] 👤 **Final Code Freeze Warning:** Post [code freeze warning](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#code-freeze-message) to Slack 24h prior to freeze. ⚠️ **CSPU: Optional**
- [ ] ⚙️ **Declare & Enable Code Freeze:** Announce lockdown and [enable code freeze bot](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#enable-code-freeze-on-the-build-repositories). ⚠️ **CSPU: Optional**

### 🧪 Test & Compliance
- [ ] 👤 **AQA Release Branch:** Ensure [aqa-tests release branch](https://github.com/adoptium/aqa-tests/branches) matches the latest `aqa-tests` release.
- [ ] ⚙️ **Dry-Run Build & Tests:** ⚠️ **CSPU: Optional**
  - [ ] Set `testenv.properties` to `-dryrun-ga` branches and run dry-run builds/tests ([guide](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#dry-run-tests-do-this-at-least-1-week-before-release-in-the-same-calendar-month)).
  - [ ] Triage dry-run TCK and AQA results.
  - [ ] Restore `testenv.properties` to `-ga` tags once dry-run completes.
- [ ] ⚙️ **CRL Test Node Preparation:** Run maintenance on [ci.role.test nodes](https://ci.eclipse.org/temurin-compliance/label/ci.role.test/):
  - [ ] Run [ProcessCheckMultiNode](https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test) to clear lingering test processes.
  - [ ] Run [DeleteJCKMultiNode](https://ci.eclipse.org/temurin-compliance/job/DeleteJCKMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test) to remove redundant JCK versions.
  - [ ] Run [DeleteNonJenkinsTestFiles](https://ci.eclipse.org/temurin-compliance/job/DeleteNonJenkinsTestFiles/parambuild/?delay=0sec&LABEL=ci.role.test) & [DeleteWorkspaces](https://ci.eclipse.org/temurin-compliance/job/DeleteWorkspaces/parambuild/?LABEL=ci.role.test).
  - [ ] Run [Gather_Host_Info](https://ci.eclipse.org/temurin-compliance/job/Gather_Host_Info/parambuild/?delay=0sec&LABEL=ci.role.test%26%26!sw.os.sunos) to ensure adequate disk space and inodes.
  - [ ] Run [Setup_JCK_Run_Multinode](https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/parambuild/?delay=0sec&LABEL=ci.role.test&CLEAN_DIR=true) with `CLEAN_DIR=true`.
- [ ] 👤 **Infrastructure Health Check:** Review [Nagios](https://nagios.adoptopenjdk.net/nagios/) services for critical infrastructure issues.

---

## 2. Release Day & Execution

### 📢 Communications & Program
- [ ] 🤖 **Website Release Banner:** Verify release banner is live on adoptium.net; manually publish if automation did not trigger it.
- [ ] 👤 **Tester Slack Reminders:** Remind TCK and AQA testers to assign ownership/IP before running automanual/interactive tests.
- [ ] 👤 **Track Progress:** Regularly update the [Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME).

### 🏗️ JDK Production
- [ ] 👤 **Verify Upstream Tags:** Confirm OpenJDK GA tags (`-ga`) are tagged upstream.
- [ ] 🤖 **Verify Source Mirrors:** Confirm [Git Mirrors](https://ci.adoptopenjdk.net/view/git-mirrors/job/git-mirrors/job/adoptium/) synced the GA tags.
- [ ] 🤖 **Verify / Launch Build Pipelines:** Check auto-trigger pipelines or launch manually via [Jenkins build-scripts](https://ci.adoptopenjdk.net/job/build-scripts/):
  - [ ] Check primary pipelines triggered for all active release versions.
  - [ ] Trigger secondary pipelines (e.g. Win32, specialty platforms) as resources allow.
  - [ ] Check / trigger `jdk8u-aarch32` build from [aarch32 mirror](https://ci.adoptium.net/view/git-mirrors/job/git-mirrors/job/adoptium/job/git-skara-aarch32-jdk8u/).
- [ ] ⚙️ **Publish JDK/JRE Binaries:** Once test/TCK approval is obtained, execute per-platform publishing using the [release tool](https://ci.adoptium.net/job/build-scripts/job/release/job/refactor_openjdk_release_tool/).

### 🧪 Test & Compliance
- [ ] ⚙️ **AQA Test Triage:**
  - [ ] Monitor pipelines in [TRSS](https://trss.adoptium.net/) and generate Release Summary Reports.
  - [ ] Create triage issues in `adoptium/aqa-tests` following [Triage Guidelines](https://github.com/adoptium/aqa-tests/blob/master/doc/Triage.md).
  - [ ] Confirm all failures are triaged and no blocking issues remain.
- [ ] ⚙️ **CRL Temurin Compliance (TCK):**
  - [ ] Disable `Setup_JCK_Run_Multinode` during release runs to preserve evidence.
  - [ ] Execute and triage TCK test suites across all platforms/binary types.
  - [ ] Confirm compliance completion and sign-off per platform.

### 📦 Installers & Package Managers
- [ ] 🤖 **Windows & macOS Installers:** Verify MSI and PKG generation and signing completed as part of pipeline.
- [ ] 🤖 **macOS Notarization:** Verify macOS installer notarization succeeded.
- [ ] 🤖 **Linux Package Repositories:** Verify RPM and DEB installer jobs triggered and published by the release tool.
- [ ] 🤖 **Homebrew Casks:** Verify macOS Homebrew cask updates are triggered/submitted.

### 🐳 Docker Images
- [ ] ⚙️ **Build Container Images:** Monitor / trigger container builds in [containers repository](https://github.com/adoptium/containers).
- [ ] 🤖 **Container Smoke Tests:** Verify docker test runs succeed.
- [ ] ⚙️ **Publish Images:**
  - [ ] Push images to Eclipse Temurin Docker Hub.
  - [ ] Submit Official Docker Library PR for updated tags.

### 📢 Publishing & Announcements
- [ ] ⚙️ **Generate & Publish Release Notes:**
  - [ ] Run [create_release_notes](https://ci.adoptium.net/job/build-scripts/job/release/job/create_release_notes/) per JDK version.
  - [ ] Publish via [release tool](https://ci.adoptium.net/job/build-scripts/job/release/job/refactor_openjdk_release_tool/) (set `UPSTREAM_JOB_NAME=create_release_notes`).
  - [ ] Verify release notes are live on adoptium.net.
- [ ] ⚙️ **Update Support Matrix:** Update [support table](https://github.com/adoptium/adoptium.net/blob/main/content/asciidoc-pages/support/_partials/support-table.adoc) and supported platforms documentation.
- [ ] 👤 **Release Blog Post:** Publish the release blog post PR on adoptium.net.
- [ ] 👤 **Public Announcements:** Announce release availability on Slack `#release`, social media, and community channels.

---

### Release Execution Summary

| Version | Release Pipeline | AQA / Triage Issue | Binaries Published | Installers Published | Docker Images Published |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **JDK 8 (LTS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk8-pipeline/) | | [ ] | [ ] | [ ] |
| **JDK 11 (LTS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk11-pipeline/) | | [ ] | [ ] | [ ] |
| **JDK 17 (LTS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk17-pipeline/) | | [ ] | [ ] | [ ] |
| **JDK 21 (LTS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk21-pipeline/) | | [ ] | [ ] | [ ] |
| **JDK 25 (LTS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk25-pipeline/) | | [ ] | [ ] | [ ] |
| **JDK xx (Feature/STS)** | [Pipeline](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdkxx-pipeline/) | | [ ] | [ ] | [ ] |

---

## 3. Post-Release Wrap-up & Completion

- [ ] ⚙️ **Lift Code Freeze:** Declare code freeze end in Slack and disable code freeze bot. ⚠️ **CSPU: Optional**
- [ ] 🤖 **Remove Website Banner:** Verify release banner has been removed from adoptium.net; manually remove if automation did not trigger it.
- [ ] 🤖 **Run SBOM & Validation Job:** Execute [download_and_sbom_validation](https://ci.adoptium.net/job/build-scripts/job/release/job/download_and_sbom_validation) to verify downloads, signatures, and SBOM metadata.
- [ ] 👤 **Archive Test Evidence:**
  - [ ] CRL: Archive and upload all TCK evidence.
  - [ ] Archive and publish all AQA test results.
  - [ ] CRL: Run `EclipseMirror` job in Temurin Compliance Jenkins to back up release artifacts.
- [ ] 👤 **Prep Next Cycle:**
  - [ ] Open notes issue in `adoptium.net` for next cycle's blog post / vulnerability advisory tracking.
  - [ ] Verify [Adoptium Calendar](https://calendar.google.com/calendar/u/0/embed?src=c_56d7263c0ceda87a1678f6144426f23fb53721480b5ff71b073afb51091e5492@group.calendar.google.com) is updated for the next release cycle.
- [ ] 👤 **Declare Release Complete:** Hold retrospective review, declare release complete in `#release`, and close tracking issues.
