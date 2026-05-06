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

import { useAtom, useAtomValue } from 'jotai';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { MouseEvent, useContext } from 'react';
import { StableFormContext } from '../lib/formsEngineContext';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Grow from '@mui/material/Grow';
import Alert from '@mui/material/Alert';
import { SplitButton } from '../../SplitButton';

export interface SaveCardProps {
	isRepeatMode: boolean;
	isStackedForm: boolean;
	isEmbedded: boolean;
	saveAsDraft: boolean;
	setSaveAsDraft: (value: boolean) => void;
	invalidForm: boolean;
	onSave: (e: MouseEvent, draft?: boolean) => void;
}

export function SaveCard(props: SaveCardProps) {
	const { isEmbedded, isStackedForm, isRepeatMode, setSaveAsDraft, invalidForm, onSave } = props;
	const stableFormContext = useContext(StableFormContext);
	const isSubmitting = useAtomValue(stableFormContext.atoms.isSubmitting);
	const [versionComment, setVersionComment] = useAtom(stableFormContext.atoms.versionComment);
	const hasPendingChanges = useAtomValue(stableFormContext.atoms.hasPendingChanges);
	const [closeAfterSave, setCloseAfterSave] = useAtom(stableFormContext.atoms.closeAfterSave);
	const disableSave = isSubmitting || !hasPendingChanges;
	const { formatMessage } = useIntl();
	return (
		<Paper sx={{ p: 1 }}>
			{(!isEmbedded || !isStackedForm) && !isRepeatMode && (
				// TODO: Should embedded components and repeats get a version comment? How would that work?
				<TextField
					size="small"
					multiline
					fullWidth
					label={<FormattedMessage defaultMessage="Version Comment" />}
					value={versionComment}
					onChange={(e) => setVersionComment(e.target.value)}
					onFocus={(e) => e.target.select()}
				/>
			)}
			<FormControlLabel
				label={<FormattedMessage defaultMessage="Close after saving" />}
				control={
					<Checkbox size="small" checked={closeAfterSave} onChange={(e, checked) => setCloseAfterSave(checked)} />
				}
			/>
			{/*
			TODO:
				- If validations aren't all passed, should read "Save Draft" and a different colour.
				- What about embedded drafts? Should they be allowed?
      */}
			<SplitButton
				fullWidth
				loading={isSubmitting}
				disabled={disableSave}
				selectedIndex={invalidForm ? 1 : undefined}
				options={[
					{
						id: 'save',
						label:
							isRepeatMode || (isEmbedded && isStackedForm)
								? formatMessage({ defaultMessage: 'Done' })
								: formatMessage({ defaultMessage: 'Save' }),
						callback: (e) => {
							setSaveAsDraft(false);
							onSave(e);
						}
					},
					{
						id: 'saveDraft',
						label:
							isRepeatMode || (isEmbedded && isStackedForm)
								? formatMessage({ defaultMessage: 'Done (Draft)' })
								: formatMessage({ defaultMessage: 'Save Draft' }),
						callback: (e) => {
							setSaveAsDraft(true);
							onSave(e, true);
						}
					}
				]}
				disabledOptions={invalidForm ? ['save'] : []}
			/>
			{isStackedForm && isEmbedded && (
				<FormHelperText sx={{ textAlign: 'center' }}>
					<FormattedMessage defaultMessage="Changes are saved with the main item." />
				</FormHelperText>
			)}
			<Grow in={!hasPendingChanges} appear unmountOnExit>
				<Alert severity="info" variant="outlined" sx={{ p: 0, border: 'none', placeContent: 'center' }}>
					<FormattedMessage defaultMessage="No changes detected" />
				</Alert>
			</Grow>
		</Paper>
	);
}

export default SaveCard;
