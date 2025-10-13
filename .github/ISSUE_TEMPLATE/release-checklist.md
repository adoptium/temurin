---
name: Release Checklist
about: Issue template for release champion and team to track release progress
title: Checklist for Temurin Release <Month> <Year>
labels: ''
assignees: ''

---

**NOTE: Items marked `jdkxx` and `TEMPLATE_UPDATEME` should be replaced while deploying this issue template. It is recommended to delete this line once you've done so :-)**

This Temurin release checklist based on the [release doc](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md) captures what activities must happen during a release.

The target release date is: _________

The release champion for this release is: _________

The compliance release lead (CRL) for this release is: _________

Planned absences during the release cycle:

The release champion ensures that all release tasks listed below get completed (directly or by delegation).
Their final task is to confirm that all tasks below are completed to a high standard, and that the release can be declared complete.

Everyone involved in a release is asked to provide feedback via the retrospective for future improvement/automation.

-------

### Two Weeks Prior To Release

- [ ] **Release Champion named** whose responsibility is to ensure every item in this checklist gets completed
- [ ] **Compliance Release Lead named** whose responsibility is to ensure Temurin Compliance items marked with TC get completed
- [ ] **Release Checklist Created**  Create this issue to track the release and the preparation tasks.
- [ ] **Identify Expected Release Versions** - Find out the version numbers from [here](https://www.java.com/releases/)
- [ ] **Notify release branching of build repositories** : [Slack message, branching build repositories]
- [ ] **Create build repositories release Branches** : [Create build repository release branches]
- [ ] **Identify the aqa branch name for the upcoming release (Note, April and October PSU updates generally use same branch as the March/September new releases**
- [ ] **Check that the [temurin updater action] has not been suspended. If it has, re-enable it or set a reminder to run manually when ready.**

[Create build repository release branches]: https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#create-release-branch-on-below-repositories
[Slack message, branching build repositories]: https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#branching-message-for-build-related-repositories
[temurin updater action]: https://github.com/adoptium/marketplace-data/actions/workflows/temurin-updater.yml

### 1-1½ weeks prior to release

1½ weeks would typically mean running on the Friday so the dry-run(and potential "candidate" build) results are available on the Monday before release week.

CRL to ensure these TC steps are done (please complete steps in order, and ensure jobs have finished before proceeding to next step):
 - [ ] TC: Ensure ALL nodes are online. [Nodes list].
 - [ ] TC: Run [ProcessCheckMultiNode] to remove old test processes.
 - [ ] TC: Run [DeleteJCKMultiNode] to remove now-redundent jck versions.
 - [ ] TC: Run [DeleteNonJenkinsTestFiles] to remove any old test workspaces. Report any \"ERROR:\" to users for folder deletion.
 - [ ] TC: Run [Gather_Host_Info] to check all nodes have sufficient disk space and iNodes. If any nodes are found lacking, review and resolve.
 - [ ] TC: Run [Setup_JCK_Run_Multinode] to update jck_run folders and jtx exclude files.
 - [ ] TC: Run [DeleteWorkspaces] to clean up any lingering jenkins job materials.

[Nodes list]: https://ci.eclipse.org/temurin-compliance/label/ci.role.test/
[ProcessCheckMultiNode]: https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test
[DeleteJCKMultiNode]: https://ci.eclipse.org/temurin-compliance/job/DeleteJCKMultiNode/parambuild/?delay=0sec&LABEL=ci.role.test
[DeleteNonJenkinsTestFiles]: https://ci.eclipse.org/temurin-compliance/job/DeleteNonJenkinsTestFiles/parambuild/?delay=0sec&LABEL=ci.role.test
[Gather_Host_Info]: https://ci.eclipse.org/temurin-compliance/job/Gather_Host_Info/parambuild/?delay=0sec&LABEL=ci.role.test%26%26!sw.os.sunos
[Setup_JCK_Run_Multinode]: https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/parambuild/?delay=0sec&LABEL=ci.role.test&CLEAN_DIR=true
[DeleteWorkspaces]: https://ci.eclipse.org/temurin-compliance/job/DeleteWorkspaces/parambuild/?LABEL=ci.role.test

 - [ ] **Check the nagios server to ensure there are no critical infrastructure issues** 
	 Log in to the public [nagios](https://nagios.adoptopenjdk.net/nagios/) server, and check the Problems / Services page. If you do not have access, please request it via an issue in the infrastructure repository. If there are any issues, then please log an issue in the infrastructure repository.
 - [ ] **Regenerate The Release Build Pipeline Jobs In Jenkins**
 - [ ] **Update testenv.properties in the AQA release branch to use the -dryrun-ga branches** ([Sample PR](https://github.com/adoptium/aqa-tests/pull/5202/files))
 - [ ] **Prepare & Perform Dry Run/Candidate Build & Tests** : [Dry-run](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#dry-run-tests-do-this-at-least-1-week-before-release-in-the-same-calendar-month) 
 - [ ] TC: **Triage dry-run/candidate TCK job results**
 - [ ] **Restore aqa-tests release branch testenv.properties JDK_BRANCH values to the "-ga" tag after dry-run/candidate has completed**
 - [ ] TC: (Optional based on perceived risk with any machine updates) **Perform TCK Auto-manuals on one platform**

### Thursday or Friday prior to release

- [ ] **Final Code Freeze Warning** post a message to the build & release slack channels : [Slack message](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#code-freeze-message)

After 1 day, then :-

- [ ] **Declare code freeze** to ensure stability of build systems and infrastructure during release process : #build and #release slack message: "Code Freeze is now being enabled"

- [ ] **Enable code freeze bot** : [Enabling code freeze](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#enable-code-freeze-on-the-build-repositories)

- [ ] **Prepare For Release**
  - [ ] Ensure that there is an [aqa-tests branch](https://github.com/adoptium/aqa-tests/branches) that matches the name of the [latest aqa-tests release version](https://github.com/adoptium/aqa-tests/releases/latest).
  - [ ] Update [releaseVersions](https://github.com/adoptium/ci-jenkins-pipelines/blob/master/pipelines/build/regeneration/release_pipeline_generator.groovy#L10) with release versions.
  - [ ] Update [releasePlan.cfg](https://github.com/adoptium/mirror-scripts/blob/master/releasePlan.cfg) with expected tags, for more detail see [here](https://github.com/adoptium/mirror-scripts/tree/master#skara-repos-and-processes).
  - [ ] Generate release pipeline jobs with [release-pipeline-generator](https://ci.adoptopenjdk.net/job/build-scripts/job/utils/job/release-pipeline-generator).
    - DO NOT use default job parameter values. aqaReference should be the [latest aqa-tests release version](https://github.com/adoptium/aqa-tests/releases/latest).

**Wait For All Of The Above To Complete Successfully Before Proceeding!**

- [ ] TC: Log a helpdesk ticket with EF, to get all test materials updated and prepare for any manual activities
- [ ] TC: Run the ProcessCheckMultiNode process cleaning job on all ci.role.test nodes, to ensure healthy state, verify all nodes successful: https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/build?delay=0sec
- [ ] TC: Run the Setup_JCK_Run_Multinode job with CLEAN_DIR=true (to purge any old release contents/results) on all ci.role.test nodes, this will extract the jck_run folder with all the temurin.jtx exclude files, verify all nodes successful : https://ci.eclipse.org/temurin-compliance/job/Setup_JCK_Run_Multinode/build?delay=0sec
- [ ] Check the nagios server to ensure there are no critical infrastructure issues

-------

Release Week Checklist:

- [ ] TC: Check All Nodes Online https://ci.eclipse.org/temurin-compliance/label/ci.role.test/
- [ ] TC: Run [ProcessCheckMultiNode](https://ci.eclipse.org/temurin-compliance/job/ProcessCheckMultiNode/) with default parameters.
- [ ] TC: Run Setup_JCK_Run_Multinode with CLEAN_DIR=true for (ci.role.test).
- [ ] TC: Disable Setup_JCK_Run_Multinode preserve test evidence.
- [ ] As detailed earlier, again check the nagios server to ensure there are no critical infrastructure issues.
- [ ] [Create the Github Issues for tracking progress](https://github.com/adoptium/temurin/issues/new?assignees=&labels=&projects=&template=release-status.md&title=%3Cmonth%3E+%3Cyear%3E+Release+Status+per+Platform%2C+Version+%26+Binary+Type) in the adoptium/temurin repo
- [ ] Create the Github issues for the [Adoptium public retro](https://github.com/adoptium/temurin/issues/new?assignees=&labels=Retrospective&projects=&template=retrospectives.md&title=General+Retrospective+for+%3Cmonth%3E+%3Cyear%3E+Releases) in the adoptium/temurin repo
- [ ] TC: Create the retrospective issue for the Temurin Compliance project.
- [ ] Update the links on the slack channel for the release status and retrospective issues.
- [ ] Remove x32Windows from release-openjdk{8,11,17}-pipeline (they will be manually triggered later as secondary pipelines).
- [ ] Check for any last minute cacerts updates and cherry-pick to temurin-build release branch if needed.

#### Release Day Onwards

- [ ] **Check Tags have been released upstream** - Look for mailing list announcements and `-ga` tags in version control.
- [ ] **Check Tags have been Mirrored** [Mirrors](https://ci.adoptopenjdk.net/view/git-mirrors/job/git-mirrors/job/adoptium/).
- [ ] **Check "auto-trigger" pipelines or Launch build pipelines** for each version being released. Verify if the release pipeline "auto-triggered", if not (maybe expected tag was wrong), then manually launch [(as per release doc](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#steps-for-every-version)) once release tags are available via [launch page](https://ci.adoptopenjdk.net/job/build-scripts/job/openjdk8-pipeline/build) in Jenkins.  Provide links in this issue to each version's pipeline build(s). There may be multiple pipelines per version if primary and secondary platforms are separated to expedite the release.  In some cases,  where there are unforeseen configuration or infrastructure issues, reruns may be needed.
  - LTS jdk8 pipeline(s):
    - **primary jdk8 pipeline:**
      - rerun(s):
    - **secondary jdk8 pipeline (inc. Win32):**
      - reruns(s):
    - **aarch32-jdk8u pipeline:**
      - reruns(s):
  - LTS jdk11 pipeline(s):
    - **primary jdk11 pipeline:**
      - rerun(s):
    - **secondary jdk11 pipeline (inc. Win32):**
      - rerun(s):
  - LTS jdk17 pipeline(s):
    - **primary jdk17 pipeline:**
      - rerun(s):
    - **secondary jdk17 pipeline (inc. Win32):**
      - rerun(s):
  - LTS jdk21 pipeline(s):
    - **primary jdk21 pipeline:**
      - rerun(s):
    - **secondary jdk21 pipeline:**
      - rerun(s):
  - LTS jdk25 pipeline(s):
    - **primary jdk25 pipeline:**
      - rerun(s):
    - **secondary jdk25 pipeline:**
      - rerun(s):
  - STS jdkxx pipeline(s):
    - **primary jdkxx pipeline:**
      - rerun(s):
    - **secondary jdkxx pipeline:**
      - rerun(s):
- [ ] **Check Upstream Tags, Mirror Tags & Trigger Builds For JDK8 AARCH32** This specific version is built from a separate mirror repository and has a separate build process; this is CURRENTLY not part of the automation which is handled for the other platforms and version. Also note that there is a separate properties file (testenv_arm32.properties) which needs to be updated.
- [ ] **Add links to the [status doc](https://github.com/adoptium/temurin/issues/TEMPLATE_UPDATEME)** to indicate that the per-platform builds are ready.
- [ ] **Add website banner.**
  - [ ] Make a PR.
  - [ ] Check it was automatically published to the website.
  - [ ] Announce that we target releases to be available within:
    - New release: 48 hours (primaries) or 7 days (secondaries) of the new TCK material being made available to us.
    - Update release: 48-72 hours of the GA tags being available.
- [ ] TC: **Remind** TCK testers (via Slack comment) to update a TCK triage issue with ownership and machine IP **before** running any interactive/automanual tests.
- [ ] **Monitor and assist** the team during test triage (process outlined below)
  - **Summarise test results**.  Find each launched build pipeline in [TRSS](https://trss.adoptium.net/) to view a summary of test results.
  - **Use the Release Summary Report feature** in TRSS to generate a summary of failures, history and possible issues in markup format.
  - **Add the Test Summary** to a new aqa-tests issue, if one does not already exist.
  - **Triage** each build and test failure in the release summary report (following the [Triage guidelines](https://github.com/adoptium/aqa-tests/blob/master/doc/Triage.md)) and label them as blocking or non-blocking.
  - **Fix** blocking failures if they exist and confirm others are non-blocking.
- [ ] **Supply links to triage issues** for each version being released.
  - LTS jdk8 triage summary: 
  - LTS jdk11 triage summary: 
  - LTS jdk17 triage summary: 
  - LTS jdk21 triage summary: 
  - LTS jdk25 triage summary: 
  - STS jdkXX triage summary: 
- [ ] TC: **Confirm Temurin-compliance items completed**, per platform/version/binaryType.
- [ ] **Help team follow the per-platform publishing process.** See "Publish build results" [here](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#at-ga-time) for details.
- [ ] **Generate The Release Notes Per JDK Version** using [create_release_notes](https://ci.adoptium.net/job/build-scripts/job/release/job/create_release_notes/)
- [ ] **Publish the release notes** via the [release tool](https://ci.adoptium.net/job/build-scripts/job/release/job/refactor_openjdk_release_tool/). Set UPSTREAM_JOB_NAME to \"create_release_notes\", and set JOB_NUMBER to the create_release_notes job number.
- [ ] **Verify that the release notes are live**
  - This may require a full update on the API. See [here](https://github.com/adoptium/adoptium.net-redesign/issues/1107) for details. 
- [ ] **Publish updates to the container images to dockerhub.**
- [ ] **Check that the homebrew casks for macos have been automatically updated.** Details [here](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#at-ga-time) (Section \"4.1. \[Mac only\]\").
- [ ] **Update support page.** (_automate_* github workflow to create a PR to update the versions and dates on the [support table](https://github.com/adoptium/adoptium.net/blob/main/content/asciidoc-pages/support/_partials/support-table.adoc))
- [ ] **Update supported platforms tables** if they have changed in this release. Details [here](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md), search for \"supported platforms table\".
- [ ] **Check the Linux installer publishing jobs have worked** This will be triggered automatically by the release tool job, but its status should be checked.
- [ ] **Post the Release Blog** via PR. [Past Example](https://github.com/adoptium/adoptium.net/pull/382).
- [ ] **Publicise the release** via Slack #release channel and Twitter. See step 7 [here][publish] for details. (_automate_* - can be partially automated).
[publish]: https://github.com/adoptium/temurin-build/blob/master/RELEASING.md#at-ga-time
- [ ] **Declare code freeze end;** opening up the code for further development.
- [ ] **Disable code freeze bot.**
- [ ] **Remove website banner.** (_automate_* via github workflow in website repository)
- [ ] **Check for the presence of the jdk8u aarch32 GA tag and mirror it.** [Upstream Git repo.](https://github.com/openjdk/aarch32-port-jdk8u) - [Mirror job](https://ci.adoptium.net/view/git-mirrors/job/git-mirrors/job/adoptium/job/git-skara-aarch32-jdk8u/)
- [ ] **Do all of the above for the jdk8u/aarch32 build (make sure you specify the overridePublishName parameter).**
- [ ] TC: **Archive/upload all TCK results.**
- [ ] **Archive/upload all AQA results** Search for `Publish AQA test results` in [RELEASING.md](https://github.com/adoptium/temurin-build/blob/master/RELEASING.md) for the process.
- [ ] TC: **Use EclipseMirror job in the Temurin Compliance jenkins to store a backup** of the release artifacts.
- [ ] **Run [download_and_sbom_validation job]** to verify the downloads, signatures and SBOM contents.
[download_and_sbom_validation job]: https://ci.adoptium.net/job/build-scripts/job/release/job/download_and_sbom_validation
- [ ] **Create an issue to capture notes for the next release blog** in the [adoptium.net](https://github.com/adoptium/adoptium.net/issues) repository and ensure to delegate the task of finalising and publishing a PR for this release's blog post. (Use [this link](https://openjdk.org/groups/vulnerability/advisories) to get the vulnerability list).
- [ ] **Ensure the [adoptium calendar](https://calendar.google.com/calendar/u/0/embed?src=c_56d7263c0ceda87a1678f6144426f23fb53721480b5ff71b073afb51091e5492@group.calendar.google.com) is updated for the next cycle at a minimum**
- [ ] **Declare the release complete** and close this issue.
