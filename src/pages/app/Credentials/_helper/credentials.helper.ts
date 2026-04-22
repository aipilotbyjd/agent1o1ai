import type { IServiceWithStatus } from '@/config/services.config';
import { SERVICES } from '@/config/services.config';
import type { ICredentialDetail } from '@/types/credential.type';

export const getCredentialDataSource = (
	credential: ICredentialDetail,
): Record<string, unknown> => {
	if (
		credential.type === 'custom' &&
		credential.data?.data &&
		typeof credential.data.data === 'object'
	) {
		return credential.data.data as Record<string, unknown>;
	}
	return credential.data || {};
};

export const findServiceForCredential = (
	credential: ICredentialDetail,
): IServiceWithStatus | null => {
	const service =
		SERVICES.find(
			(candidate) =>
				candidate.oauthProvider === credential.provider ||
				candidate.id === credential.provider,
		) ||
		SERVICES.find(
			(candidate) =>
				candidate.credentialType === credential.type &&
				(credential.type !== 'oauth2' || candidate.authType === 'oauth'),
		);

	return service
		? { ...service, isAvailable: true, isOAuthConfigured: service.authType === 'oauth' }
		: null;
};

export const buildCredentialData = (
	service: IServiceWithStatus,
	formData: Record<string, string | number>,
): Record<string, unknown> => {
	const credentialData: Record<string, unknown> = {};
	service.fields?.forEach((field) => {
		const value = formData[field.name];
		if (value !== undefined && value !== '') credentialData[field.name] = value;
	});

	return service.credentialType === 'custom' ? { data: credentialData } : credentialData;
};
