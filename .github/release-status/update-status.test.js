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

// Run with: node --test .github/release-status/update-status.test.js

const test = require('node:test');
const assert = require('node:assert');
const u = require('./update-status.js');

const BOXES = (aqa, tck) =>
  `- [${aqa ? 'x' : ' '}] Triage AQAvit tests - https://ci\n- [${tck ? 'x' : ' '}] Triage TCK automated tests - https://ci`;
const issue = (o = {}) => ({ number: 1, state: 'open', state_reason: null, comments: 0, body: BOXES(false, false), ...o });

test('triageStatus: closed issues', () => {
  const closed = issue({ state: 'closed', state_reason: 'completed' });
  assert.equal(u.triageStatus(closed, 'AQAstatus'), 'Completed');
  assert.equal(u.triageStatus(closed, 'TCKstatus'), 'Completed');
});

test('triageStatus: closed as not planned is NotPlanned, not Completed', () => {
  const np = issue({ state: 'closed', state_reason: 'not_planned', body: BOXES(true, true) });
  assert.equal(u.triageStatus(np, 'AQAstatus'), 'NotPlanned');
  assert.equal(u.triageStatus(np, 'TCKstatus'), 'NotPlanned');
});

test('triageStatus: open issues use the checklist, comments and reopened state per column', () => {
  const aqaDone = issue({ comments: 2, body: BOXES(true, false) });
  assert.equal(u.triageStatus(aqaDone, 'AQAstatus'), 'Completed');
  assert.equal(u.triageStatus(aqaDone, 'TCKstatus'), 'InProgress');
  assert.equal(u.triageStatus(issue({ comments: 1 }), 'TCKstatus'), 'InProgress');
  assert.equal(u.triageStatus(issue({ state_reason: 'reopened' }), 'AQAstatus'), 'InProgress');
  assert.equal(u.triageStatus(issue(), 'AQAstatus'), null);
});

test('applyTriage: not planned triage issue sets NotPlanned, a CSV NotPlanned is kept', () => {
  const rec = (o = {}) => ({ Version: 'jdk-21.0.X+Y', Platform: 'x64_mac', AQAstatus: 'NotStarted', TCKstatus: 'NotStarted', ...o });
  const np = issue({ title: 'Triage Automated Tests for November 2026 JDK21 - x86-64_mac', state: 'closed', state_reason: 'not_planned',
    body: `Version: JDK21\nPlatform: x86-64_mac\n${BOXES(false, false)}` });
  assert.deepEqual(u.applyTriage([rec()], [np]).map(r => [r.AQAstatus, r.TCKstatus]), [['NotPlanned', 'NotPlanned']]);
  assert.equal(u.applyTriage([rec({ AQAstatus: 'NotPlanned' })], [np])[0].AQAstatus, 'NotPlanned');
});

test('fetchTriageIssues: lists issues since the month before the cycle and filters by title', async () => {
  let args;
  const listed = [
    { number: 1, title: 'Triage Automated Tests for November 2026 JDK8 - x86-64_mac' },
    { number: 2, title: 'Triage Automated Tests for November 2026 JDK8 - x86-64_linux', pull_request: {} },
    { number: 3, title: 'Triage Automated Tests for October 2026 JDK8 - x86-64_mac' },
    { number: 4, title: 'November 2026 Release AQAvit Activities - JDK8' },
  ];
  const github = { paginate: async (fn, a) => { args = { fn, ...a }; return listed; }, rest: { issues: { listForRepo: 'list' } } };
  const got = await u.fetchTriageIssues(github, 'adoptium/aqa-tests', 'November 2026');
  assert.deepEqual(got.map(i => i.number), [1]);
  assert.deepEqual(args, { fn: 'list', owner: 'adoptium', repo: 'aqa-tests', state: 'all', since: '2026-10-01T00:00:00.000Z', per_page: 100 });
  await u.fetchTriageIssues(github, 'adoptium/aqa-tests', 'January 2027');
  assert.equal(args.since, '2026-12-01T00:00:00.000Z');
});

test('fetchTriageIssues: rejects a bad repository or cycle instead of returning nothing', async () => {
  const github = { paginate: async () => [], rest: { issues: { listForRepo: 'list' } } };
  await assert.rejects(() => u.fetchTriageIssues(github, 'aqa-tests', 'November 2026'), /invalid aqaRepo/);
  await assert.rejects(() => u.fetchTriageIssues(github, 'adoptium/aqa-tests', 'Nonsense 2026'), /cannot read a month/);
});

const mk = (o = {}) => ({
  Version: 'jdk-21.0.13.1+2', Platform: 'x64_linux', AQAstatus: 'Completed', TCKstatus: 'Completed',
  publishStatus: 'NotStarted', installerStatus: 'NotStarted', imagesStatus: 'NotStarted', Notes: '', ...o,
});
const json = (body, o = {}) => ({ ok: true, status: 200, json: async () => body, ...o });

test('fetchPublishedPlatforms: an installer on any binary of a platform counts', async () => {
  const bins = [
    { architecture: 'x64', os: 'windows', image_type: 'jdk', installer: { name: 'a.msi' } },
    { architecture: 'x64', os: 'windows', image_type: 'jdk' },
    { architecture: 'x64', os: 'linux', image_type: 'jdk' },
    { architecture: 'x64', os: 'linux', image_type: 'jre', installer: {} },
  ];
  const got = await u.fetchPublishedPlatforms('jdk-21.0.13.1+2', async () => json({ binaries: bins }));
  assert.equal(got.get('x64|windows'), true);
  assert.equal(got.get('x64|linux'), false);
  assert.equal(got.size, 2);
  assert.equal(await u.fetchPublishedPlatforms('x', async () => ({ ok: false, status: 404 })), null);
});

test('fetchImagePlatforms: gives up after the page limit instead of returning partial results', async () => {
  let calls = 0;
  const fetchImpl = async () => json({ results: [], next: 'https://hub.docker.com/next' }, { calls: ++calls });
  await assert.rejects(() => u.fetchImagePlatforms('jdk-21.0.13.1+2', fetchImpl), /pages of tags/);
});

test('fetchImagePlatforms: reads linux, windows and alpine images', async () => {
  const page = { results: [
    { name: '21.0.13.1_2-jdk-noble', images: [{ os: 'linux', architecture: 'amd64' }, { os: 'unknown', architecture: 'unknown' }] },
    { name: '21.0.13.1_2-jdk-alpine', images: [{ os: 'linux', architecture: 'arm64' }] },
    { name: '21.0.13.1_2-jdkx', images: [{ os: 'linux', architecture: 's390x' }] },
  ], next: null };
  const got = await u.fetchImagePlatforms('jdk-21.0.13.1+2', async () => json(page));
  assert.deepEqual([...got].sort(), ['alpine/arm64', 'linux/amd64']);
});

test('timedFetch: passes an abort signal to fetch', async () => {
  assert.ok(u.timedFetch);
  const original = global.fetch;
  let signal;
  global.fetch = async (url, o) => { signal = o.signal; return json({}); };
  try { await u.timedFetch('https://example.invalid'); } finally { global.fetch = original; }
  assert.ok(signal instanceof AbortSignal);
});

test('applyPublished: reports all rows published before AQA/TCK completed in one warning', async () => {
  const warnings = [];
  const lookup = async () => new Map([['x64|linux', false], ['x64|mac', false]]);
  const out = await u.applyPublished(
    [mk({ TCKstatus: 'InProgress' }), mk({ Platform: 'x64_mac', AQAstatus: 'InProgress' }), mk({ Platform: 'x64_windows' })],
    lookup, () => {}, m => warnings.push(m));
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /x64_linux \(TCKstatus\).*x64_mac \(AQAstatus\)/);
  assert.deepEqual(out.map(r => r.publishStatus), ['NotStarted', 'NotStarted', 'NotStarted']);
});

test('packageTokens: a release without a minor version is padded for deb/rpm and plain for apk', () => {
  assert.deepEqual(u.packageTokens('jdk-27+35'), { feature: '27', deb: '27.0.0.0.0+35', rpm: '27.0.0.0.0.35', apk: '27_p35' });
  assert.deepEqual(u.packageTokens('jdk-21.0.13.1+2'), { feature: '21', deb: '21.0.13.1.0+2', rpm: '21.0.13.1.0.2', apk: '21.0.13.1_p2' });
  assert.deepEqual(u.packageTokens('jdk8u514-b01'), { feature: '8', deb: '8.0.514.0.0+1', rpm: '8.0.514.0.0.1', apk: '8.514.01' });
});

const TABLE_HEAD = (jdk, link) =>
  `| Platform  | ${link ? `[${jdk} AQA](${link})` : `${jdk} AQA`} | ${jdk} TCK | ${jdk} published | ${jdk} installers | ${jdk} images  | Notes |\n` +
  '| ----- | ----- | ----- | ----- | ----- | ----- | ----- |\n';

test('updateBody: keeps the hyperlink on a table header and adds one generated-content note', () => {
  const body = `intro\n\n### jdk-21.0.13.1+2\n${TABLE_HEAD('jdk21', 'https://github.com/adoptium/aqa-tests/issues/7984')}| **x64 Linux** | a | b | c | d | e |  |\n\nafter\n`;
  const once = u.updateBody(body, [mk()]);
  assert.match(once, /\[jdk21 AQA\]\(https:\/\/github\.com\/adoptium\/aqa-tests\/issues\/7984\)/);
  assert.equal(once.split(u.GENERATED_NOTE).length - 1, 1);
  assert.match(once, /### jdk-21\.0\.13\.1\+2\n_This table is generated .*overwritten.*_\n\n\| Platform/);
  assert.ok(once.startsWith('intro\n') && once.endsWith('\nafter\n'));
  assert.equal(u.updateBody(once, [mk()]), once, 'second run must not change the issue');
  assert.deepEqual([...u.parseHeaderLinks(once, '21')], [['jdk21 aqa', 'https://github.com/adoptium/aqa-tests/issues/7984']]);
});

test('updateBody: a table without links stays without links', () => {
  const body = `### JDK21\n${TABLE_HEAD('jdk21')}| **x64 Linux** | a | b | c | d | e |  |\n`;
  assert.doesNotMatch(u.updateBody(body, [mk()]), /\]\(/);
});
