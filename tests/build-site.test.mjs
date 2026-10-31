import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
for (const reveal of [false, true]) test(`public build retains registry and gates controls (reveal=${reveal})`, async () => {
  const output = await mkdtemp(join(tmpdir(), 'panphora-build-'));
  await exec(process.execPath, [join(repo, 'scripts/build-site.mjs'), '--out', output, ...(reveal ? ['--reveal-reactions'] : [])]);
  const html = await readFile(join(output, 'core/panphora.html'), 'utf8');
  const tags = [...html.matchAll(/<script type="application\/json" data-rules-name="api"[^>]*>([^<]*)<\/script>/g)];
  assert.equal(tags.length, 1);
  const rules = JSON.parse(tags[0][1]);
  assert.equal(rules.projects[1].actions, '@data-actions');
  assert.ok([...html.matchAll(/<article[^>]*data-id=/g)].length > 1);
  assert.ok(html.includes('/_/reactions/panphora'));
  assert.equal(html.includes('.like-slot, .notify-region { display: none'), !reveal);
  assert.ok(!html.includes('stub until'));
  for (const marker of ['clay.js', 'redpen.js', 'opens-in', 'documentid', '../claygoo']) assert.ok(!html.includes(marker), marker);
});

test('revealing refuses a source page that still has the stub', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'panphora-stub-'));
  const source = join(dir, 'index.htmlclay');
  await writeFile(source, '<html><head><style></style></head><body><script>// stub until the backend exists</script></body></html>');
  await assert.rejects(exec(process.execPath, [join(repo, 'scripts/build-site.mjs'), '--out', join(dir, 'out'), '--reveal-reactions'], { env: { ...process.env, PANPHORA_SOURCE: source } }), /in-memory stub/);
});
