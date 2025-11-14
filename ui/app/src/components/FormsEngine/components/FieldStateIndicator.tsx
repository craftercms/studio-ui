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

import React, { type ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import Asterisk from '../../../icons/Asterisk';
import type { SvgIconComponent } from '@mui/icons-material/esm';
import CheckRounded from '@mui/icons-material/CheckRounded';

export type FieldStateIndicatorProps = {
	isRequired: boolean;
	hasValidator: boolean;
	isValid: boolean;
	isEmpty: boolean;
};

export function FieldStateIndicator({ isRequired, hasValidator, isValid, isEmpty }: FieldStateIndicatorProps) {
	let IndicatorComponent: SvgIconComponent | null = null;
	let MessageComponent: ReactNode = null;

	// If there is no requirement and no validator and the field is empty, do not show any indicator
	if (!isRequired && !hasValidator && isEmpty) return undefined;

	if (isRequired || (!isRequired && hasValidator && !isValid)) {
		// If required, or if not required but has a validator and is invalid, show asterisk (color depdends on isValid)
		IndicatorComponent = Asterisk;
		if (isValid) {
			MessageComponent = CompleteMessage;
		} else if (isRequired && isEmpty) {
			MessageComponent = RequiredMessage;
		} else {
			MessageComponent = InvalidMessage;
		}
	} else {
		// Otherwise, show check mark
		IndicatorComponent = CheckRounded;
		MessageComponent = CompleteMessage;
	}

	return (
		<Tooltip title={MessageComponent}>
			<IndicatorComponent fontSize="small" color={isValid ? 'success' : 'error'} />
		</Tooltip>
	);
}

const CompleteMessage = <FormattedMessage defaultMessage="Complete" />;
const RequiredMessage = <FormattedMessage defaultMessage="Required" />;
const InvalidMessage = <FormattedMessage defaultMessage="Invalid" />;

export default FieldStateIndicator;
