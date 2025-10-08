import { ANT, ARIO, ArweaveSigner } from '@ar.io/sdk';

(async () => {
	try {
		const ARNS_NAME = process.env.ARNS_NAME;
		const UNDERNAME = process.env.UNDERNAME;
		const DEPLOY_KEY = process.env.DEPLOY_KEY;

		if (!ARNS_NAME || !UNDERNAME || !DEPLOY_KEY) {
			console.error(
				"Usage: ARNS_NAME=<base name> UNDERNAME=<undername> DEPLOY_KEY='<wallet JWK JSON>' node release-undername.js"
			);
			process.exit(1);
		}

		const jsonString = atob(process.env.DEPLOY_KEY);
		const jwk = JSON.parse(jsonString);
		const signer = new ArweaveSigner(jwk);

		// Find the ANT process that owns the base name (e.g., "portalenv")
		const ario = ARIO.mainnet();
		const { processId } = await ario.getArNSRecord({ name: ARNS_NAME });

		if (!processId) {
			throw new Error(`Could not resolve ANT process for ${ARNS_NAME}`);
		}

		const ant = ANT.init({ processId, signer });

		try {
			await ant.removeUndernameRecord({ undername: UNDERNAME });
		} catch (e) {
			throw new Error('ANT remove undername method not found on this SDK version');
		}

		console.log(`✅ Released undername "${UNDERNAME}" from ${ARNS_NAME}`);
	} catch (err) {
		console.error('❌ Failed to release undername:', err?.message || err);
		process.exit(1);
	}
})();
