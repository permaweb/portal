import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeDraftPlaceholders, parseArgs, parsePostDocument, slugify } from './import-docx-post.mjs';

test('DOCX imports default to the AO topic and dry-run mode', () => {
	const options = parseArgs([
		'--docx',
		'/tmp/post.docx',
		'--portal',
		'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
		'--wallet',
		'/tmp/wallet.json',
	]);
	assert.deepEqual(options.tags, ['AO']);
	assert.equal(options.publish, false);
});

test('parses front matter and accepted article paragraphs', () => {
	const parsed = parsePostDocument([
		'---',
		'title: "PermawebOS: An AO Node in Every Browser"',
		'date: "2026-08-21"',
		'desc: "A browser node."',
		'category: "Announcements"',
		'banner: "[BANNER_TX_ID]"',
		'—',
		'',
		'## A node at the browser boundary',
		'<FULLSCREEN_APP_IMAGE>',
		'We want <NUMBER> testers.',
	]);
	assert.equal(parsed.slug, 'permawebos-an-ao-node-in-every-browser');
	assert.equal(parsed.metadata.category, 'Announcements');
	assert.match(parsed.markdown, /^## A node at the browser boundary/m);
	assert.match(parsed.markdown, /\[Placeholder: FULLSCREEN APP IMAGE\]/);
	assert.match(parsed.markdown, /\[Placeholder: NUMBER\]/);
});

test('normalizes placeholder links without changing their visible labels', () => {
	assert.equal(normalizeDraftPlaceholders('[Discord](<DISCORD_LINK>)'), '[Discord](DISCORD_LINK)');
	assert.equal(slugify('PermawebOS: An AO Node in Every Browser'), 'permawebos-an-ao-node-in-every-browser');
});
