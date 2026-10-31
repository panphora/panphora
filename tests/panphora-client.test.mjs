import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
const sourcePath = process.env.PANPHORA_SOURCE || join(homedir(), 'htmlfile/20261029-panphora-bakeoff/seat-argon-v2/index.htmlclay');
const html = await readFile(sourcePath, 'utf8');
const source = html.match(/<script id="panphora-client">([\s\S]*?)<\/script>/)?.[1];
assert.ok(source);
function boot({ storage = new Map(), respond, hostname = 'panphora.com' } = {}) {
  const calls = [];
  const window = new EventTarget();
  const document = new EventTarget();
  const fetch = async (url, options) => {
    const request = { url, ...options, body: options.body ? JSON.parse(options.body) : null };
    calls.push(request);
    const result = respond ? await respond(request, calls.length) : { counts: {}, formToken: `token-${calls.length}`, count: 1, ok: true };
    return { ok: result.status === undefined || result.status < 400, json: async () => result };
  };
  runInNewContext(source, { window, document, fetch, location: { hostname }, navigator: {}, crypto: webcrypto, Uint8Array, CustomEvent: class extends Event {}, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } });
  return { client: window.panphora, calls, storage };
}
test('one GET, synchronous cache, serial handoff and unlike without token', async () => {
  const { client, calls } = boot({ respond: async (request, n) => n === 1 ? { counts: { one: { like: 7 } }, formToken: 'first' } : { ok: true, count: n, formToken: `next-${n}` } });
  assert.equal(client.count('one'), 0);
  await client.ready;
  assert.equal(client.count('one'), 7);
  await Promise.all([client.like('one'), client.set('two', '🔥', true), client.unlike('one')]);
  assert.equal(calls.length, 4);
  assert.equal(calls[1].body.formToken, 'first');
  assert.equal(calls[2].body.formToken, 'next-2');
  assert.ok(!Object.hasOwn(calls[3].body, 'formToken'));
  assert.equal(client.active('one'), false);
  assert.equal(client.active('two', '🔥'), true);
  assert.ok(calls.every(call => call.credentials === 'omit'));
});
test('one token-refusal retry and no state update when retry fails', async () => {
  const { client, calls } = boot({ respond: async (request, n) => n === 1 ? { formToken: 'first' } : { status: 400, ok: false, code: 'form-token', error: 'Retry', formToken: `next-${n}` } });
  await assert.rejects(client.like('one'), /Retry/);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].body.formToken, 'next-2');
  assert.equal(client.active('one'), false);
});
test('a refused token succeeds once retried; notify sends the actual honeypot', async () => {
  const { client, calls } = boot({ respond: async (request, n) => n === 1 ? { formToken: 'first' } : n === 2 ? { status: 400, code: 'form-token', formToken: 'fresh' } : { ok: true, count: 2, formToken: 'next' } });
  await client.like('one');
  assert.equal(client.active('one'), true);
  await client.notify('one', 'reader@example.test', 'note', 'filled');
  assert.equal(calls[3].body.hc_extra, 'filled');
  assert.equal(calls[3].body.message, 'note');
  assert.ok(calls[3].url.endsWith('/_/projects/panphora/one/follow'));
});
test('visitor and action state survive reload and network errors do not poison the queue', async () => {
  const first = boot();
  await first.client.like('one');
  const second = boot({ storage: first.storage, hostname: 'preview.localhost', respond: async (request, n) => {
    if (n === 2) throw new Error('offline');
    return { ok: true, count: 1, formToken: 'next' };
  } });
  assert.equal(second.client.active('one'), true);
  await assert.rejects(second.client.unlike('one'), /offline/);
  assert.equal(second.client.active('one'), true);
  await second.client.like('two');
  assert.equal(second.calls[2].body.visitor, first.calls[1].body.visitor);
  assert.ok(second.calls[0].url.startsWith('https://panphora.com/'));
});

test('valued actions retain the chosen value across reload and clear it on removal', async () => {
  const first = boot({ respond: async request => request.method === 'PUT'
    ? { ok: true, count: request.body.on ? { [request.body.value]: 1 } : {}, formToken: 'next' }
    : { counts: { one: { rating: {} } }, formToken: 'first' } });
  await first.client.ready;
  assert.equal(JSON.stringify(first.client.count('one', 'rating')), '{}');
  await first.client.set('one', 'rating', true, '4');
  assert.equal(first.client.active('one', 'rating'), '4');
  const second = boot({ storage: first.storage, respond: async () => ({ counts: { one: { rating: { 4: 1 } } }, ok: true, count: {}, formToken: 'next' }) });
  await second.client.ready;
  assert.equal(second.client.active('one', 'rating'), '4');
  await second.client.set('one', 'rating', false);
  assert.equal(second.client.active('one', 'rating'), false);
  assert.equal(JSON.stringify(second.client.count('one', 'rating')), '{}');
  assert.equal(boot({ storage: second.storage }).client.active('one', 'rating'), false);
});
