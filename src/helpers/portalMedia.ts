import { PortalUploadType } from './types';

export async function registerPortalUpload(args: {
	portalId: string;
	wallet: any;
	libs: any;
	upload: PortalUploadType;
	uploads?: PortalUploadType[];
	waitForUpdate?: (messageId: string) => Promise<any>;
}): Promise<PortalUploadType[]> {
	const { portalId, wallet, libs, upload, waitForUpdate } = args;
	if (!portalId || !wallet || !libs) throw new Error('A portal and connected wallet are required to add media');
	const uploads = args.uploads ?? [];
	if (uploads.some((entry) => entry.tx === upload.tx)) return uploads;
	const updatedUploads = [...uploads, upload];

	if (libs.addPortalUpload) {
		await libs.addPortalUpload(portalId, upload);
	} else {
		const updateId = await libs.updateZone({ Uploads: libs.mapToProcessCase(updatedUploads) }, portalId, wallet);
		if (!updateId) throw new Error('The media library update was not submitted');
		if (waitForUpdate) {
			const result = await waitForUpdate(updateId);
			if (result?.Error) throw new Error(result.Error);
			const failedMessage = result?.Messages?.find(
				(message: any) =>
					message.Error ||
					message.Tags?.some(
						(tag: any) =>
							tag.name === 'Error' ||
							((tag.name === 'Action' || tag.name === 'Status') && /(?:^|-)(error|failed)$/i.test(tag.value))
					)
			);
			if (failedMessage)
				throw new Error(failedMessage.Error || failedMessage.Data || 'The media library update failed');
		}
	}

	return updatedUploads;
}
