#!/usr/bin/env node

/**
 * WordPress Site Extraction Test Script
 *
 * This script tests what data can be extracted from a WordPress site
 * using both REST API and web scraping methods.
 *
 * Usage: node scripts/test-wordpress-extraction.js <wordpress-url>
 * Example: node scripts/test-wordpress-extraction.js https://example.com
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Colors for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
	console.log('\n' + '='.repeat(60));
	log(title, 'bright');
	log('='.repeat(60), 'bright');
}

function logSuccess(message) {
	log(`✓ ${message}`, 'green');
}

function logWarning(message) {
	log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
	log(`✗ ${message}`, 'red');
}

function logInfo(message) {
	log(`ℹ ${message}`, 'cyan');
}

// HTTP request helper
function makeRequest(url, options = {}) {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);
		const protocol = urlObj.protocol === 'https:' ? https : http;

		const requestOptions = {
			hostname: urlObj.hostname,
			port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
			path: urlObj.pathname + urlObj.search,
			method: options.method || 'GET',
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; WordPressExtractor/1.0)',
				Accept: 'application/json, text/html, */*',
				...options.headers,
			},
			timeout: options.timeout || 10000,
		};

		const req = protocol.request(requestOptions, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					body: data,
				});
			});
		});

		req.on('error', (error) => {
			reject(error);
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Request timeout'));
		});

		req.end();
	});
}

// Normalize URL
function normalizeUrl(url) {
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		url = 'https://' + url;
	}
	return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Test WordPress REST API
async function testRestAPI(baseUrl) {
	const results = {
		available: false,
		version: null,
		endpoints: {},
		errors: [],
	};

	// Check if this is a WordPress.com site
	const isWordPressCom = baseUrl.includes('.wordpress.com');

	try {
		// Test root API endpoint
		const rootUrl = `${baseUrl}/wp-json/`;
		logInfo(`Testing REST API root: ${rootUrl}`);

		const rootResponse = await makeRequest(rootUrl);

		// Check for WordPress.com Link header (even on 404)
		const linkHeader = rootResponse.headers.link;
		const wpComApiMatch = linkHeader?.match(/<https:\/\/public-api\.wordpress\.com\/wp-json\/\?rest_route=([^>]+)>/);

		if (rootResponse.statusCode === 200) {
			try {
				const rootData = JSON.parse(rootResponse.body);
				results.available = true;
				results.version = rootData.namespaces?.find((ns) => ns.startsWith('wp/v')) || 'unknown';
				logSuccess('WordPress REST API is available');
				logInfo(`API Version: ${results.version}`);
			} catch (e) {
				logWarning('API root returned non-JSON response');
			}
		} else if (isWordPressCom || wpComApiMatch) {
			// WordPress.com site - use WordPress.com public API
			logInfo('WordPress.com site detected, trying WordPress.com public API...');
			results.available = true;
			results.version = 'wp.com/v1.1';
			results.isWordPressCom = true;
			logSuccess('WordPress.com public API available');
		} else {
			logError(`API root returned status ${rootResponse.statusCode}`);
			return results;
		}
	} catch (error) {
		logError(`Failed to connect to REST API: ${error.message}`);
		results.errors.push(`REST API connection: ${error.message}`);
		return results;
	}

	if (!results.available) {
		return results;
	}

	// Test various endpoints
	// WordPress.com uses different API structure
	const siteSlug = isWordPressCom
		? baseUrl.replace('https://', '').replace('http://', '').replace('.wordpress.com', '')
		: null;
	const wpComBase = isWordPressCom
		? `https://public-api.wordpress.com/rest/v1.1/sites/${siteSlug}.wordpress.com`
		: null;

	const endpoints = isWordPressCom
		? [
				{ name: 'Posts', path: `${wpComBase}/posts?number=1`, key: 'posts', isWordPressCom: true },
				{ name: 'Pages', path: `${wpComBase}/pages?number=1`, key: 'pages', isWordPressCom: true },
				{ name: 'Categories', path: `${wpComBase}/categories?number=10`, key: 'categories', isWordPressCom: true },
				{ name: 'Tags', path: `${wpComBase}/tags?number=10`, key: 'tags', isWordPressCom: true },
		  ]
		: [
				{ name: 'Site Info', path: '/wp-json/', key: 'siteInfo' },
				{ name: 'Posts', path: '/wp-json/wp/v2/posts?per_page=1', key: 'posts' },
				{ name: 'Pages', path: '/wp-json/wp/v2/pages?per_page=1', key: 'pages' },
				{ name: 'Categories', path: '/wp-json/wp/v2/categories?per_page=10', key: 'categories' },
				{ name: 'Tags', path: '/wp-json/wp/v2/tags?per_page=10', key: 'tags' },
				{ name: 'Media', path: '/wp-json/wp/v2/media?per_page=1', key: 'media' },
				{ name: 'Users', path: '/wp-json/wp/v2/users?per_page=1', key: 'users' },
				{ name: 'Themes', path: '/wp-json/wp/v2/themes', key: 'themes' },
		  ];

	for (const endpoint of endpoints) {
		try {
			const url = endpoint.isWordPressCom ? endpoint.path : `${baseUrl}${endpoint.path}`;
			const response = await makeRequest(url);

			if (response.statusCode === 200) {
				try {
					const data = JSON.parse(response.body);
					// WordPress.com API returns different structure
					const wpData =
						endpoint.isWordPressCom && data.found !== undefined
							? data.posts || data.pages || data.categories || data.tags
							: Array.isArray(data)
							? data
							: [data];
					const total =
						endpoint.isWordPressCom && data.found !== undefined
							? data.found
							: response.headers['x-wp-total']
							? parseInt(response.headers['x-wp-total'])
							: null;

					results.endpoints[endpoint.key] = {
						available: true,
						url: endpoint.path,
						data: Array.isArray(wpData) ? wpData : [wpData],
						count: Array.isArray(wpData) ? wpData.length : 1,
						total: total,
						totalPages: response.headers['x-wp-totalpages'] ? parseInt(response.headers['x-wp-totalpages']) : null,
						isWordPressCom: endpoint.isWordPressCom || false,
					};

					const totalInfo = results.endpoints[endpoint.key].total
						? ` (Total: ${results.endpoints[endpoint.key].total})`
						: '';
					logSuccess(`${endpoint.name}: Available${totalInfo}`);

					// Log sample data structure
					if (results.endpoints[endpoint.key].data.length > 0) {
						const sample = results.endpoints[endpoint.key].data[0];
						const keys = Object.keys(sample).slice(0, 5).join(', ');
						logInfo(`  Sample fields: ${keys}...`);
					}
				} catch (e) {
					results.endpoints[endpoint.key] = {
						available: false,
						error: 'Invalid JSON response',
					};
					logWarning(`${endpoint.name}: Invalid JSON response`);
				}
			} else if (response.statusCode === 404) {
				results.endpoints[endpoint.key] = {
					available: false,
					error: 'Endpoint not found',
				};
				logWarning(`${endpoint.name}: Endpoint not found (404)`);
			} else if (response.statusCode === 401 || response.statusCode === 403) {
				results.endpoints[endpoint.key] = {
					available: false,
					error: 'Authentication required',
					statusCode: response.statusCode,
				};
				logWarning(`${endpoint.name}: Authentication required (${response.statusCode})`);
			} else {
				results.endpoints[endpoint.key] = {
					available: false,
					error: `Status ${response.statusCode}`,
				};
				logWarning(`${endpoint.name}: Status ${response.statusCode}`);
			}
		} catch (error) {
			results.endpoints[endpoint.key] = {
				available: false,
				error: error.message,
			};
			logError(`${endpoint.name}: ${error.message}`);
		}
	}

	return results;
}

// Test web scraping capabilities
async function testWebScraping(baseUrl) {
	const results = {
		accessible: false,
		wordpressIndicators: [],
		extractable: {
			posts: false,
			pages: false,
			categories: false,
			tags: false,
			media: false,
		},
		errors: [],
	};

	try {
		logInfo(`Testing web scraping: ${baseUrl}`);
		const response = await makeRequest(baseUrl);

		if (response.statusCode === 200) {
			results.accessible = true;
			logSuccess('Site is accessible for scraping');

			const html = response.body;

			// Check for WordPress indicators
			const indicators = [
				{ name: 'wp-content directory', pattern: /wp-content/i, found: false },
				{ name: 'wp-includes directory', pattern: /wp-includes/i, found: false },
				{
					name: 'WordPress generator meta',
					pattern: /<meta[^>]*name=["']generator["'][^>]*content=["'][^"]*wordpress/i,
					found: false,
				},
				{ name: 'WordPress admin bar', pattern: /wp-admin-bar/i, found: false },
				{ name: 'WordPress classes', pattern: /wp-[a-z-]+/i, found: false },
			];

			indicators.forEach((indicator) => {
				if (indicator.pattern.test(html)) {
					indicator.found = true;
					results.wordpressIndicators.push(indicator.name);
					logSuccess(`Found: ${indicator.name}`);
				}
			});

			// Check for extractable content
			if (html.includes('post') || html.includes('article') || html.match(/class=["'][^"']*post/i)) {
				results.extractable.posts = true;
				logSuccess('Posts appear extractable from HTML');
			}

			if (html.includes('page') || html.match(/class=["'][^"']*page/i)) {
				results.extractable.pages = true;
				logSuccess('Pages appear extractable from HTML');
			}

			if (html.includes('category') || html.match(/\/category\//i)) {
				results.extractable.categories = true;
				logSuccess('Categories appear extractable from HTML');
			}

			if (html.includes('tag') || html.match(/\/tag\//i)) {
				results.extractable.tags = true;
				logSuccess('Tags appear extractable from HTML');
			}

			if (html.match(/<img[^>]+src=/i) || html.match(/wp-content\/uploads/i)) {
				results.extractable.media = true;
				logSuccess('Media appears extractable from HTML');
			}

			// Check for RSS feeds
			const rssPattern = /<link[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i;
			const rssMatch = html.match(rssPattern);
			if (rssMatch) {
				logSuccess(`RSS feed found: ${rssMatch[1]}`);
			}
		} else {
			logError(`Site returned status ${response.statusCode}`);
			results.errors.push(`HTTP ${response.statusCode}`);
		}
	} catch (error) {
		logError(`Failed to scrape site: ${error.message}`);
		results.errors.push(error.message);
	}

	return results;
}

// Test CORS
async function testCORS(baseUrl) {
	try {
		const testUrl = `${baseUrl}/wp-json/wp/v2/posts?per_page=1`;
		const response = await makeRequest(testUrl, {
			headers: {
				Origin: 'https://example.com',
			},
		});

		const corsHeaders = {
			'access-control-allow-origin': response.headers['access-control-allow-origin'],
			'access-control-allow-methods': response.headers['access-control-allow-methods'],
			'access-control-allow-headers': response.headers['access-control-allow-headers'],
		};

		if (corsHeaders['access-control-allow-origin']) {
			logSuccess('CORS is enabled');
			logInfo(`  Allow-Origin: ${corsHeaders['access-control-allow-origin']}`);
			return { enabled: true, headers: corsHeaders };
		} else {
			logWarning('CORS is not enabled (may need proxy for browser requests)');
			return { enabled: false, headers: corsHeaders };
		}
	} catch (error) {
		logWarning(`CORS test failed: ${error.message}`);
		return { enabled: false, error: error.message };
	}
}

// Generate summary report
function generateReport(apiResults, scrapingResults, corsResults, url) {
	logSection('EXTRACTION CAPABILITIES REPORT');

	console.log('\n📋 SUMMARY');
	console.log(`Site URL: ${url}`);
	console.log(`\nREST API: ${apiResults.available ? '✅ Available' : '❌ Not Available'}`);
	console.log(`Web Scraping: ${scrapingResults.accessible ? '✅ Accessible' : '❌ Not Accessible'}`);
	console.log(`CORS: ${corsResults.enabled ? '✅ Enabled' : '⚠️  Not Enabled'}`);

	console.log('\n📊 EXTRACTABLE DATA:');

	if (apiResults.available) {
		console.log('\nVia REST API:');
		Object.entries(apiResults.endpoints).forEach(([key, endpoint]) => {
			const status = endpoint.available ? '✅' : '❌';
			const count = endpoint.total ? ` (${endpoint.total} items)` : '';
			console.log(`  ${status} ${key}: ${endpoint.available ? 'Available' : endpoint.error}${count}`);
		});
	}

	if (scrapingResults.accessible) {
		console.log('\nVia Web Scraping:');
		Object.entries(scrapingResults.extractable).forEach(([key, available]) => {
			console.log(`  ${available ? '✅' : '❌'} ${key}: ${available ? 'Extractable' : 'Not extractable'}`);
		});
	}

	console.log('\n📝 RECOMMENDED EXTRACTION METHOD:');
	if (apiResults.available) {
		console.log('  ✅ Use REST API (preferred method)');
		if (!corsResults.enabled) {
			console.log('  ⚠️  Note: CORS not enabled - may need server-side proxy for browser requests');
		}
	} else if (scrapingResults.accessible) {
		console.log('  ✅ Use Web Scraping (fallback method)');
		console.log('  ⚠️  Note: More complex, may need HTML parsing library');
	} else {
		console.log('  ❌ Neither method available - site may not be WordPress or is blocked');
	}

	console.log('\n📦 DATA STRUCTURE SAMPLE:');
	if (apiResults.endpoints.posts?.available && apiResults.endpoints.posts.data.length > 0) {
		const post = apiResults.endpoints.posts.data[0];
		console.log('\nSample Post Structure:');
		console.log(
			JSON.stringify(
				{
					id: post.id,
					title: post.title?.rendered || post.title,
					content: post.content?.rendered ? `${post.content.rendered.substring(0, 100)}...` : post.content,
					excerpt: post.excerpt?.rendered || post.excerpt,
					date: post.date,
					status: post.status,
					categories: post.categories,
					tags: post.tags,
					featured_media: post.featured_media,
					author: post.author,
					slug: post.slug,
				},
				null,
				2
			)
		);
	}

	if (apiResults.endpoints.categories?.available && apiResults.endpoints.categories.data.length > 0) {
		const category = apiResults.endpoints.categories.data[0];
		console.log('\nSample Category Structure:');
		console.log(
			JSON.stringify(
				{
					id: category.id,
					name: category.name,
					slug: category.slug,
					description: category.description,
					parent: category.parent,
					count: category.count,
				},
				null,
				2
			)
		);
	}

	console.log('\n' + '='.repeat(60));
}

// Main function
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		logError('Please provide a WordPress site URL');
		console.log('\nUsage: node scripts/test-wordpress-extraction.js <wordpress-url>');
		console.log('Example: node scripts/test-wordpress-extraction.js https://example.com');
		process.exit(1);
	}

	const inputUrl = args[0];
	const baseUrl = normalizeUrl(inputUrl);

	logSection('WORDPRESS SITE EXTRACTION TEST');
	logInfo(`Testing site: ${baseUrl}`);

	// Test REST API
	logSection('TESTING REST API');
	const apiResults = await testRestAPI(baseUrl);

	// Test Web Scraping
	logSection('TESTING WEB SCRAPING');
	const scrapingResults = await testWebScraping(baseUrl);

	// Test CORS
	logSection('TESTING CORS');
	const corsResults = await testCORS(baseUrl);

	// Generate report
	generateReport(apiResults, scrapingResults, corsResults, baseUrl);
}

// Run the script
main().catch((error) => {
	logError(`Fatal error: ${error.message}`);
	console.error(error);
	process.exit(1);
});
