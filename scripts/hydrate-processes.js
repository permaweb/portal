const processes = [
	'RhguwWmQJ-wWCXhRH_NtTDHRRgfCqNDZckXtJK52zKs',
	'GKq5Ntih-UrUd3e4mCMQKIDzQNKAutm9d02vIsOI22c',
	'AkYCapq3Vh5BgHwZ-78xW8MyYsfcAiniiQDJPkAxQwk',
	'_yrKMZgXrKRGzOHVGnLs0loYqguDWoky6GBLtXkOjU4',
];

const url = 'https://hb.portalinto.com';

(async function () {
	for (const processId of processes) {
		try {
			console.log(`Hydrating process: ${processId}...`);
			const res = await fetch(`${url}/${processId}~process@1.0/now`, {});
			console.log(`Status: ${res.status}`);
		} catch (e) {
			console.error(`Error hydrating process: ${processId}`, e);
		}
	}
})();
