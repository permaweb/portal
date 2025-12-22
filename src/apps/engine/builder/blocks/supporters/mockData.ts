import { SupporterTip } from 'helpers/types';

const MOCK_NAMES = [
	'Alice Johnson',
	'Bob Smith',
	'Carol Williams',
	'David Brown',
	'Eve Davis',
	'Frank Miller',
	'Grace Wilson',
	'Henry Moore',
	'Ivy Taylor',
	'Jack Anderson',
	'Karen Thomas',
	'Leo Jackson',
	'Mary White',
	'Nathan Harris',
	'Olivia Martin',
];

const MOCK_ADDRESSES = [
	'1LlNJkDO11_IQcXRDp53-ycYDy2nVVAsaKpjkbbvS1k',
	'2MmOKpEP22_JRdYSp64-zdYEz3oWWBtbTLpkjccwT2m',
	'3NnPLqFQ33_KSeZTq75-aeZFa4pXXCucUMqlkddxU3n',
	'4OoQMrGR44_LTfaUr86-bfaGb5qYYDvdVNrmleeYV4o',
	'5PpRNsHS55_MUgbVs97-cgbHc6rZZEweWOsNmffZW5p',
	'6QqSOtIT66_NVhcWt08-dhaId7saAFxfXPtOngGaX6q',
	'7RrTPuJU77_OWidXu19-eibJe8tbBGyGYQuPohHbY7r',
	'8SsUQvKV88_PXjeYv20-fjcKf9ucCHzHZRvQpiIcZ8s',
	'9TtVRwLW99_QYkfZw31-gkdLg0vdDI0IaSWRqjJda9t',
	'0UuWSxMX00_RZlgax42-hleMh1weDJ1JbTXSrkKebu0',
	'1VvXTyNY11_SamHby53-imfNi2xfEK2KcUYTslLfcv1',
	'2WwYUzOZ22_TbnIcz64-jngOj3ygFL3LdVZUtmmGdw2',
	'3XxZVaPa33_UcoJda75-kohPk4zhGM4MeWaVunnHex3',
	'4YyaWbQb44_VdpKeb86-lpiqL5aiHN5NfXbWvooIfy4',
	'5ZzbXcRc55_WeqLfc97-mqjrM6bjIO6OgYcXwppJgz5',
];

export function generateMockSupporters(count: number = 15): SupporterTip[] {
	const supporters: SupporterTip[] = [];
	const now = Date.now() / 1000; // Unix timestamp in seconds

	for (let i = 0; i < Math.min(count, MOCK_NAMES.length); i++) {
		// Generate random amount between 0.1 and 10 AR
		const amount = (Math.random() * 9.9 + 0.1).toFixed(4);
		const winston = (parseFloat(amount) * 1e12).toString();

		// Generate random timestamp within last 30 days
		const daysAgo = Math.random() * 30;
		const timestamp = Math.floor(now - daysAgo * 24 * 60 * 60);

		supporters.push({
			id: `mock-tip-${i}`,
			timestamp,
			amountAr: amount,
			winston,
			fromAddress: MOCK_ADDRESSES[i],
			fromProfile: `mock-profile-${i}`,
			fromName: MOCK_NAMES[i],
			fromAvatar: undefined,
			location: Math.random() > 0.5 ? 'page' : 'post',
		});
	}

	return supporters;
}
