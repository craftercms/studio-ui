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

import { Theme } from '@mui/material/styles';
import { PublishingStatusCodes } from '../../models';

export const getPublishingStatusCodeColor = (code: PublishingStatusCodes, theme: Theme) => {
	switch (code) {
		case 'ready':
		case 'publishing': {
			return theme.palette.success.main;
		}
		case 'stopped': {
			return theme.palette.error.main;
		}
	}
	// region Compiler hints
	// Var below is for typescript to complain if we ever add/remove codes.
	// eslint-disable-next-line no-unreachable,@typescript-eslint/no-unused-vars
	const control: Record<PublishingStatusCodes, any> = {
		publishing: undefined,
		ready: undefined,
		stopped: undefined
	};
	// endregion
};
