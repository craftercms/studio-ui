/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import type { ContentItem } from '../../models';
import { Dispatch } from 'redux';
import { nanoid } from 'nanoid';
import { popDialog, pushDialog } from '../../state/actions/dialogStack';
import { cancelPackages, fetchAffectedPackages } from '../../services/workflow';

export function checkAndCancelAffectedPackages({
	siteId,
	item,
	dispatch,
	onContinue,
	onClose,
	cancelPackagesMessage
}: {
	siteId: string;
	item: ContentItem;
	dispatch: Dispatch;
	onContinue: () => void;
	onClose?: () => void;
	cancelPackagesMessage?: string;
}) {
	fetchAffectedPackages(siteId, item.path).subscribe({
		next: (affectedPackages) => {
			if (!affectedPackages || affectedPackages.length === 0) {
				onContinue();
			} else {
				const dialogId = nanoid();
				dispatch(
					pushDialog({
						id: dialogId,
						component: 'craftercms.components.ViewPackagesDialog',
						props: {
							item,
							onContinue: () => {
								cancelPackages(siteId, {
									packageIds: affectedPackages.map((p) => p.id),
									// TODO: Correct comment generation
									comment: cancelPackagesMessage ?? `Cancel affected packages of "${item.path}"`
								}).subscribe({
									next: () => onContinue(),
									error: ({ response }) => {
										dispatch(
											pushDialog({
												component: 'craftercms.components.ErrorDialog',
												props: { error: response?.response }
											})
										);
									}
								});
							},
							onClose: () => {
								dispatch(popDialog({ id: dialogId }));
								onClose?.();
							}
						}
					})
				);
			}
		},
		error: ({ response }) => {
			dispatch(
				pushDialog({
					component: 'craftercms.components.ErrorDialog',
					props: { error: response.response }
				})
			);
		}
	});
}
