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

import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
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
import React, { useMemo, useState } from 'react';
import { FieldFormViewProps } from './TypeBuilderFormsEngine';
import { ContentTypeSection } from '../../../models';
import useSpreadState from '../../../hooks/useSpreadState';
import { isTouchDevice } from '../../FormsEngine/lib/sortableListUtil';
import TouchSortableList, { TouchSortableListProps } from '../../FormsEngine/components/TouchSortableList';
import SortableList from '../../FormsEngine/components/SortableList';

export interface MoveFieldToSectionDialogProps extends EnhancedDialogProps {
	field: FieldFormViewProps['field'];
	sectionId: FieldFormViewProps['sectionId'];
	sections: ContentTypeSection[];
	onMoveFieldToSection?: FieldFormViewProps['onMoveFieldToSection'];
}

export function MoveFieldToSectionDialogBody(props: MoveFieldToSectionDialogProps) {
	const { field, sectionId, sections, onClose, onMoveFieldToSection } = props;
	const [selectedView, setSelectedView] = useState<number>(0);
	const [selections, setSelections] = useSpreadState<{
		sectionId: string;
		fieldIndex: number;
	}>({
		sectionId: '',
		fieldIndex: 0
	});
	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const [fields, setFields] = useState<TouchSortableListProps['items']>([]);

	const onSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sectionId = e.target.value;
		const selectedSection = sections.find((section) => section.id === sectionId);
		const newFields = selectedSection?.fields.map((field) => ({ key: field, value: field }));
		newFields.push({ key: field.id, value: field.id });
		setFields(newFields);
		setSelections({ sectionId });
	};

	const onReorderField = (newFields: TouchSortableListProps['items']) => {
		const fieldIndex = newFields.findIndex(({ key }) => key === field.id);
		setSelections({ fieldIndex: fieldIndex });
		setFields(newFields);
	};

	const onSecondaryAction = (e: React.MouseEvent) => {
		if (selectedView === 0) {
			onClose?.(e, null);
		} else {
			setSelectedView(0);
		}
	};

	const onPrimaryAction = () => {
		if (selectedView === 0) {
			setSelectedView(1);
		} else {
			onMoveFieldToSection(field.id, sectionId, selections.sectionId, selections.fieldIndex);
		}
	};

	return (
		<>
			<DialogBody sx={{ transition: 'height 0.3s ease-in-out' }}>
				{selectedView === 0 ? (
					<>
						<FormControl>
							<FormLabel id="fieldSectionRadioGroupLabel">
								<FormattedMessage defaultMessage="Pick the new section for the field" />
							</FormLabel>
						</FormControl>
						<RadioGroup
							aria-labelledby="fieldSectionRadioGroupLabel"
							name="fieldSectionRadioGroupLabel"
							sx={{ padding: '10px' }}
							value={selections.sectionId}
							onChange={onSectionChange}
						>
							{sections.map((section) =>
								section.id !== sectionId ? (
									<FormControlLabel
										key={section.id}
										control={<Radio />}
										value={section.id}
										sx={{ marginBottom: '10px' }}
										slotProps={{ typography: { variant: 'body2' } }}
										label={
											<FormattedMessage
												defaultMessage='Move to "{sectionTitle}"'
												values={{ sectionTitle: section.title }}
											/>
										}
									/>
								) : null
							)}
						</RadioGroup>
					</>
				) : (
					<>
						<FormControl>
							<FormLabel id="moveFieldRadioGroupLabel">
								<FormattedMessage defaultMessage="Manage field position" />
							</FormLabel>
							{fields &&
								(useTouchSorting ? (
									<TouchSortableList items={fields} onChange={onReorderField} selectedItemId={field.id} />
								) : (
									<SortableList items={fields} onChange={onReorderField} selectedItemId={field.id} />
								))}
						</FormControl>
					</>
				)}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={onSecondaryAction}>
					{selectedView === 0 ? (
						<FormattedMessage defaultMessage="Cancel" />
					) : (
						<FormattedMessage defaultMessage="Back" />
					)}
				</SecondaryButton>
				<PrimaryButton disabled={selectedView === 0 ? !selections.sectionId : false} onClick={() => onPrimaryAction()}>
					{selectedView === 0 ? (
						<FormattedMessage defaultMessage="Select" />
					) : (
						<FormattedMessage defaultMessage="Accept" />
					)}
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function MoveFieldToSectionDialog(props: MoveFieldToSectionDialogProps) {
	const { field, sectionId, sections, onClose, onMoveFieldToSection, ...dialogProps } = props;
	return (
		<EnhancedDialog
			{...dialogProps}
			onClose={onClose}
			maxWidth="sm"
			title={<FormattedMessage defaultMessage="Move to another section" />}
		>
			<MoveFieldToSectionDialogBody
				{...dialogProps}
				field={field}
				sectionId={sectionId}
				sections={sections}
				onClose={onClose}
				onMoveFieldToSection={onMoveFieldToSection}
			/>
		</EnhancedDialog>
	);
}

export default MoveFieldToSectionDialog;
