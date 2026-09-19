// Public HTTPS verification against the REAL server, resolving the hostname via
// PUBLIC DNS resolvers (1.1.1.1 then 9.9.9.9) because this machine's local resolver
// holds a stale negative cache (ENODATA). NO hosts-file override, NO URL rewrite,
// NO disabled TLS validation — SNI/host stay rnraielements.com and rejectUnauthorized
// is left at the default (true).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Resolver } from 'node:dns';
import https from 'node:https';

const HOST = 'rnraielements.com';
const RESOLVERS = ['1.1.1.1', '9.9.9.9'];

function resolve(host, family) {
  return new Promise((resolveP, rejectP) => {
    let i = 0;
    const attempt = () => {
      if (i >= RESOLVERS.length) return rejectP(new Error('all resolvers failed'));
      const r = new Resolver();
      r.setServers([RESOLVERS[i++]]);
      const method = family === 6 ? 'resolve6' : 'resolve4';
      r[method](host, (err, addrs) => {
        if (err) return attempt();
        resolveP(addrs);
      });
    };
    attempt();
  });
}

async function lookupFn(hostname, options, cb) {
  try {
    const addrs4 = await resolve(hostname, 4).catch(() => []);
    const addrs6 = options.family === 6 ? await resolve(hostname, 6).catch(() => []) : [];
    const all = [...addrs6, ...addrs4].map(a => ({ address: a, family: addrs4.includes(a) ? 4 : 6 }));
    if (all.length === 0) return cb(new Error('no addresses resolved'), '');
    cb(null, all);
  } catch (e) { cb(e, ''); }
}

function fetchPath(path) {
  return new Promise((resolveP, rejectP) => {
    const req = https.request({
      hostname: HOST,
      servername: HOST,          // SNI stays rnraielements.com
      port: 443,
      path,
      method: 'GET',
      headers: { 'accept': '*/*', 'accept-encoding': 'identity' },
      lookup: lookupFn,          // custom lookup via PUBLIC resolver (not hosts file)
      // rejectUnauthorized defaults to true → real TLS validation
    }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolveP({ status: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', rejectP);
    req.setTimeout(20000, () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

const manifest = JSON.parse(readFileSync('tests/sprint-05-orient-search/evidence/ORI-DEP-001/asset-manifest.json', 'utf8'));
const assets = manifest.assets;
const targets = [
  ['', null],                                            // apex -> 200 + html
  ['/r/nativewind/conversation.json', 'r/nativewind/conversation.json'],
  ['/r/uniwind/conversation.json', 'r/uniwind/conversation.json'],
  ['/r/nativewind/prompt-input.json', 'r/nativewind/prompt-input.json'],
  ['/r/uniwind/kbd.json', 'r/uniwind/kbd.json'],
  ['/r/nativewind/registry.json', 'r/nativewind/registry.json'],
  ['/r/uniwind/registry.json', 'r/uniwind/registry.json'],
  ['/components', 'components/index.html'],
];

const out = { generated_at: new Date().toISOString(), host: HOST, resolvers: RESOLVERS, results: [] };
for (const [path, manifestKey] of targets) {
  const t0 = Date.now();
  try {
    const { status, headers, body } = await fetchPath(path);
    const sha = createHash('sha256').update(body).digest('hex');
    const entry = { path: path || '/', status, bytes: body.length, sha256: sha, content_type: headers['content-type'] };
    if (manifestKey) {
      const expected = assets[manifestKey];
      entry.expected_sha256 = expected ?? null;
      entry.byte_match = expected !== undefined && expected === sha;
    } else if (path === '') {
      entry.is_html = (headers['content-type'] || '').includes('text/html');
      entry.has_built_docs = body.includes('<html') && body.length > 1000;
    } else if (path === '/components') {
      entry.is_html = (headers['content-type'] || '').includes('text/html');
      entry.has_content = body.length > 1000;
    }
    entry.ms = Date.now() - t0;
    out.results.push(entry);
    console.log(`${(entry.byte_match === undefined ? '' : entry.byte_match ? 'MATCH  ' : 'MISMATCH')} ${path || '/'} status=${status} bytes=${body.length} sha=${sha.slice(0,12)}…`);
  } catch (e) {
    out.results.push({ path: path || '/', error: e.message, ms: Date.now() - t0 });
    console.log(`ERROR   ${path || '/'} ${e.message}`);
  }
}
readFileSync; // keep import used
const crypto_out = JSON.stringify(out, null, 2);
process.stdout.write('\n=== SUMMARY ===\n' + crypto_out + '\n');
