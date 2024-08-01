---
name: Release Status
about: Issue template for the status document that we direct our customers to during a release cycle
title: <month> <year> Release Status per Platform, Version & Binary Type
labels: ''
assignees: ''

---

Sharing information in this issue since the TCK work is being tracked in temurin-compliance private repo not visible to the community (as per the OCTLA).  Risks and expectations for timing on the release are listed in this [issue comment](https://github.com/adoptium/adoptium/issues/3#issuecomment-866903922).  Primary platforms (x64 Linux/Windows/OSX and aarch64 Linux/OSX) in **bold** are prioritized, secondary platforms not in bold follow in no particular order (as machine resources are available).  We retrospectively measure and track how well we do against these targets in these [Adoptium Release Scorecards](https://github.com/adoptium/adoptium/wiki/Adoptium-Release-Scorecards) in order to continuously assess and improve.

:heavy_check_mark: results in these Tables means the activity has successfully completed.

:hourglass_flowing_sand: results means that we are actively working on closing off the runs needed for this version, platform, binaryType.

 :no_entry: means there is no build planned for that version/platform combination.

 :pause_button: means activity not yet started.

### JDK8uXXX-bXX
| Platform  | jdk8 AQA  | jdk8 TCK  | jdk8 published | jdk8 installers  | jdk8 images   | Notes |
| -----     | -----     | -----     | -----          | -----            | -----         | ----- |
| **x64 Linux**     | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Windows**   | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Mac**       | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| **aarch64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppcle64 Linux     | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppc64 AIX         | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| x32 Windows       | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :pause_button: |       |
| arm32 Linux       | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| x64 alpine-Linux  | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
| sparcv9 solaris   | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| x86 solaris       | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |

### JDK11.0.XX+Y
| Platform | jdk11 AQA | jdk11 TCK  | jdk11 published| jdk11 installers | jdk11 images  | Notes |
| -----    | -----     | -----      | -----          | -----            | -----         | ----- |
| **x64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Windows** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| **aarch64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **aarch64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| ppcle64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| s390x Linux   | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppc64 AIX | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| x32 Windows | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| arm32 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| x64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |

### JDK17.0.XX+Y
| Platforms | jdk17 AQA | jdk17 TCK | jdk17 published| jdk17 installers | jdk17 images | Notes |
| -----     | -----     | -----     | -----          | -----            | -----        | ----- |
| **x64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Windows** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| **aarch64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **aarch64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| ppcle64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| s390x Linux   | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppc64 AIX | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| x32 Windows | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| arm32 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| x64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |

### JDK21.0.X+Y
| Platform  | jdk21 AQA | jdk21 TCK | jdk21 published| jdk21 installers | jdk21 images  | Notes |
| -----     | -----     | -----     | -----          | -----            | -----         | ----- |
| **x64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Windows** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| **aarch64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **aarch64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| ppcle64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| s390x Linux   | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppc64 AIX | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| aarch64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
| x64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
| riscv64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |

### JDK23.0.X+Y
| Platform  | jdk23 AQA | jdk23 TCK | jdk23 published| jdk23 installers | jdk23 images  | Notes |
| -----     | -----     | -----     | -----          | -----            | -----         | ----- |
| **x64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Windows** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **x64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| **aarch64 Linux** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| **aarch64 Mac** | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :no_entry: |       |
| ppcle64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| s390x Linux   | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: |       |
| ppc64 AIX | :pause_button: | :pause_button: | :pause_button: | :no_entry: | :no_entry: |       |
| aarch64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
| x64 alpine-Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
| riscv64 Linux | :pause_button: | :pause_button: | :pause_button: | :pause_button: | :pause_button: | This will be a headless build |
