/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import Tooltip from '@mui/material/Tooltip';
import type { SwitchProps } from '@mui/material/Switch';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { disableKeyboardShortcuts as disableKeyboardShortcutsAction } from '../../state/actions/preview';
import useSelection from '../../hooks/useSelection';
import { Switch } from '@mui/material';
import { setStoredDisabledKeyboardShortcutsState } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';
import { ChangeEvent } from 'react';

export function DisableKeyboardShortcutsSwitch(props: SwitchProps) {
	const dispatch = useDispatch();
	const shortcutsDisabled = useSelection((state) => state.preview.disableKeyboardShortcuts);
	const { username } = useActiveUser();

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		setStoredDisabledKeyboardShortcutsState(e.target.checked, username);
		dispatch(disableKeyboardShortcutsAction({ disabled: e.target.checked }));
	};

	return (
		<Tooltip
			title={
				shortcutsDisabled ? (
					<FormattedMessage defaultMessage="Enable shortcuts" />
				) : (
					<FormattedMessage defaultMessage="Disable shortcuts" />
				)
			}
		>
			<Switch {...props} checked={shortcutsDisabled} onChange={onChange} />
		</Tooltip>
	);
}

export default DisableKeyboardShortcutsSwitch;
