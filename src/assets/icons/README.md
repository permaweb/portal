# Bundled Portal icons

These 143 SVGs are local copies of Portal's built-in UI, social, and app icons.
`sources.json` records each original transaction ID, download URL, and byte count.
SVG bytes are preserved as downloaded.

`src/helpers/config/iconAssets.ts` imports them with Vite's `?inline` option, so
rendering an icon does not make an HTTP request. It also resolves the original
transaction IDs and gateway URLs used in saved social links. Keep the IDs in
`ICONS_SOCIAL` stable: they are part of persisted portal data.

The original admin icon (`L6_7B3Qbpnye2pHGNS-8TS310s2uWzRgeQH6fqHS37o`) returned
404 on September 8, 2026, including its raw, metadata, and status endpoints.
Its registry entry uses `user.svg` as a local fallback. It is not listed as a
downloaded original in `sources.json`.

The three app manifests embed `app.svg` as a data URL to avoid a separate icon
request and keep manifest URLs valid when Vite emits assets under hashed names.
If that SVG changes, update the embedded copies in those manifests as well.
