const processes = [
	// 'yEjDfAy09teV3h3eRjtOBMWi0XxR1OHaoT-agm5_a28',
	// '1RizbzhMUcXrNRB_5JPk6bDvY7LgknSEILBmbTnid1M'
];

const url = 'http://localhost:8734';

(async function () {
	for (const processId of processes) {
		try {
			console.log(`Hydrating process: ${processId}...`);
			const res = await fetch(`${url}/~cron@1.0/once?cron-path=${processId}~process@1.0/now`, {});
			console.log(`Status: ${res.status}`);

			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (e) {
			console.error(`Error hydrating process: ${processId}`, e);
		}
	}
})();
