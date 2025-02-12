/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { PublishPackage, SandboxItem } from '../../models';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { PersonAvatar } from '../DashletCard/dashletCommons';
import { getPersonFullName } from '../SiteDashboard';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import React from 'react';

export interface PublishPackageReviewProps {
	publishPackage: PublishPackage;
}

const statusItems = {
	staging: { stateMap: { staged: true } },
	live: { stateMap: { live: true } }
};

export function PublishPackageReview(props: PublishPackageReviewProps) {
	const { publishPackage } = props;

	return (
		<Box>
			<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
				<FormattedMessage defaultMessage="Submitter" />
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<PersonAvatar person={publishPackage.submitter} />
				<Typography variant="body1" sx={{ ml: 1 }}>
					{getPersonFullName(publishPackage.submitter)}
				</Typography>
			</Box>
			<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
				<FormattedMessage defaultMessage="Package Title" />
			</Typography>
			<Typography variant="body1" sx={{ mb: 2 }}>
				{publishPackage.title}
			</Typography>
			<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
				<FormattedMessage defaultMessage="Submission Comment" />
			</Typography>
			<Typography variant="body1" sx={{ mb: 2 }}>
				{publishPackage.submitterComment || <FormattedMessage defaultMessage="No submission comment provided" />}
			</Typography>
			<Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
				<FormattedMessage defaultMessage="Publishing Target" />
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
				<ItemPublishingTargetIcon item={statusItems[publishPackage.target] as SandboxItem} />
				<Typography variant="body1" component="span">
					{publishPackage.target === 'live' ? (
						<FormattedMessage defaultMessage="Live" />
					) : (
						<FormattedMessage defaultMessage="Staging" />
					)}
				</Typography>
			</Box>
		</Box>
	);
}
