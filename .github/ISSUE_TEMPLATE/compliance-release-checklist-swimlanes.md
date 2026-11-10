---
name: Compliance Release Checklist - Swimlanes (For deployment by Compliance Release Leads only)
about: Streamlined Temurin Compliance (TCK) release checklist organized by swimlanes and automation level
title: Compliance Checklist for Temurin Release <Month> <Year>
labels: ''
assignees: ''

---

> **NOTE:** Replace placeholder values (e.g., `<Month>`, `<Year>`, `TEMPLATE_UPDATEME`) when creating this issue, then remove this notice.

This checklist coordinates all Temurin Compliance (TCK) activities across the Adoptium release lifecycle, based on [RELEASING.md](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md) and the [Adoptium Release Process](https://github.com/adoptium/adoptium/wiki/Adoptium-Release-Process).

<details>
<summary><b>Release Types</b></summary>

| Type | Description |
| :--- | :--- |
| **Feature** | A new JDK version is released. All checklist items apply. |
| **CPU** | Quarterly Critical Patch Update. All checklist items apply. |
| **CSPU** | Critical Security Patch Update (between CPU cycles). Items marked ⚠️ **CSPU: Optional** may be skipped at the Compliance Release Lead's discretion. |

</details>

### Release Information

| Field | Value |
| :--- | :--- |
| **Target Release Date** | `YYYY-MM-DD` |
| **Compliance Release Lead (CRL)** | @username |
| **Release Champion** | @username |
| **Main Release Checklist** | [Link to Main Release Checklist](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Release Status Issue** | [Link to Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME) |
| **Compliance Retrospective Issue** | [Link to Private Retrospective Issue](https://github.com/adoptium/temurin-compliance/issues/TEMPLATE_UPDATEME) |
| **Planned Absences** | |

---

<details>
<summary><b>Swimlane & Automation Guide</b></summary>

Activities are categorized by the release swimlanes and tagged with automation levels:

* 🧪 **Test & Compliance**: Test node maintenance, JCK/TCK test execution, triage, automanual testing, evidence preservation, and sign-offs.
* 📢 **Communications**: Retrospectives, tester coordination, Slack updates, and compliance status reporting.

**Automation Legend:**
* 🤖 **[Automated]** — System triggers/runs automatically; human monitors or verifies completion.
* ⚙️ **[Partially Automated]** — Tool/script assisted; human triggers or provides parameters.
* 👤 **[Manual]** — Human action or cross-team coordination required.

</details>

---

## 1. Pre-Release Preparation (T-2 Weeks to T-1 Day)

### 📢 Communications
- [ ] 👤 **Confirm CRL Lead:** Confirm **Compliance Release Lead (CRL)** and backup availability.
- [ ] 👤 **Create Compliance Retrospective Issue:** Create private retrospective issue for Temurin Compliance.
- [ ] 👤 **Helpdesk Ticket with EF:** Log a helpdesk ticket with Eclipse Foundation (EF) to get all test materials updated and prepare for any manual activities.

### 🧪 Test & Compliance
- [ ] ⚙️ **CRL Test Node Preparation:** Run maintenance on [ci.role.test nodes](https://ci.eclipse.org/temurin-compliance/label/ci.role.test/) (complete steps in order, ensuring jobs finish before proceeding):
  - [ ] Ensure ALL `ci.role.test` nodes are online ([Nodes list](https://ci.eclipse.org/temurin-compliance/label/ci.role.test/)).
  - [ ] Run [ProcessCheckMultiNode](https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test) to clear lingering test processes.
  - [ ] Run [DeleteJCKMultiNode](https://ci.eclipse.org/temurin-compliance/job/DeleteJCKMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test) to remove redundant JCK versions.
  - [ ] Run [DeleteNonJenkinsTestFiles](https://ci.eclipse.org/temurin-compliance/job/DeleteNonJenkinsTestFiles/parambuild/?delay=0sec&LABEL=ci.role.test) & [DeleteWorkspaces](https://ci.eclipse.org/temurin-compliance/job/DeleteWorkspaces/parambuild/?LABEL=ci.role.test) to remove old test workspaces and clean up lingering Jenkins job materials.
  - [ ] Run [Gather_Host_Info](https://ci.eclipse.org/temurin-compliance/job/Gather_Host_Info/parambuild/?delay=0sec&LABEL=ci.role.test%26%26!sw.os.sunos) to ensure adequate disk space and inodes.
  - [ ] Run [Setup_JCK_Run_Multinode](https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/parambuild/?delay=0sec&LABEL=ci.role.test&CLEAN_DIR=true) with `CLEAN_DIR=true` to update `jck_run` folders and `temurin.jtx` exclude files.
- [ ] ⚙️ **Dry-Run TCK Execution & Triage:** ⚠️ **CSPU: Optional**
  - [ ] Triage dry-run/candidate TCK job results.
  - [ ] (Optional based on perceived risk with machine updates) Perform TCK Auto-manuals on one platform.

---

## 2. Release Day & Execution

### 📢 Communications
- [ ] 👤 **TCK Tester Slack Reminders:** Remind TCK testers (via Slack comment) to update TCK triage issue with ownership and machine IP before running interactive/automanual tests.
- [ ] 👤 **Compliance Status Updates:** Provide regular status updates in the `#release` channel and on the [Release Status Issue](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME).

### 🧪 Test & Compliance
- [ ] ⚙️ **Pre-Execution Check & Environment Lock:**
  - [ ] Check all `ci.role.test` nodes are online ([Nodes list](https://ci.eclipse.org/temurin-compliance/label/ci.role.test/)).
  - [ ] Run [ProcessCheckMultiNode](https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/) with default parameters.
  - [ ] Run [Setup_JCK_Run_Multinode](https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/) with `CLEAN_DIR=true`.
  - [ ] Disable [Setup_JCK_Run_Multinode](https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/) during release runs to preserve test evidence.
- [ ] ⚙️ **TCK Test Execution & Triage:**
  - [ ] Execute and triage TCK test suites across all platforms/versions/binary types.
  - [ ] Coordinate execution of required interactive / automanual tests.
  - [ ] Confirm all TCK failures are triaged and no blocking issues remain.
  - [ ] Work with Release Champion and confirm Temurin Compliance (TCK) sign-off per platform/version/binary type as needed.
  - [ ] Notify Release Champion that TCK approval is granted for binary publishing.

---

## 3. Post-Release Wrap-up & Completion

### 🧪 Test & Compliance
- [ ] 👤 **Archive TCK Evidence:** Archive and upload all TCK evidence.
- [ ] 👤 **Backup Release Artifacts:** Run [EclipseMirror](https://ci.eclipse.org/temurin-compliance/) job in Temurin Compliance Jenkins to back up release artifacts.

### 📢 Communications
- [ ] 👤 **Compliance Retrospective:** Complete private retrospective review for Temurin Compliance and close compliance tracking issues.
