import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { desiredFeaturedPostIds, desiredPostStatus, parseStatusArgs } from './set-arweave-post-statuses.mjs';

describe('Arweave post status sync', () => {
	it('keeps only explicitly selected slugs published', () => {
		const publishedSlugs = ['bazar-is-live-on-mainnet-1-0'];
		assert.equal(desiredPostStatus({ slug: 'bazar-is-live-on-mainnet-1-0' }, publishedSlugs), 'published');
		assert.equal(desiredPostStatus({ slug: 'bundlers' }, publishedSlugs), 'draft');
	});

	it('parses repeatable published slug arguments', () => {
		const options = parseStatusArgs([
			'--portal',
			'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
			'--source-manifest',
			'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo',
			'--wallet',
			'/tmp/wallet.json',
			'--published-slug',
			'bazar-is-live-on-mainnet-1-0',
		]);
		assert.deepEqual(options.publishedSlugs, ['bazar-is-live-on-mainnet-1-0']);
		assert.equal(options.publish, false);
	});

	it('publishes all imported posts while selecting one featured post', () => {
		const options = parseStatusArgs([
			'--portal',
			'xq688x6oyBtrZTDCUPIlU9U2U-4j8u5pWpCfbAK4hrs',
			'--source-manifest',
			'YjaS3Q-5kJTNeygkXsy0d4Xnxkwk2bFcTQRNUJXJpRo',
			'--wallet',
			'/tmp/wallet.json',
			'--publish-all',
			'--featured-slug',
			'Bazar-is-live-on-Mainnet-1-0',
		]);
		assert.equal(options.publishAll, true);
		assert.equal(options.featuredSlug, 'bazar-is-live-on-mainnet-1-0');
		assert.equal(desiredPostStatus({ slug: 'bundlers', draft: true }, [], options.publishAll), 'published');
		assert.deepEqual(
			desiredFeaturedPostIds(
				[
					{ id: 'bazar-id', slug: 'bazar-is-live-on-mainnet-1-0' },
					{ id: 'bundlers-id', slug: 'bundlers' },
				],
				options.featuredSlug
			),
			['bazar-id']
		);
	});
});
