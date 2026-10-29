#!/usr/bin/env node
// ============================================================================
// Load-tests the journal_entries insert flow (the only public-write path in
// this app) directly against Supabase's REST API — the same path
// components/JournalLog.tsx uses. Bypasses the browser, so this measures
// the database/API path, not client rendering.
//
// Also exercises the rate-limit trigger from
// supabase/migrations/002_hardening.sql: at concurrency > 20 against a
// single waypoint within 60s you should see a mix of successes and
// "Rate limit exceeded" rejections — that's the trigger working, not a bug.
//
// Usage:
//   export NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
//   export NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon public key]"
//   node scripts/load-test-journal.mjs --waypoint <uuid> --requests 200 --concurrency 20
//
// Requires Node 18+ (built-in fetch). Cleans up every row it inserts.
// ============================================================================

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, arr) => {
    if (arg.startsWith('--')) pairs.push([arg.slice(2), arr[i + 1]]);
    return pairs;
  }, [])
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const WAYPOINT_ID = args.waypoint;
const TOTAL_REQUESTS = parseInt(args.requests ?? '200', 10);
const CONCURRENCY = parseInt(args.concurrency ?? '20', 10);

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Error: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.');
  process.exit(1);
}
if (!WAYPOINT_ID) {
  console.error('Error: --waypoint <uuid> is required. Grab one with:');
  console.error('  psql "$DATABASE_URL" -c "select id, name from waypoints limit 5;"');
  process.exit(1);
}

const endpoint = `${SUPABASE_URL}/rest/v1/journal_entries`;
const insertedIds = [];
const latencies = [];
let successes = 0;
let failures = 0;
let rateLimited = 0;
const failureSamples = [];

async function insertOne(i) {
  const start = performance.now();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        waypoint_id: WAYPOINT_ID,
        notes: `[load-test] entry ${i} at ${new Date().toISOString()}`,
      }),
    });
    const elapsed = performance.now() - start;
    latencies.push(elapsed);

    if (res.ok) {
      const [row] = await res.json();
      if (row?.id) insertedIds.push(row.id);
      successes++;
    } else {
      const body = await res.text();
      failures++;
      if (/rate limit/i.test(body)) rateLimited++;
      if (failureSamples.length < 5) failureSamples.push(`${res.status} ${body}`);
    }
  } catch (err) {
    latencies.push(performance.now() - start);
    failures++;
    if (failureSamples.length < 5) failureSamples.push(String(err));
  }
}

async function runBatch(count, size) {
  let completed = 0;
  while (completed < count) {
    const batch = Math.min(size, count - completed);
    await Promise.all(Array.from({ length: batch }, (_, j) => insertOne(completed + j)));
    completed += batch;
    process.stdout.write(`\r  ${completed}/${count} requests sent`);
  }
  process.stdout.write('\n');
}

async function cleanup() {
  if (insertedIds.length === 0) return;
  console.log(`\n==> Cleaning up ${insertedIds.length} test rows...`);
  const idList = insertedIds.map((id) => `"${id}"`).join(',');
  const res = await fetch(`${endpoint}?id=in.(${idList})`, {
    method: 'DELETE',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  }).catch(() => null);
  if (!res || !res.ok) {
    console.warn('Cleanup request failed — delete test rows manually with:');
    console.warn("  delete from journal_entries where notes like '[load-test]%';");
  }
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function main() {
  console.log(`Load-testing journal insert: ${TOTAL_REQUESTS} requests, concurrency ${CONCURRENCY}`);
  console.log(`Target waypoint: ${WAYPOINT_ID}\n`);

  const wallStart = performance.now();
  await runBatch(TOTAL_REQUESTS, CONCURRENCY);
  const wallElapsed = (performance.now() - wallStart) / 1000;

  const sorted = [...latencies].sort((a, b) => a - b);
  console.log('\n==> Results');
  console.log(`  Successes:     ${successes}`);
  console.log(`  Failures:      ${failures} (of which rate-limited: ${rateLimited})`);
  console.log(`  Throughput:    ${(TOTAL_REQUESTS / wallElapsed).toFixed(1)} req/s (wall time ${wallElapsed.toFixed(1)}s)`);
  console.log(`  Latency p50:   ${percentile(sorted, 50).toFixed(0)} ms`);
  console.log(`  Latency p95:   ${percentile(sorted, 95).toFixed(0)} ms`);
  console.log(`  Latency p99:   ${percentile(sorted, 99).toFixed(0)} ms`);
  console.log(`  Latency max:   ${(sorted[sorted.length - 1] ?? 0).toFixed(0)} ms`);

  if (failureSamples.length > 0) {
    console.log('\n==> Sample failures');
    failureSamples.forEach((f) => console.log(`  ${f}`));
    console.log(
      "\nRate-limit rejections are supabase/migrations/002_hardening.sql's per-waypoint " +
        'guard (20 inserts / 60s) doing its job, not a bug — expected once concurrency exceeds it.'
    );
  }

  await cleanup();
}

main();
