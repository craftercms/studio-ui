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

import { useStore } from 'react-redux';
import { hasMinimizedBar } from '../components/MinimizedBarPortal/minimizedBarCounter';
import infoGraphic from '../assets/information.svg';
import { defineMessages, useIntl } from 'react-intl';
import { popDialog } from '../state/actions/dialogStack';
import { nanoid } from 'nanoid';
import { pushConfirmDialog } from '../utils/system';

const messages = defineMessages({
	main: {
		id: 'common.minimizedDialogSiteSwitchCheck',
		defaultMessage: 'Please close any minimized dialogs before switching sites'
	}
});

export function useMinimizedDialogWarning() {
	const store = useStore();
	const { formatMessage } = useIntl();
	return () => {
		if (hasMinimizedBar()) {
			const dialogId = nanoid();
			store.dispatch(
				pushConfirmDialog({
					id: dialogId,
					props: {
						body: formatMessage(messages.main),
						imageUrl: infoGraphic,
						onOk: () => store.dispatch(popDialog({ id: dialogId }))
					}
				})
			);
			return true;
		} else {
			return false;
		}
	};
}

export default useMinimizedDialogWarning;
