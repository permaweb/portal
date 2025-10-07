const processes = [
	'RhguwWmQJ-wWCXhRH_NtTDHRRgfCqNDZckXtJK52zKs',
	'GKq5Ntih-UrUd3e4mCMQKIDzQNKAutm9d02vIsOI22c',
	'AkYCapq3Vh5BgHwZ-78xW8MyYsfcAiniiQDJPkAxQwk',
	'_yrKMZgXrKRGzOHVGnLs0loYqguDWoky6GBLtXkOjU4',
	'MnStjqzzLhtywkQKpyL8xYWbxsq1GbuS1OjRcLXKsQI',
	'2qGS9rGidhOjlXIOogOcOSdvoEqr5OWhuxMdDXDiDF4',
	'xmbVURrJAPE2FgheP26cb8YRzjXRTl6EFEzMDmReo74',
	'fFWc63RvF3N1xTxl1m_CmCFuAR2ZdHgBgTcVX5m_-B0',
	'vUDMsji1Qsx-HSIv7joMeMrpX6aOZyFN0vCF2P7g2eQ',
	'Ho6lVhGflO0xBpOlREbgOWqy3CqRb-OUjsi_sr4KXdc',
];

// const url = 'https://hb.portalinto.com';
const url = 'http://localhost:8734';

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
