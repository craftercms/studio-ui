/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { PREVIEW_URL_PATH } from './constants';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import Monaco from '../models/Monaco';
import { ProjectToolsRoutes } from '../env/routes';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';
import { pushDialog } from '../state/actions/dialogStack';
import type { FormsEngineProps } from '../components/FormsEngine/FormsEngine';
import { getHostToGuestBus } from './subjects';
import { reloadRequest } from '../state/actions/preview';
import { Context, useContext } from 'react';
import type { LegacyFormDialogProps } from '../components/LegacyFormDialog/utils';
import { nanoid } from 'nanoid';
import { DialogStackItem } from '../models';
import type { ConfirmDialogProps, ErrorDialogProps } from '../components';

export type SystemLinkId =
	| 'preview'
	| 'siteTools'
	| 'siteSearch'
	| 'siteDashboard'
	| 'siteToolsDialog'
	| 'siteSearchDialog'
	| 'siteDashboardDialog';

export function getSystemLink({
	systemLinkId,
	authoringBase,
	site,
	page = '/'
}: {
	systemLinkId: SystemLinkId;
	authoringBase: string;
	site: string;
	page?: string;
}) {
	return {
		preview: `${authoringBase}${PREVIEW_URL_PATH}#/?page=${encodeURIComponent(page)}&site=${site}`,
		siteTools: `${authoringBase}${ProjectToolsRoutes.ProjectTools}`,
		siteSearch: `${authoringBase}${ProjectToolsRoutes.Search}`,
		siteDashboard: `${authoringBase}${ProjectToolsRoutes.SiteDashboard}`
	}[systemLinkId];
}

export function copyToClipboard(textToCopy: string): Promise<void> {
	// Clipboard is only available on user-initiated callbacks over non-secure contexts (e.g. not https).
	return (
		navigator.clipboard?.writeText(textToCopy) ??
		new Promise((resolve, reject) =>
			reject('Copying to clipboard is only available in secure contexts or user-initiated callbacks.')
		)
	);
}

let monaco$: ReplaySubject<Monaco>;
export function withMonaco(onReady: (api: Monaco) => void): void {
	if (!monaco$) {
		monaco$ = new ReplaySubject(1);
		const script = document.createElement('script');
		script.src = '/studio/static-assets/libs/monaco/monaco.0.53.0.js';
		script.onload = () => {
			// @ts-ignore
			monaco$.next(window.monaco);
		};
		script.onerror = () => {
			console.error('Monaco editor could not be loaded');
		};
		document.head.appendChild(script);
	}
	monaco$.asObservable().pipe(take(1)).subscribe(onReady);
}

export function isPreviewAppUrl(pathname = window.location.pathname): boolean {
	return pathname.includes(`/preview`);
}

export function isDashboardAppUrl(pathname = window.location.pathname): boolean {
	return pathname.includes(ProjectToolsRoutes.SiteDashboard);
}

export function isProjectToolsAppUrl(pathname = window.location.pathname): boolean {
	return pathname.includes(ProjectToolsRoutes.ProjectTools);
}

export function consolidateSx(...sxs: SxProps<Theme>[]): SxProps<Theme> {
	return sxs.flatMap((item) => item ?? []);
}

export function pickShowContentFormAction(oldProps: LegacyFormDialogProps) {
	const useLegacy = window.localStorage.getItem('useLegacyFormEngine') === 'true';
	const dialogId = nanoid();
	return useLegacy
		? pushDialog({
				id: dialogId,
				component: createComponentId('LegacyFormDialog'),
				allowFullScreen: true,
				allowMinimize: true,
				props: { ...oldProps, dialogId }
			})
		: pushDialog({
				component: createComponentId('FormsEngineDialog'),
				allowFullScreen: true,
				allowMinimize: true,
				props: {
					formProps: {
						...(oldProps.isNewContent
							? { create: { path: oldProps.path, contentTypeId: oldProps.contentTypeId } }
							: { update: { path: oldProps.path } }),
						readonly: oldProps.readonly ?? false,
						onSave() {
							if (isPreviewAppUrl()) getHostToGuestBus().next(reloadRequest());
							// FE2 TODO: handling oldProps.onSaveSuccess required?
						}
					} as FormsEngineProps
				}
			});
}

export function createUseContextHook<T>(name: string, context: Context<T>): () => T;
export function createUseContextHook<T, K extends keyof T>(
	name: string,
	context: Context<T>,
	selector: (instance: T) => T[K]
): () => T[K];
export function createUseContextHook<T, K extends keyof T>(
	name: string,
	context: Context<T>,
	selector?: (instance: T) => T[K]
): () => T | T[K] {
	const contextName = context.displayName ?? name.replace('use', '');
	return () => {
		const instance = useContext(context);
		if (instance === undefined) {
			throw new Error(`${name} must be used within a ${contextName}`);
		}
		return selector?.(instance) ?? instance;
	};
}

export function createComponentId(componentName: string) {
	return `craftercms.components.${componentName}`;
}

type confirmDialogStackItemProps = Partial<DialogStackItem<Partial<ConfirmDialogProps>>>;
export function pushConfirmDialog(props: Omit<confirmDialogStackItemProps, 'component'>) {
	return pushDialog({
		component: createComponentId('ConfirmDialog'),
		...props
	});
}

type errorDialogStackItemProps = Partial<DialogStackItem<Partial<ErrorDialogProps>>>;
export function pushErrorDialog(props: Omit<errorDialogStackItemProps, 'component'>) {
	return pushDialog({
		component: createComponentId('ErrorDialog'),
		...props
	});
}
