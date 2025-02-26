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

import * as React from 'react';
import PublishingQueue, { PublishingQueueProps } from './PublishingQueue';
import Paper from '@mui/material/Paper';
import DialogHeader from '../DialogHeader';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';

export function PublishingQueueWidget(props: PublishingQueueProps) {
	return (
		<Paper elevation={2}>
			<DialogHeader title={<FormattedMessage id="publishingQueue.title" defaultMessage="Publishing Queue" />} />
			<Box sx={{ backgroundColor: (theme) => theme.palette.background.default, padding: '16px' }}>
				<PublishingQueue {...props} />
			</Box>
		</Paper>
	);
}

export default PublishingQueueWidget;
