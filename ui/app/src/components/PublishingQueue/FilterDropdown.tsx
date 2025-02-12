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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';
import React from 'react';
import Popover from '@mui/material/Popover';
import { defineMessages, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { CurrentFilters } from '../../models/Publishing';
import { Checkbox, FormGroup, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import { packageStatesMap } from '../PublishPackageReviewDialog/utils';
import { allFiltersState } from './PublishingQueue';

const messages: any = defineMessages({
	pathExpression: {
		id: 'publishingDashboard.pathExpression',
		defaultMessage: 'Path Expression'
	},
	environment: {
		id: 'common.publishingTarget',
		defaultMessage: 'Publishing Target'
	},
	state: {
		id: 'publishingDashboard.state',
		defaultMessage: 'State'
	},
	all: {
		id: 'publishingDashboard.all',
		defaultMessage: 'All'
	},
	ready: {
		id: 'publishingDashboard.ready',
		defaultMessage: 'Ready for Live'
	},
	processing: {
		id: 'publishingDashboard.processing',
		defaultMessage: 'Processing'
	},
	liveSuccess: {
		id: 'publishingDashboard.liveSuccess',
		defaultMessage: 'Live Success'
	},
	liveCompletedWithErrors: {
		id: 'publishingDashboard.liveCompletedWithErrors',
		defaultMessage: 'Live Completed with Errors'
	},
	liveFailed: {
		id: 'publishingDashboard.liveFailed',
		defaultMessage: 'Live Failed'
	},
	stagingSuccess: {
		id: 'publishingDashboard.stagingSuccess',
		defaultMessage: 'Staging Success'
	},
	stagingCompletedWithErrors: {
		id: 'publishingDashboard.stagingCompletedWithErrors',
		defaultMessage: 'Staging Completed with Errors'
	},
	stagingFailed: {
		id: 'publishingDashboard.stagingFailed',
		defaultMessage: 'Staging Failed'
	},
	completed: {
		id: 'publishingDashboard.completed',
		defaultMessage: 'Completed'
	},
	cancelled: {
		id: 'publishingDashboard.cancelled',
		defaultMessage: 'Cancelled'
	}
});

interface FilterDropdownProps {
	text: string;
	className?: any;
	sx?: SxProps<Theme>;
	currentFilters: CurrentFilters;
	filters: any;
	handleFilterChange(event: any): any;
}

export function FilterDropdown(props: FilterDropdownProps) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const { text, className, handleFilterChange, currentFilters, filters, sx } = props;
	const { formatMessage } = useIntl();

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<Button variant="outlined" onClick={handleClick} sx={sx} className={className}>
				{text} <ArrowDropDownIcon />
			</Button>
			<Popover
				id="publishingFilterDropdown"
				anchorEl={anchorEl}
				slotProps={{ paper: { sx: { width: '300px' } } }}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
			>
				<section>
					<Box
						component="header"
						sx={(theme) => ({
							background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey['100'],
							padding: '10px'
						})}
					>
						<Typography variant="body1">
							<strong>{formatMessage(messages.environment)}</strong>
						</Typography>
					</Box>
					<Box sx={{ width: '100%', padding: '5px 15px 20px 15px' }}>
						<RadioGroup
							aria-label={formatMessage(messages.environment)}
							name="target"
							value={currentFilters.target}
							onChange={handleFilterChange}
						>
							<FormControlLabel value="" control={<Radio color="primary" />} label={formatMessage(messages.all)} />
							{filters.environments &&
								filters.environments.map((filter: string, index: number) => (
									<FormControlLabel key={index} value={filter} control={<Radio color="primary" />} label={filter} />
								))}
						</RadioGroup>
					</Box>
				</section>
				<section>
					<Box
						component="header"
						sx={(theme) => ({
							background: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey['100'],
							padding: '10px'
						})}
					>
						<Typography variant="body1" sx={{ ml: '5px' }}>
							<FormControlLabel
								value=""
								label={<strong>{formatMessage(messages.state)}</strong>}
								control={
									<Checkbox
										color="primary"
										value=""
										indeterminate={
											currentFilters.states !== null &&
											currentFilters.states !== 0 &&
											currentFilters.states !== allFiltersState
										}
										checked={currentFilters.states === allFiltersState}
										onChange={handleFilterChange}
									/>
								}
							/>
						</Typography>
					</Box>
					<Box sx={{ width: '100%', padding: '5px 15px 20px 15px' }}>
						<FormGroup>
							{Object.entries(packageStatesMap).map(([key, { mask, validation }]) => {
								return (
									<FormControlLabel
										key={key}
										value={mask}
										control={
											<Checkbox
												color="primary"
												value={mask}
												checked={validation(currentFilters.states)}
												onChange={handleFilterChange}
											/>
										}
										label={formatMessage(messages[key])}
									/>
								);
							})}
						</FormGroup>
					</Box>
				</section>
			</Popover>
		</div>
	);
}

export default FilterDropdown;
