import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useStartOAuth } from '@/api';
import type { ICreateCredentialDto } from '@/types/credential.type';

interface IUseOAuthPopupOptions {
	workspaceId: string;
	onSuccess: () => void;
}

export const useOAuthPopup = ({ workspaceId, onSuccess }: IUseOAuthPopupOptions) => {
	const startOAuth = useStartOAuth(workspaceId);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const oauthStatus = params.get('oauth');
		const success = params.get('success');
		const credentialId = params.get('credential_id');

		if (oauthStatus === 'success' || success === 'true' || credentialId) {
			if (window.opener) {
				window.opener.postMessage(
					{ type: 'oauth_callback', status: 'success', credentialId },
					window.location.origin,
				);
				window.close();
				return;
			}

			toast.success('OAuth credential connected');
			onSuccess();
			window.history.replaceState({}, '', window.location.pathname);
		}

		if (oauthStatus === 'error') {
			const errorDesc =
				params.get('error_description') ||
				params.get('error') ||
				'OAuth authentication failed';

			if (window.opener) {
				window.opener.postMessage(
					{ type: 'oauth_callback', status: 'error', error: errorDesc },
					window.location.origin,
				);
				window.close();
				return;
			}

			toast.error(`OAuth failed: ${errorDesc}`);
			window.history.replaceState({}, '', window.location.pathname);
		}
	}, [onSuccess]);

	const launch = async (values: ICreateCredentialDto, selectedUserIds?: string[]) => {
		if (!workspaceId) return;

		const provider = values.data.provider;
		if (typeof provider !== 'string') {
			toast.error('OAuth provider is missing');
			return;
		}

		const response = await startOAuth.mutateAsync({
			provider,
			credentialName: values.name,
			redirectUrl: `${window.location.origin}/app/oauth/callback`,
			sharingScope: values.sharing_scope,
			userIds: selectedUserIds,
		});

		const width = 600;
		const height = 700;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;
		const popup = window.open(
			response.url,
			'oauth_popup',
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
		);

		if (!popup) {
			toast.error('Allow popups to connect OAuth credentials');
			return;
		}
		const popupWindow = popup;

		const checkPopupClosed = window.setInterval(() => {
			if (popupWindow.closed) {
				window.clearInterval(checkPopupClosed);
				window.removeEventListener('message', handleMessage);
				onSuccess();
			}
		}, 500);

		const timeout = window.setTimeout(
			() => {
				window.clearInterval(checkPopupClosed);
				window.removeEventListener('message', handleMessage);
			},
			5 * 60 * 1000,
		);

		function handleMessage(event: MessageEvent) {
			if (event.origin !== window.location.origin) return;
			if (event.data?.type !== 'oauth_callback') return;

			window.clearInterval(checkPopupClosed);
			window.clearTimeout(timeout);
			window.removeEventListener('message', handleMessage);
			popupWindow.close();

			if (event.data.status === 'success') {
				toast.success('OAuth credential connected');
				onSuccess();
			} else {
				toast.error(event.data.error || 'OAuth authentication failed');
			}
		}

		window.addEventListener('message', handleMessage);
	};

	return { launch, isPending: startOAuth.isPending };
};
