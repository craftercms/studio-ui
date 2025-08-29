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

import React, { useState } from 'react';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { ContentType, ContentTypeSection } from '../../../models';
import { createVirtualSection } from '../utils';
import { FormattedMessage } from 'react-intl';
import { DialogBody } from '../../DialogBody';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { DialogFooter } from '../../DialogFooter';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';

export interface SectionInsertionProps extends EnhancedDialogProps {
	type: ContentType;
	onInsertSection: (section: ContentTypeSection, position: number) => void;
}

export function SectionInsertionDialogBody({ type, onInsertSection, ...dialogProps }: SectionInsertionProps) {
	const [position, setPosition] = useState(type.sections.length);
	const handleAccept = () => {
		onInsertSection?.(createVirtualSection({ title: 'New Section', fields: [] } as ContentTypeSection), position);
	};

	return (
		<>
			<DialogBody>
				<FormControl>
					<FormLabel id="sectionInsertionRadioGroupLabel">
						<FormattedMessage defaultMessage="Pick the position for the new section:" />
					</FormLabel>
					<RadioGroup
						aria-labelledby="sectionInsertionRadioGroupLabel"
						name="sectionInsertionRadioGroup"
						value={position}
						onChange={(e) => setPosition(parseInt(e.target.value))}
						sx={{ padding: '10px' }}
					>
						<FormControlLabel
							control={<Radio />}
							value={0}
							sx={{ marginBottom: '10px' }}
							slotProps={{ typography: { variant: 'body2' } }}
							label={<FormattedMessage defaultMessage="Insert first" />}
						/>
						{type.sections.map((section, index) => (
							<FormControlLabel
								key={section.id}
								control={<Radio />}
								value={index + 1}
								sx={{ marginBottom: '10px' }}
								slotProps={{ typography: { variant: 'body2' } }}
								label={
									<FormattedMessage
										defaultMessage='Insert after "{sectionName}"'
										values={{ sectionName: section.title }}
									/>
								}
							/>
						))}
					</RadioGroup>
				</FormControl>
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => dialogProps.onClose?.(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton onClick={handleAccept}>
					<FormattedMessage defaultMessage="Accept" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function SectionInsertionDialog({ type, onInsertSection, ...dialogProps }: SectionInsertionProps) {
	return (
		<EnhancedDialog
			{...dialogProps}
			maxWidth="xs"
			fullWidth
			title={<FormattedMessage defaultMessage="Insert New Section" />}
		>
			<SectionInsertionDialogBody type={type} onInsertSection={onInsertSection} {...dialogProps} />
		</EnhancedDialog>
	);
}

export default SectionInsertionDialog;
