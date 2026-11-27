// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Regenerates the per-version status tables in the release status issue
// (see .github/ISSUE_TEMPLATE/release-status.md) from status.csv.
//
// AQAstatus and TCKstatus are additionally derived from the triage issues in
// the aqa-tests repository ("Triage Automated Tests for <Month> <Year> JDK<N> - <platform>").
// Each column is derived on its own from the issue's checklist
// ("Triage AQAvit tests" -> AQAstatus, "Triage TCK automated tests" -> TCKstatus):
//   - issue closed as "not planned"             -> NotPlanned
//   - issue closed any other way, or the column's box ticked -> Completed
//   - otherwise, issue has comments, was reopened, or another box is ticked -> InProgress
//   - otherwise nothing is derived and the status.csv value is used
// A derived value replaces the status.csv value (so a reopened issue drops back to InProgress),
// except that NotPlanned is never overridden. status.csv itself is not modified.
//
// Release tags: the CSV Version column only needs to start with the JDK feature number (e.g. "jdk-21.0.X+Y").
// The cycle's tags come from mirror-scripts releasePlan.cfg (e.g. jdk21uGA="jdk-21.0.13.1-ga") and are
// resolved to the full release name (e.g. "jdk-21.0.13.1+2") via the Adoptium API once that is available.
//
// publishStatus is derived from the Adoptium API (https://api.adoptium.net/v3/assets/release_name/eclipse/<tag>):
// a row is Completed when the release tag has a published "jdk" binary for the row's architecture/os.
// Nothing may be published until AQAstatus and TCKstatus are both Completed, so publishStatus is only
// derived once they are; a publication seen earlier is reported as a warning and not shown.
//
// installerStatus and imagesStatus are derived only for rows that are published:
//   - installerStatus: mac/windows from the "installer" in the Adoptium API binary; linux when the deb and rpm
//     packages exist, alpine-linux when the apk exists (packages.adoptium.net Artifactory).
//   - imagesStatus: the eclipse-temurin tags on Docker Hub include the platform (linux, alpine or windows).
// These only ever set Completed, and NotPlanned is never overridden.

const fs = require('fs');
const path = require('path');

const STATUS_EMOJI = {
  completed: ':heavy_check_mark:',
  inprogress: ':hourglass_flowing_sand:',
  notstarted: ':pause_button:',
  notplanned: ':no_entry:',
};

const REQUIRED_COLUMNS = [
  'Version', 'Platform', 'AQAstatus', 'TCKstatus',
  'publishStatus', 'installerStatus', 'imagesStatus', 'Notes',
];

// Primary platforms are shown in bold in the issue.
const PRIMARY_PLATFORMS = new Set([
  'x64_linux', 'x64_windows', 'x64_mac', 'aarch64_linux', 'aarch64_mac',
]);

const OS_DISPLAY = {
  linux: 'Linux',
  windows: 'Windows',
  mac: 'Mac',
  aix: 'AIX',
  'alpine-linux': 'alpine-Linux',
};

/** Parses CSV text (supports quoted fields, blank lines and '#' comment lines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }

  const records = rows
    .filter(r => !(r.length === 1 && r[0].trim() === '') && !r[0].trim().startsWith('#'));
  if (records.length === 0) throw new Error('status.csv is empty');

  const header = records[0].map(h => h.trim());
  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) throw new Error(`status.csv is missing column "${col}"`);
  }
  return records.slice(1).map((r, idx) => {
    const rec = {};
    header.forEach((h, i) => { rec[h] = (r[i] || '').trim(); });
    rec._line = idx + 2;
    return rec;
  });
}

/** Parses simple key=value properties text ('#' comments allowed). */
function parseProperties(text) {
  const props = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    props[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return props;
}

function featureOf(version) {
  const m = /^jdk-?(\d+)/i.exec(version);
  if (!m) throw new Error(`Cannot determine JDK feature version from "${version}" (expected e.g. JDK8)`);
  return m[1];
}

function platformDisplay(key) {
  const normalized = key.replace(/^x86-64/i, 'x64');
  const idx = normalized.indexOf('_');
  const arch = idx < 0 ? normalized : normalized.slice(0, idx);
  const os = idx < 0 ? '' : normalized.slice(idx + 1);
  const name = `${arch} ${OS_DISPLAY[os.toLowerCase()] || os}`.trim();
  return PRIMARY_PLATFORMS.has(normalized.toLowerCase()) ? `**${name}**` : name;
}

function emoji(value, rec, col) {
  const e = STATUS_EMOJI[value.toLowerCase()];
  if (!e) {
    throw new Error(
      `status.csv line ${rec._line}: invalid ${col} "${value}" ` +
      `(expected one of Completed, InProgress, NotStarted, NotPlanned)`);
  }
  return e;
}

const TRIAGE_TITLE_PREFIX = 'Triage Automated Tests for';

/** Normalizes platform names so CSV names and aqa-tests triage names compare equal. */
function normalizePlatform(name) {
  const idx = name.indexOf('_');
  let arch = (idx < 0 ? name : name.slice(0, idx)).toLowerCase();
  const os = (idx < 0 ? '' : name.slice(idx + 1)).toLowerCase();
  arch = ({ 'x86-64': 'x64', arm: 'arm32', ppc64le: 'ppcle64' })[arch] || arch;
  return `${arch}_${os}`;
}

/** Extracts "<Month> <Year>" from the start of the release status issue title. */
function releaseCycleOf(title) {
  const m = /^\s*([A-Za-z]+\s+\d{4})\b/.exec(title || '');
  return m ? m[1] : null;
}

/** Returns { feature, platform } for an aqa-tests triage issue, or null if it is not one. */
function parseTriageIssue(issue) {
  if (!(issue.title || '').startsWith(TRIAGE_TITLE_PREFIX)) return null;
  const body = issue.body || '';
  const v = /^\s*Version:\s*JDK-?(\d+)/im.exec(body);
  const p = /^\s*Platform:\s*(\S+)/im.exec(body);
  if (v && p) return { feature: v[1], platform: normalizePlatform(p[1]) };
  // Fall back to the title: "... JDK8 - x86-64_mac"
  const t = /\bJDK-?(\d+)\s+-\s+(\S+)\s*$/i.exec(issue.title);
  return t ? { feature: t[1], platform: normalizePlatform(t[2]) } : null;
}

/** Reads the checklist of a triage issue body: { AQAstatus: bool|undefined, TCKstatus: bool|undefined }. */
function parseChecklist(body) {
  const boxes = {};
  for (const m of (body || '').matchAll(/^\s*[-*]\s*\[([ xX])\]\s*(.*)$/gm)) {
    const ticked = m[1].toLowerCase() === 'x';
    if (/\bTCK\b|\bJCK\b/i.test(m[2])) boxes.TCKstatus = ticked;
    else if (/\bAQA/i.test(m[2])) boxes.AQAstatus = ticked;
  }
  return boxes;
}

/** Triage issue + column (AQAstatus|TCKstatus) -> derived status, or null when nothing can be derived. */
function triageStatus(issue, col) {
  if (issue.state === 'closed') {
    // Closed as "not planned" means the work will not be done; any other close counts as done.
    return issue.state_reason === 'not_planned' ? 'NotPlanned' : 'Completed';
  }
  const boxes = parseChecklist(issue.body);
  if (boxes[col]) return 'Completed';
  const anyTicked = Object.values(boxes).some(Boolean);
  if ((issue.comments || 0) > 0 || issue.state_reason === 'reopened' || anyTicked) return 'InProgress';
  return null;
}

/**
 * Returns copies of the records with AQAstatus/TCKstatus set from the matching triage issue
 * (NotPlanned is never overridden). If several issues match a version/platform, the newest one is used.
 */
function applyTriage(records, triageIssues, log = () => {}) {
  const byKey = new Map();
  for (const issue of triageIssues) {
    const id = parseTriageIssue(issue);
    if (!id) continue;
    const key = `${id.feature}|${id.platform}`;
    const prev = byKey.get(key);
    if (!prev || issue.number > prev.number) byKey.set(key, issue);
  }
  return records.map(rec => {
    if (!rec.Version) return rec;
    const issue = byKey.get(`${featureOf(rec.Version)}|${normalizePlatform(rec.Platform)}`);
    if (!issue) return rec;
    const out = { ...rec };
    for (const col of ['AQAstatus', 'TCKstatus']) {
      const derived = triageStatus(issue, col);
      if (derived && rec[col].toLowerCase() !== 'notplanned' && rec[col].toLowerCase() !== derived.toLowerCase()) {
        out[col] = derived;
        log(`${rec.Version} ${rec.Platform} ${col}: ${rec[col]} -> ${derived} (aqa-tests#${issue.number})`);
      }
    }
    return out;
  });
}

/**
 * Fetches the triage issues for the given release cycle (e.g. "November 2026") from the aqa-tests repository.
 * Lists the repository's issues instead of using the search API: search runs on a lagging index and can return
 * partial results with HTTP 200 (incomplete_results), which would silently reset AQA/TCK cells. Issues are
 * limited to those updated since the start of the month before the cycle, then filtered by title.
 */
async function fetchTriageIssues(github, aqaRepo, cycle) {
  const [owner, repo] = aqaRepo.split('/');
  const start = Date.parse(`1 ${cycle} UTC`);
  if (!owner || !repo) throw new Error(`invalid aqaRepo "${aqaRepo}" (expected owner/repo)`);
  if (Number.isNaN(start)) throw new Error(`cannot read a month and year from "${cycle}"`);
  const d = new Date(start);
  const since = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)).toISOString();
  const prefix = `${TRIAGE_TITLE_PREFIX} ${cycle}`;
  const issues = await github.paginate(github.rest.issues.listForRepo, { owner, repo, state: 'all', since, per_page: 100 });
  return issues.filter(i => !i.pull_request && (i.title || '').startsWith(prefix));
}

const FETCH_TIMEOUT_MS = 30000;
const MAX_DOCKER_PAGES = 10;

/** fetch with a timeout, so that a hung service fails its lookup instead of stalling the whole job. */
const timedFetch = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

const ADOPTIUM_API = 'https://api.adoptium.net/v3';
const RELEASE_PLAN_URL = 'https://raw.githubusercontent.com/adoptium/mirror-scripts/master/releasePlan.cfg';
const ARTIFACTORY_SEARCH = 'https://packages.adoptium.net/artifactory/api/search/artifact';
const DOCKER_TAGS = 'https://hub.docker.com/v2/repositories/library/eclipse-temurin/tags';

// Adoptium API architecture names for the platform architecture names used in status.csv.
const API_ARCH = { 'x86-64': 'x64', arm32: 'arm', ppcle64: 'ppc64le' };
// Linux package architecture names (deb, rpm, apk) per status.csv architecture.
const PKG_ARCH = {
  x64: { deb: 'amd64', rpm: 'x86_64', apk: 'x86_64' },
  aarch64: { deb: 'arm64', rpm: 'aarch64', apk: 'aarch64' },
  arm32: { deb: 'armhf', rpm: 'armv7hl' },
  ppcle64: { deb: 'ppc64el', rpm: 'ppc64le' },
  s390x: { deb: 's390x', rpm: 's390x' },
  riscv64: { deb: 'riscv64', rpm: 'riscv64' },
};
// Docker architecture names per status.csv architecture.
const DOCKER_ARCH = { x64: 'amd64', aarch64: 'arm64', arm32: 'arm', ppcle64: 'ppc64le', s390x: 's390x', riscv64: 'riscv64' };

const escapeRe = str => str.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');

const PUBLISH_COLUMNS = ['publishStatus', 'installerStatus', 'imagesStatus'];

/**
 * Marks the given columns of a record as unknown because a lookup failed. updateBody then keeps the cells already
 * shown in the issue instead of resetting them to the status.csv default. NotPlanned columns are never marked.
 * 'Version' keeps the existing "###" heading.
 */
function keepExisting(rec, ...cols) {
  const keep = new Set(rec._keep || []);
  for (const c of cols) {
    if (c === 'Version' || String(rec[c]).toLowerCase() !== 'notplanned') keep.add(c);
  }
  return { ...rec, _keep: keep };
}

/** Wraps an async lookup: results are cached per key, and failures are logged and returned as undefined. */
function safeLookup(fetcher, what, warn = () => {}) {
  const cache = new Map();
  return key => {
    if (!cache.has(key)) {
      cache.set(key, Promise.resolve().then(() => fetcher(key)).catch(e => {
        warn(`Could not query ${what} for ${key}: ${e.message}`);
        return undefined;
      }));
    }
    return cache.get(key);
  };
}

/** A resolved release name looks like "jdk8u514-b01" or "jdk-21.0.13.1+2"; placeholders like "jdk-21.0.X+Y" do not. */
function isReleaseTag(version) {
  return /^jdk.*(\+\d+|-b\d+)$/.test(version);
}

/** Parses releasePlan.cfg into Map(feature -> tag without the "-ga" suffix), e.g. "21" -> "jdk-21.0.13.1". */
function parseReleasePlan(text) {
  const plan = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*jdk(\d+)u?GA\s*=\s*"?([^"\s#]+)"?/.exec(line);
    if (m) plan.set(m[1], m[2].replace(/-ga$/i, ''));
  }
  return plan;
}

async function fetchReleasePlan(url = RELEASE_PLAN_URL, fetchImpl = timedFetch) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return parseReleasePlan(await res.text());
}

/** GA release names known to the Adoptium API for a feature version, newest first. */
async function fetchReleaseNames(feature, fetchImpl = timedFetch) {
  const range = encodeURIComponent(`[${feature},${Number(feature) + 1})`);
  const res = await fetchImpl(`${ADOPTIUM_API}/info/release_names?release_type=ga&vendor=eclipse&page_size=50&sort_order=DESC&version=${range}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Adoptium API returned HTTP ${res.status}`);
  return (await res.json()).releases || [];
}

/**
 * Sets each record's Version from the release plan: the full release name (e.g. "jdk-21.0.13.1+2") when the
 * Adoptium API knows it, otherwise the plan tag without a build number (e.g. "jdk-21.0.13.1"). Features that are
 * not in the plan keep the Version from status.csv. If the release names cannot be fetched, the existing heading and
 * published/installer/image cells in the issue are kept.
 */
async function applyReleasePlan(records, plan, fetchNames = fetchReleaseNames, warn = () => {}) {
  const resolved = new Map();
  const failed = new Set();
  for (const feature of new Set(records.filter(r => r.Version).map(r => featureOf(r.Version)))) {
    const prefix = plan.get(feature);
    if (!prefix) continue;
    try {
      const re = new RegExp(`^${escapeRe(prefix)}(?:\\+|-b)(\\d+)$`);
      const best = (await fetchNames(feature)).filter(n => re.test(n))
        .sort((x, y) => Number(re.exec(y)[1]) - Number(re.exec(x)[1]))[0];
      resolved.set(feature, best || prefix);
    } catch (e) {
      failed.add(feature);
      warn(`Could not resolve the ${prefix} release name from the Adoptium API: ${e.message}`);
    }
  }
  return records.map(r => {
    if (!r.Version) return r;
    const feature = featureOf(r.Version);
    if (failed.has(feature)) return keepExisting(r, 'Version', ...PUBLISH_COLUMNS);
    return resolved.has(feature) ? { ...r, Version: resolved.get(feature) } : r;
  });
}

/**
 * Fetches the published binaries of a release tag from the Adoptium API.
 * Returns Map("<arch>|<os>" -> has installer) for the jdk binaries, or null if the tag is not published (404).
 */
async function fetchPublishedPlatforms(tag, fetchImpl = timedFetch) {
  const res = await fetchImpl(`${ADOPTIUM_API}/assets/release_name/eclipse/${encodeURIComponent(tag)}?project=jdk`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Adoptium API returned HTTP ${res.status}`);
  const release = await res.json();
  const published = new Map();
  for (const b of release.binaries || []) {
    if (b.image_type !== 'jdk') continue;
    const key = `${b.architecture}|${b.os}`;
    published.set(key, published.get(key) || Boolean(b.installer)); // several binaries per platform: any installer counts
  }
  return published;
}

/** "<arch>|<os>" key of a status.csv platform in the Adoptium API. */
function apiKey(platform) {
  const [arch, os] = normalizePlatform(platform).split('_');
  return `${API_ARCH[arch] || arch}|${os}`;
}

/**
 * Returns copies of the records with publishStatus set to Completed for platforms published in the
 * Adoptium API (lookup(tag) -> Map, null for 404, or undefined on failure). Only rows whose AQAstatus and
 * TCKstatus are Completed are considered, and NotPlanned is never overridden.
 */
async function applyPublished(records, lookup, log = () => {}, warn = () => {}) {
  const out = [];
  const early = [];
  for (const rec of records) {
    if (!rec.Version || !isReleaseTag(rec.Version) || rec.publishStatus.toLowerCase() === 'notplanned') {
      out.push(rec);
      continue;
    }
    const published = await lookup(rec.Version);
    if (published === undefined) { out.push(keepExisting(rec, ...PUBLISH_COLUMNS)); continue; } // lookup failed
    if (!published || !published.has(apiKey(rec.Platform))) { out.push(rec); continue; }
    const gated = ['AQAstatus', 'TCKstatus'].filter(c => rec[c].toLowerCase() !== 'completed');
    if (gated.length) {
      early.push(`${rec.Version} ${rec.Platform} (${gated.join(' and ')})`);
      out.push(rec);
      continue;
    }
    if (rec.publishStatus.toLowerCase() !== 'completed') {
      log(`${rec.Version} ${rec.Platform} publishStatus: ${rec.publishStatus} -> Completed (Adoptium API)`);
    }
    out.push({ ...rec, publishStatus: 'Completed' });
  }
  if (early.length) warn(`Published before AQA and TCK are Completed, so publishStatus is not shown: ${early.join('; ')}`);
  return out;
}

/** Package version tokens for a release name, as they appear in deb, rpm and apk file names. */
function packageTokens(name) {
  let m = /^jdk8u(\d+)-b(\d+)$/.exec(name);
  if (m) {
    return { feature: '8', deb: `8.0.${m[1]}.0.0+${+m[2]}`, rpm: `8.0.${m[1]}.0.0.${+m[2]}`, apk: `8.${m[1]}.${m[2].padStart(2, '0')}` };
  }
  m = /^jdk-(\d+(?:\.\d+)*)\+(\d+)$/.exec(name);
  if (!m) return null;
  const parts = m[1].split('.');
  const dotted = parts.slice();
  while (parts.length < 4) parts.push('0');
  const base = parts.slice(0, 4).join('.');
  return { feature: parts[0], deb: `${base}.0+${m[2]}`, rpm: `${base}.0.${m[2]}`, apk: `${dotted.join('.')}_p${m[2]}` };
}

/**
 * Finds the Temurin Linux packages of a release in the packages.adoptium.net Artifactory (anonymous search).
 * Returns { deb, rpm, apk }: Sets of package architectures that exist.
 */
async function fetchLinuxPackages(name, fetchImpl = timedFetch) {
  const t = packageTokens(name);
  if (!t) throw new Error(`cannot derive package versions from "${name}"`);
  const N = t.feature;
  const search = async (repo, pattern) => {
    const res = await fetchImpl(`${ARTIFACTORY_SEARCH}?name=${encodeURIComponent(pattern)}&repos=${repo}`);
    if (!res.ok) throw new Error(`Artifactory returned HTTP ${res.status}`);
    return ((await res.json()).results || []).map(r => r.uri);
  };
  const archs = (uris, re) => new Set(uris.map(u => re.exec(u)).filter(Boolean).map(m => m[1]));
  const [deb, rpm, apk] = await Promise.all([
    search('deb', `temurin-${N}-jdk_*${t.deb}*`),
    search('rpm', `temurin-${N}-jdk-*${t.rpm}*`),
    search('apk', `temurin-${N}-jdk-*${t.apk}*`),
  ]);
  return {
    deb: archs(deb, new RegExp(`temurin-${N}-jdk_${escapeRe(t.deb)}(?:-\\d+)?_(\\w+)\\.deb$`)),
    rpm: archs(rpm, new RegExp(`temurin-${N}-jdk-${escapeRe(t.rpm)}-\\d+\\.(\\w+)\\.rpm$`)),
    apk: archs(apk, new RegExp(`/main/(\\w+)/temurin-${N}-jdk-${escapeRe(t.apk)}-r\\d+\\.apk$`)),
  };
}

/**
 * Sets installerStatus to Completed for published rows whose installer exists: mac/windows from the Adoptium
 * API (releaseLookup), linux when both the deb and rpm exist, alpine-linux when the apk exists (packageLookup).
 */
async function applyInstallers(records, releaseLookup, packageLookup, log = () => {}) {
  const out = [];
  for (const rec of records) {
    const cur = rec.installerStatus.toLowerCase();
    if (!rec.Version || !isReleaseTag(rec.Version) || cur === 'notplanned' || cur === 'completed' ||
        rec.publishStatus.toLowerCase() !== 'completed') {
      out.push(rec);
      continue;
    }
    const [arch, os] = normalizePlatform(rec.Platform).split('_');
    let done = false;
    if (os === 'mac' || os === 'windows') {
      const release = await releaseLookup(rec.Version);
      done = Boolean(release && release.get(apiKey(rec.Platform)));
    } else if (os === 'linux' || os === 'alpine-linux') {
      const pkg = PKG_ARCH[arch];
      const found = pkg ? await packageLookup(rec.Version) : null;
      if (found === undefined) { out.push(keepExisting(rec, 'installerStatus')); continue; } // lookup failed
      if (found) {
        done = os === 'linux' ? Boolean(pkg.deb && pkg.rpm && found.deb.has(pkg.deb) && found.rpm.has(pkg.rpm))
                              : Boolean(pkg.apk && found.apk.has(pkg.apk));
      }
    }
    if (done) log(`${rec.Version} ${rec.Platform} installerStatus: ${rec.installerStatus} -> Completed (installer found)`);
    out.push(done ? { ...rec, installerStatus: 'Completed' } : rec);
  }
  return out;
}

/** Docker Hub tag for a release name, e.g. "jdk-21.0.13.1+2" -> "21.0.13.1_2", "jdk8u514-b01" -> "8u514-b01". */
function dockerTagOf(name) {
  const m8 = /^jdk(8u\d+-b\d+)$/.exec(name);
  if (m8) return m8[1];
  const m = /^jdk-(.+)\+(\d+)$/.exec(name);
  return m ? `${m[1]}_${m[2]}` : null;
}

/**
 * Lists the platforms of the eclipse-temurin "<tag>-jdk*" images on Docker Hub as a Set of
 * "linux/<arch>", "windows/<arch>" and "alpine/<arch>" (for the -alpine variants).
 */
async function fetchImagePlatforms(name, fetchImpl = timedFetch) {
  const tag = dockerTagOf(name);
  if (!tag) throw new Error(`cannot derive a Docker tag from "${name}"`);
  const prefix = `${tag}-jdk`;
  const found = new Set();
  let url = `${DOCKER_TAGS}?page_size=100&name=${encodeURIComponent(prefix)}`;
  for (let pages = 1; url; pages++) {
    if (pages > MAX_DOCKER_PAGES) throw new Error(`more than ${MAX_DOCKER_PAGES} pages of tags for ${prefix}`);
    const res = await fetchImpl(url);
    if (!res.ok) throw new Error(`Docker Hub returned HTTP ${res.status}`);
    const page = await res.json();
    for (const t of page.results || []) {
      if (!t.name.startsWith(prefix)) continue;
      const variant = t.name.slice(prefix.length);
      if (variant && !variant.startsWith('-')) continue;
      for (const i of t.images || []) {
        if (i.os === 'unknown' || i.architecture === 'unknown') continue;
        found.add(`${variant.startsWith('-alpine') ? 'alpine' : i.os}/${i.architecture}`);
      }
    }
    url = page.next;
  }
  return found;
}

/** Docker image key of a status.csv platform, or null when no image is built for it (mac, aix, ...). */
function imageKey(platform) {
  const [arch, os] = normalizePlatform(platform).split('_');
  const a = DOCKER_ARCH[arch];
  if (!a) return null;
  return ({ linux: `linux/${a}`, 'alpine-linux': `alpine/${a}`, windows: `windows/${a}` })[os] || null;
}

/** Sets imagesStatus to Completed for published rows whose Docker Hub image exists. */
async function applyImages(records, imageLookup, log = () => {}) {
  const out = [];
  for (const rec of records) {
    const cur = rec.imagesStatus.toLowerCase();
    const key = rec.Version && imageKey(rec.Platform);
    if (!key || !isReleaseTag(rec.Version) || cur === 'notplanned' || cur === 'completed' ||
        rec.publishStatus.toLowerCase() !== 'completed') {
      out.push(rec);
      continue;
    }
    const images = await imageLookup(rec.Version);
    if (images === undefined) { out.push(keepExisting(rec, 'imagesStatus')); continue; } // lookup failed
    if (images && images.has(key)) {
      log(`${rec.Version} ${rec.Platform} imagesStatus: ${rec.imagesStatus} -> Completed (Docker Hub)`);
      out.push({ ...rec, imagesStatus: 'Completed' });
    } else {
      out.push(rec);
    }
  }
  return out;
}

const GENERATED_NOTE = '_This table is generated from `.github/release-status/status.csv` every 10 minutes. ' +
  'Manual edits to it are overwritten; to change a status that is not derived, open a pull request for that file._';

/** The cell text of a status column: the cell kept from the issue, or the emoji of the status. */
const cell = (r, col) => (r._raw && r._raw[col]) || emoji(r[col], r, col);

/** Renders the markdown table for the rows of one version. */
function renderTable(feature, rows, links = new Map()) {
  const jdk = `jdk${feature}`;
  const link = label => (links.has(label.toLowerCase()) ? `[${label}](${links.get(label.toLowerCase())})` : label);
  const header = ['Platform', `${jdk} AQA`, `${jdk} TCK`, `${jdk} published`, `${jdk} installers`, `${jdk} images`, 'Notes'];
  const out = [
    GENERATED_NOTE,
    '',
    `| ${header.map(link).join(' | ')} |`,
    '| ----- | ----- | ----- | ----- | ----- | ----- | ----- |',
  ];
  for (const r of rows) {
    out.push(
      `| ${platformDisplay(r.Platform)} ` +
      `| ${cell(r, 'AQAstatus')} ` +
      `| ${cell(r, 'TCKstatus')} ` +
      `| ${cell(r, 'publishStatus')} ` +
      `| ${cell(r, 'installerStatus')} ` +
      `| ${cell(r, 'imagesStatus')} ` +
      `| ${r.Notes.replace(/\|/g, '\\|')} |`);
  }
  return out;
}

/**
 * Replaces only the JDK version token of a "### JDK..." heading of this feature, keeping any text after it
 * (e.g. "### JDK21 - Linux delayed" -> "### jdk-21.0.13.1+2 - Linux delayed"). Other headings are left alone.
 * The template's "(UPDATE COLUMN HEADERS v)" hint is dropped.
 */
function retitleHeading(line, feature, heading) {
  const m = /^(###\s+)(jdk-?(\d+)[\w.+-]*)(.*)$/i.exec(line);
  if (!m || m[3] !== feature) return line;
  const rest = m[4].replace(/^\s+or\s+JDK<FEATURE>\+Y\s*\(UPDATE COLUMN HEADERS[^)]*\)\s*$/i, '');
  return `${m[1]}${heading}${rest}`;
}

const STATUS_COLUMNS = ['AQAstatus', 'TCKstatus', 'publishStatus', 'installerStatus', 'imagesStatus'];
const rowKey = platformCell => platformCell.replace(/\*/g, '').trim().toLowerCase();

/** Reads the markdown links of a feature's table header, e.g. "[jdk21 AQA](url)": Map(lower-case label -> url). */
function parseHeaderLinks(body, feature) {
  const links = new Map();
  const headerRe = new RegExp(`^\\s*\\|.*\\bjdk${feature} AQA\\b`, 'i');
  const header = body.split(/\r?\n/).find(l => headerRe.test(l));
  for (const m of (header || '').matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) links.set(m[1].trim().toLowerCase(), m[2]);
  return links;
}

/** Reads the status cells shown in the issue for a feature's table: Map(platform key -> [5 status cells]). */
function parseExistingRows(body, feature) {
  const rows = new Map();
  const lines = body.split(/\r?\n/);
  const headerRe = new RegExp(`^\\s*\\|.*\\bjdk${feature} AQA\\b`, 'i');
  const start = lines.findIndex(l => headerRe.test(l));
  if (start < 0) return rows;
  for (let i = start + 1; i < lines.length && /^\s*\|/.test(lines[i]); i++) {
    const cells = lines[i].split(/(?<!\\)\|/).map(c => c.trim());
    if (cells.length < 7 || /^[-: ]+$/.test(cells[1])) continue;
    rows.set(rowKey(cells[1]), cells.slice(2, 7));
  }
  return rows;
}

/** Attaches the cells shown in the issue for the columns of a record that must be kept. */
function withExistingCells(rec, existing) {
  if (!rec._keep || rec._keep.size === 0) return rec;
  const cells = existing.get(rowKey(platformDisplay(rec.Platform)));
  if (!cells) return rec;
  const raw = {};
  STATUS_COLUMNS.forEach((col, i) => { if (rec._keep.has(col) && cells[i]) raw[col] = cells[i]; });
  return { ...rec, _raw: raw };
}

/**
 * Replaces the existing table for the given feature version in the issue body
 * (located by its "jdk<N> AQA" column header). If there is none, a new
 * "### <Version>" section is appended. The heading above an existing table is
 * set to the Version of the first CSV row for that feature.
 */
function replaceTable(body, feature, tableLines, heading) {
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  const lines = body.split(/\r?\n/);
  const headerRe = new RegExp(`^\\s*\\|.*\\bjdk${feature} AQA\\b`, 'i');
  const start = lines.findIndex(l => headerRe.test(l));
  if (start < 0) {
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    lines.push('', `### ${heading || `JDK${feature}`}`, ...tableLines, '');
    return lines.join(eol);
  }
  let end = start;
  while (end < lines.length && /^\s*\|/.test(lines[end])) end++;
  // The table is preceded by the generated-content note and a blank line, which are replaced with it.
  let from = start;
  if (start >= 2 && lines[start - 1].trim() === '' && lines[start - 2].trim() === GENERATED_NOTE) from = start - 2;
  lines.splice(from, end - from, ...tableLines);
  // Keep the "### <version>" heading above the table in sync with the CSV Version.
  let h = from - 1;
  while (h >= 0 && lines[h].trim() === '') h--;
  if (heading && h >= 0) lines[h] = retitleHeading(lines[h], feature, heading);
  return lines.join(eol);
}

/** Applies all rows from the CSV to the issue body. */
function updateBody(body, records) {
  const byVersion = new Map();
  for (const rec of records) {
    if (!rec.Version) continue;
    const feature = featureOf(rec.Version);
    if (!byVersion.has(feature)) byVersion.set(feature, []);
    byVersion.get(feature).push(rec);
  }
  let updated = body;
  for (const [feature, rows] of byVersion) {
    const existing = parseExistingRows(updated, feature);
    const shown = rows.map(r => withExistingCells(r, existing));
    const heading = rows[0]._keep && rows[0]._keep.has('Version') ? undefined : rows[0].Version;
    updated = replaceTable(updated, feature, renderTable(feature, shown, parseHeaderLinks(updated, feature)), heading);
  }
  return updated;
}

/** Entry point for actions/github-script. */
async function run({ github, context, core }) {
  const dir = path.join(process.env.GITHUB_WORKSPACE, '.github', 'release-status');
  const config = parseProperties(fs.readFileSync(path.join(dir, 'config.properties'), 'utf8'));
  const issueNumber = parseInt(config.issue, 10);
  if (!issueNumber) {
    core.info('No "issue" set in config.properties; nothing to update.');
    return;
  }
  let records = parseCsv(fs.readFileSync(path.join(dir, 'status.csv'), 'utf8'));

  const { owner, repo } = context.repo;
  const issue = await github.rest.issues.get({ owner, repo, issue_number: issueNumber });
  if (issue.data.state !== 'open') {
    core.info(`Issue #${issueNumber} is closed; nothing to update.`);
    return;
  }

  const cycle = releaseCycleOf(issue.data.title);
  if (cycle) {
    const aqaRepo = config.aqaRepo || 'adoptium/aqa-tests';
    const triage = await fetchTriageIssues(github, aqaRepo, cycle);
    core.info(`Found ${triage.length} triage issue(s) in ${aqaRepo} for ${cycle}.`);
    records = applyTriage(records, triage, msg => core.info(msg));
  } else {
    core.warning(`Could not determine "<Month> <Year>" from the title of #${issueNumber}; not updating the issue.`);
    return;
  }

  const info = msg => core.info(msg);
  const warn = msg => core.warning(msg);

  try {
    const plan = await fetchReleasePlan(config.releasePlanUrl || RELEASE_PLAN_URL);
    records = await applyReleasePlan(records, plan, fetchReleaseNames, warn);
  } catch (e) {
    warn(`Could not read the release plan; keeping the existing headings and published/installer/image cells: ${e.message}`);
    records = records.map(r => (r.Version ? keepExisting(r, 'Version', ...PUBLISH_COLUMNS) : r));
  }

  const releases = safeLookup(fetchPublishedPlatforms, 'the Adoptium API', warn);
  const packages = safeLookup(fetchLinuxPackages, 'packages.adoptium.net', warn);
  const images = safeLookup(fetchImagePlatforms, 'Docker Hub', warn);
  records = await applyPublished(records, releases, info, warn);
  records = await applyInstallers(records, releases, packages, info);
  records = await applyImages(records, images, info);

  // Re-read the issue so that edits made while the lookups ran are not overwritten.
  const current = await github.rest.issues.get({ owner, repo, issue_number: issueNumber });
  if (current.data.state !== 'open') {
    core.info(`Issue #${issueNumber} was closed; nothing to update.`);
    return;
  }
  const oldBody = current.data.body || '';
  const newBody = updateBody(oldBody, records);
  if (newBody === oldBody) {
    core.info(`Issue #${issueNumber} is already up to date.`);
    return;
  }
  await github.rest.issues.update({ owner, repo, issue_number: issueNumber, body: newBody });
  core.info(`Updated status tables in issue #${issueNumber}.`);
}

module.exports = {
  run, parseCsv, parseProperties, renderTable, replaceTable, updateBody,
  normalizePlatform, releaseCycleOf, parseTriageIssue, parseChecklist, triageStatus, applyTriage, fetchTriageIssues,
  isReleaseTag, fetchPublishedPlatforms, applyPublished, safeLookup,
  parseReleasePlan, fetchReleasePlan, fetchReleaseNames, applyReleasePlan,
  packageTokens, fetchLinuxPackages, applyInstallers,
  dockerTagOf, fetchImagePlatforms, imageKey, applyImages,
  keepExisting, retitleHeading, parseExistingRows, parseHeaderLinks, GENERATED_NOTE, timedFetch,
};
