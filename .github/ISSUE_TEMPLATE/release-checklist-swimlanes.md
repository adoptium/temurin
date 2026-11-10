---
name: Release Checklist - Swimlanes (For deployment by Release Champions only)
about: Streamlined release checklist organized by swimlanes and automation level
title: Checklist for Temurin Release <Month> <Year>
labels: ''
assignees: ''

---

> **NOTE:** Replace placeholder values (e.g., `<Month>`, `<Year>`, `TEMPLATE_UPDATEME`) when creating this issue, then remove this notice.

This release checklist coordinates all activities across the Adoptium release lifecycle, based on [RELEASING.md](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md) and the [Adoptium Release Process](https://github.com/adoptium/adoptium/wiki/Adoptium-Release-Process).

<details>
<summary><b>Release Types</b></summary>

| Type | Description |
| :--- | :--- |
| **Feature** | A new JDK version is released. All checklist items apply. |
| **CPU** | Quarterly Critical Patch Update. All checklist items apply. |
| **CSPU** | Critical Security Patch Update (between CPU cycles). Items marked ⚠️ **CSPU: Optional** may be skipped at the Release Champion's discretion. |

</details>

### Release Information

| Field | Value |
| :--- | :--- |
| **Target Release Date** | `YYYY-MM-DD` |
| **Release Champion** | @username |
| **Compliance Release Lead (CRL)** | @username |
| **Compliance Release Checklist** | [Link to Compliance Checklist](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Release Status Issue** | [Link to Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Retrospective Issue** | [Link to Retrospective Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Planned Absences** | |

---

<details>
<summary><b>Swimlane & Automation Guide</b></summary>

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

</details>

---

## 1. Pre-Release Preparation (T-2 Weeks to T-1 Day)

### 📢 Communications & Program
- [ ] 👤 **Name Release Leads:** Confirm **Release Champion** and **Compliance Release Lead (CRL)** and update the Release Information section of this checklist.
- [ ] 👤 **Identify Release Versions:** Confirm expected GA versions from [java.com/releases](https://www.java.com/releases/).
- [ ] ⚙️ **Create Tracking Issues:** Run the [Create Release Tracking Issues](https://github.com/adoptium/temurin/actions/workflows/create-release-tracking-issues.yml) workflow to generate a `Release Status Issue`, `Public Retrospective Issue`, and `Compliance Release Checklist` in `adoptium/temurin`.
- [ ] 👤 **Update Slack:** Post bookmark links to tracking issues in the `#release` channel.
- [ ] 👤 **Branching Notification:** Post [branching announcement](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#branching-message-for-build-related-repositories) to `#build` and `#release`.

### 🏗️ JDK Production
- [ ] ⚙️ **Create Build Release Branches:** Create `vYYYY.MM.NN` branches on [temurin-build](https://github.com/adoptium/temurin-build), [ci-jenkins-pipelines](https://github.com/adoptium/ci-jenkins-pipelines), [jenkins-helper](https://github.com/adoptium/jenkins-helper), and [installer](https://github.com/adoptium/installer).
- [ ] ⚙️ **Update Configurations:**
  - [ ] Update [releaseVersions](https://github.com/adoptium/ci-jenkins-pipelines/blob/master/pipelines/build/regeneration/release_pipeline_generator.groovy#L10) with upcoming release versions.
  - [ ] Update [releasePlan.cfg](https://github.com/adoptium/mirror-scripts/blob/master/releasePlan.cfg) with expected tags.
- [ ] ⚙️ **Regenerate Release Pipelines:** Run [release-pipeline-generator](https://ci.adoptopenjdk.net/job/build-scripts/job/utils/job/release-pipeline-generator) using the release tags and latest stable `aqa-tests` release reference.
- [ ] 🤖 **Verify Marketplace Updater:** Confirm [temurin-updater workflow](https://github.com/adoptium/marketplace-data/actions/workflows/temurin-updater.yml) is active and not suspended.

### 🧪 Test & Compliance
- [ ] 👤 **AQA Release Branch:** Ensure [aqa-tests release branch](https://github.com/adoptium/aqa-tests/branches) matches the latest `aqa-tests` release.
- [ ] ⚙️ **Dry-Run Build & Tests:** ⚠️ **CSPU: Optional**
  - [ ] Set `testenv.properties` to `-dryrun-ga` branches and run dry-run builds/tests ([guide](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#dry-run-tests-do-this-at-least-1-week-before-release-in-the-same-calendar-month)).
  - [ ] Triage dry-run AQA results (CRL triages dry-run TCK results).
  - [ ] Restore `testenv.properties` to `-ga` tags once dry-run completes.
- [ ] 👤 **CRL Test Node Preparation:** Confirm CRL has completed node preparation on [ci.role.test nodes](https://ci.eclipse.org/temurin-compliance/label/ci.role.test/).
- [ ] 👤 **Infrastructure Health Check:** Review [Nagios](https://nagios.adoptopenjdk.net/nagios/) services for critical infrastructure issues.

---

## 2. Release Day & Execution

### 🏗️ JDK Production
- [ ] 👤 **Verify Upstream Tags:** Confirm OpenJDK GA tags (`-ga`) are tagged upstream.
- [ ] 🤖 **Verify Source Mirrors:** Confirm [Git Mirrors](https://ci.adoptopenjdk.net/view/git-mirrors/job/git-mirrors/job/adoptium/) synced the GA tags.
- [ ] 🤖 **Verify / Launch Build Pipelines:** Check auto-trigger pipelines or launch manually via [Jenkins build-scripts](https://ci.adoptopenjdk.net/job/build-scripts/):
  - [ ] Check primary pipelines triggered for all active release versions.
  - [ ] Trigger secondary pipelines (e.g. Win32, specialty platforms) as resources allow.
  - [ ] Check / trigger `jdk8u-aarch32` build from [aarch32 mirror](https://ci.adoptium.net/view/git-mirrors/job/git-mirrors/job/adoptium/job/git-skara-aarch32-jdk8u/).
- [ ] ⚙️ **Publish JDK/JRE Binaries:** Once AQAvit and TCK testing is complete and PMC approval is obtained, execute per-platform publishing by clicking on the convenience links in the Jenkins pipeline  that prepopulates the [release tool](https://ci.adoptium.net/job/build-scripts/job/release/job/refactor_openjdk_release_tool/) with the correct parameters to publish.

### 🧪 Test & Compliance
- [ ] ⚙️ **AQA Test Triage:**
  - [ ] Create triage issues in `adoptium/aqa-tests` for each version using the [Create Release Issues](https://github.com/adoptium/aqa-tests/actions/workflows/create-release-issues.yml) workflow.  Triagers assign triage issues to themselves, and close them once they confirm that both AQAvit and TCK tests complete successfully.
  - [ ] Triagers use remote results reporting in Jenkins AQA_Test_Pipeline_JCK and/or work with **CRL** to confirm TCK runs complete successfully.

### 📦 Installers & Package Managers
- [ ] 🤖 **Windows & macOS Installers:** Verify MSI and PKG generation and signing completed as part of pipeline and update the Release Status Issue.
- [ ] 🤖 **macOS Notarization:** Verify macOS installer notarization succeeded.
- [ ] 🤖 **Linux Package Repositories:** Verify RPM and DEB installer jobs triggered and published by the [create_installer_linux](https://ci.adoptium.net/job/build-scripts/job/release/job/create_installer_linux/) job.
- [ ] 🤖 **Homebrew Casks:** Verify macOS Homebrew cask updates are triggered/submitted.

### 🐳 Container Images
- [ ] ⚙️ **Build Container Images:** Monitor / trigger container builds in [containers repository](https://github.com/adoptium/containers).
- [ ] 🤖 **Container Smoke Tests:** Verify docker test runs succeed.
- [ ] ⚙️ **Publish Images:**
  - [ ] Push images to Eclipse Temurin Docker Hub.
  - [ ] Submit Official Docker Library PR for updated tags.

### 📢 Communications & Program
- [ ] 🤖 **Website Release Banner:** Verify release banner is live on adoptium.net; manually publish if automation did not trigger it.
- [ ] 👤 **Track Progress:** Regularly update the [Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME).
- [ ] ⚙️ **Generate & Publish Release Notes:**
  - [ ] Run [create_release_notes](https://ci.adoptium.net/job/build-scripts/job/release/job/create_release_notes/) per JDK version.
  - [ ] Publish via the convenience link from the create_release_notes job that pre-populates the correct parameters in the [release tool](https://ci.adoptium.net/job/build-scripts/job/release/job/refactor_openjdk_release_tool/).
  - [ ] Verify release notes are live on adoptium.net.

---

## 3. Post-Release Wrap-up & Completion

- [ ] ⚙️ **Update Support Matrix:** Update [support table](https://github.com/adoptium/adoptium.net/blob/main/content/asciidoc-pages/support/_partials/support-table.adoc) and supported platforms documentation.
- [ ] 👤 **Release Blog Post:** Publish the release blog post PR on adoptium.net.
- [ ] 👤 **Public Announcements:** Announce release availability on Slack `#release`, social media, and community channels.
- [ ] 🤖 **Run SBOM & Validation Job:** Execute [download_and_sbom_validation](https://ci.adoptium.net/job/build-scripts/job/release/job/download_and_sbom_validation) to verify downloads, signatures, and SBOM metadata.
- [ ] 👤 **Archive Test Evidence:**
  - [ ] Archive and publish all AQA test results.
- [ ] 👤 **Prep Next Cycle:**
  - [ ] Open a GitHub issue in `adoptium.net` for next cycle's blog post / vulnerability advisory tracking.
