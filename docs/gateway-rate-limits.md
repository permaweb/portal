# Gateway request limits

Proactive gateway pacing is **off by default**, including in
`npm run build:editor:base`. Ordinary requests start without artificial spacing,
without the limiter's four-request concurrency cap, and without per-request
budget writes or Web Locks. Request counters remain available in memory.
Retries and the retry notification still apply to actual HTTP 429 responses.

The conservative pacing policy is available through a build-time feature flag:

```sh
VITE_ENABLE_GATEWAY_PACING=true npm run build:editor:base
```

The same flag works with the other Portal build commands. Leave it unset or set
it to `false` for the faster default. There are no network settings controls in
the UI. Rebuild and deploy to change this flag on the live application.

## Responses with status 429

An actual 429 pauses new gateway attempts while the shared cooldown is active.
Portal honors `Retry-After` in seconds or HTTP-date form, adds recovery time and
jitter, and increases the backoff when a request is repeatedly rate limited.
A server-provided deadline is never shortened by the backoff cap.

In the default mode, a missing or unreadable `Retry-After` starts at about two
seconds plus jitter. Repeated failures double this delay up to 30 seconds plus
jitter. This mode does not infer an 81-second wait from the configured maximum
IP debt. Ordinary traffic resumes without artificial spacing after the cooldown.
Actual cooldowns persist across reloads and coordinate across same-origin tabs;
legacy pacing budgets and their inferred cooldowns are ignored by this mode.

Retries continue until the request receives a response other than 429 or is
cancelled. A persistent notification says requests are being retried. Network
errors and other HTTP statuses keep their existing handling. Request bodies are
preserved for retries, and explicit attempt timeouts exclude the cooldown wait.

## Base-mode read concurrency

Base-mode loaders have a separate concurrency ceiling, configured in
`BASE_READ_LIMITS` in `src/helpers/basePortalRequests.ts`:

| Work                         | Concurrency |
| ---------------------------- | ----------: |
| Shared gateway reads         |          16 |
| Portal cards loading at once |           8 |
| Transaction/post-body reads  |          16 |

Portal, profile, transaction, and pending-transaction reads all share the
16-request ceiling. These worker counts do not multiply the network limit, and
they add no time-based pacing. Concurrent duplicate reads and cached responses
continue to be reused.

Post bodies within a release load concurrently, then apply in their original
order. Releases themselves still apply in dependency order with full validation;
an invalid post prevents the entire release from being accepted. Card discovery
continues to skip post bodies. Enabling proactive gateway pacing adds that
policy's tighter limits on top of these loader limits.

## Optional proactive pacing

When `VITE_ENABLE_GATEWAY_PACING=true`, Portal uses the HyperBEAM Edge settings
in `DEFAULT_GATEWAY_RATE_LIMIT` in `src/helpers/gatewayRateLimit.ts`:

| Setting               | Default | Meaning on HyperBEAM Edge                            |
| --------------------- | ------: | ---------------------------------------------------- |
| `rate-limit-period`   |     240 | Recharge period, in seconds.                         |
| `rate-limit-requests` |     360 | Tokens replenished during that period.               |
| `rate-limit-max`      |    1200 | Maximum accumulated token balance for an IP address. |
| `rate-limit-min`      |    -120 | Lowest balance after continued rejected requests.    |

Edge uses a replenishing balance. The default recharge rate is
`360 / 240 = 1.5` tokens per second. Every request costs one token, including a
rejected request, and succeeds only when the balance after the debit is greater
than zero. An idle IP can accumulate up to 1200 tokens.

The opt-in policy schedules requests at 80% of that recharge rate: about 1.2
requests per second, with at least 834 milliseconds between starts, and at most
four active requests. It starts with a conservative estimated balance instead
of assuming that the IP has its full burst allowance. This can make request-heavy
screens much slower, which is why it is no longer the default.

With pacing enabled, the configured minimum balance also provides a conservative
429 fallback of roughly 81 seconds when no `Retry-After` is readable. Exponential
backoff can grow to five minutes, and longer server deadlines remain honored.

Application code can call `setGatewayRateLimitConfig(config)` to update the
validated settings for the current page. This adjusts queued pacing when the
feature is enabled; it does not enable pacing when the feature flag is off.
Runtime overrides are not persisted. These values do not change the gateway's
server configuration, and Portal does not automatically discover server settings.

## Measurements and coordination

`getGatewayRequestSnapshot()` exposes request counts, queue activity, local
estimated balance, actual cooldown, and `pacingEnabled`. `requestsPerSecond` is
`null` when pacing is disabled because no proactive rate is enforced. Counts
measure application fetch attempts, including retries, over the configured period.
The estimated balance is not a reading from the gateway.

In the default mode, counters are per page and only actual retry cooldowns are
persisted. With proactive pacing enabled, budgets and counters are also shared
through browser storage and Web Locks. Browsers without Web Locks have
best-effort coordination; browsers that block storage use in-memory state.

## Assets and browser coverage

The fetch scheduler is installed before each app starts. This includes direct
API calls and SDKs that use the page's global fetch, such as the Arweave SDK.
Built-in icons are stored in `src/assets/icons` and explicitly inlined by Vite,
so displaying them makes no gateway requests. The local registry also recognizes
their original transaction IDs and gateway URLs in existing saved social links.
`sources.json` records the downloaded originals. Social link records continue to
store their existing transaction IDs.

Portal's shared `GatewaySVG` component fetches other, custom gateway icons
through the scheduler before handing local blob URLs to the SVG injector.
Concurrent icons share downloads, cached bytes are bounded, and unused pending
downloads are cancelled. Theme colors continue to apply to bundled icons.

Portal no longer eagerly preloads every gateway icon. Shared avatars and media
library thumbnails load lazily, and gallery videos wait for playback before
preloading.

## Bundled files and repeat visits

The editor build consolidates route components, shared UI, translations, and
documentation into a common application bundle, with shared dependencies grouped
separately and CSS emitted together. Navigating between ordinary editor screens
therefore avoids downloading a collection of small route and helper chunks.
This trades a larger first download for fewer requests and reusable files on
later visits. Optional Monaco JSON editor code remains lazy. Stripe's external
scripts and iframes initialize only when the payment form is rendered.

Inspect an existing editor build with
`node scripts/check-editor-bundle.mjs /path/to/editor/build`. It checks the chunk
count, import cycles, deferred optional modules, and that gateway pacing installs
before SDKs capture `fetch`. It does not create a build or start a server.

The editor and viewer HTML each request one Google Fonts stylesheet containing
the two fonts their UI uses: Open Sans and Crimson Pro. The engine loads its
selected portal fonts. Font settings load only the selected preview fonts,
rather than every family in the dropdown. A shared loader reuses selected
families across providers and previews and recognizes the UI fonts already in
the HTML. These font requests go to Google, independently of the gateway budget.

For pages controlled by the service worker, cached bundles are served promptly
and revalidated in the background on every use, including content-hashed files.
Refresh requests use `cache: 'no-cache'` so the browser revalidates against the
gateway instead of silently using its fresh HTTP-cache copy. A hash-shaped
filename is not treated as proof that the cached response is correct. Mutable
asset URLs no longer have an hour-long interval without revalidation.

Concurrent cold requests and background refreshes for the same asset share a
download. If a refresh receives a 429 or another failed response, or encounters
a network error, the existing cached asset stays usable. Further refresh attempts
wait at least one minute and honor a longer `Retry-After`, including HTTP-date
values. That cooldown is saved with the cached response so restarting the worker
or opening another tab does not reset it.

The lightweight engine worker also revalidates cached transaction-addressed
engine scripts in the background. Duplicate cache-warming messages reuse existing
downloads. Unversioned `bundle.js` URLs retain browser HTTP-cache behavior.
Neither worker downloads the current HTML again at install.

Background revalidation can still serve an older cached response for the current
load; the updated bytes are available on the next request. It does not guarantee
that the currently running application is the newest deployment. Cached fallbacks
also require previously downloaded bytes and cannot repair a cold download
rejected before the application starts.

Worker registration follows the deployment's base path. Cache cleanup only
removes caches belonging to the relevant Portal worker, preserving other app
caches. ArNS deployment updates invalidate mutable assets while keeping hashed
assets, user data, and the shared gateway budget. Update checks share an in-flight
request and run at most once every five minutes per tab, including across reloads
when session storage is available. Only the page requesting a cache refresh is
reloaded.

## Browser coverage limits

Native images, video, CSS backgrounds, iframe content, service-worker traffic,
and other sites do not all pass through the page's fetch scheduler. Their requests
are not included in its measurements or automatically retried by that scheduler;
the service-worker cache behavior above is a separate layer.

Initial HTML and script downloads happen before Portal can run. Published-site
bootstrap code generated by `src/helpers/config.ts` also resolves the engine
reference and loads the engine before the scheduler is available. If the
gateway rejects these initial resources, the application cannot display a retry
notification yet. Existing bootstrap cache/fallback behavior still applies.

The server limit is per IP address. Other tabs on different origins, other
applications, and other users sharing a public IP can consume its balance.
Client pacing reduces avoidable rate limiting but cannot guarantee gateway
availability or observe all traffic sharing that address.
