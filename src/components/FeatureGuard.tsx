import React from 'react';
import { FEATURES } from 'helpers/features';

interface FeatureGuardProps {
	feature: keyof typeof FEATURES;
	fallback?: React.ReactNode;
	children: React.ReactNode;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ feature, fallback = null, children }) => {
	if (!FEATURES[feature]) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

// Usage examples:
export const DomainManagement = ({ children }: { children: React.ReactNode }) => (
	<FeatureGuard feature="DOMAIN_MANAGEMENT" fallback={<div>Domain management is not available</div>}>
		{children}
	</FeatureGuard>
);

export const FileUploads = ({ children }: { children: React.ReactNode }) => (
	<FeatureGuard feature="FILE_UPLOADS" fallback={<div>File uploads are not available</div>}>
		{children}
	</FeatureGuard>
);
