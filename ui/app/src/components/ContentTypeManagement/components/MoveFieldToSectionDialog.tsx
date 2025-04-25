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
import useSpreadState from '../../../hooks/useSpreadState';
import { isTouchDevice } from '../../FormsEngine/lib/sortableListUtil';
import TouchSortableList, { TouchSortableListProps } from '../../FormsEngine/components/TouchSortableList';
import SortableList from '../../FormsEngine/components/SortableList';
import ContentType, { ContentTypeField, ContentTypeSection } from '../../../models/ContentType';
import { LookupTable } from '../../../models';
import Box from '@mui/material/Box';
import { isComposedPath } from '../utils';

export interface MoveFieldToSectionDialogProps extends EnhancedDialogProps {
	fieldIdPath: FieldFormViewProps['fieldIdPath'];
	field: FieldFormViewProps['field'];
	sectionId: FieldFormViewProps['sectionId'];
	type: ContentType;
	onMoveFieldToSection?: FieldFormViewProps['onMoveFieldToSection'];
}

export function MoveFieldToSectionDialogBody(props: MoveFieldToSectionDialogProps) {
	const { fieldIdPath, field, sectionId, type, onClose, onMoveFieldToSection } = props;
	const [selectedView, setSelectedView] = useState<number>(0);
	const [selections, setSelections] = useSpreadState<{
		sectionId: string;
		fieldIndex: number;
		isRepeatGroup: boolean;
	}>({
		sectionId: '',
		fieldIndex: 0,
		isRepeatGroup: false
	});
	const sections = type.sections;
	const typeRepeatGroups = getRepeatGroups(type.fields);

	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const [fields, setFields] = useState<TouchSortableListProps['items']>([]);

	const onSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSectionId = e.target.value;
		let isRepeatGroup = false;
		let fieldIndex = selections.fieldIndex;

		if (typeRepeatGroups[newSectionId]) {
			// When moving to sections, repeat groups are treated like sections too. When 'newSectionId' is a repeat group,
			// we need to get the fields from that repeat group.
			const selectedRepGroup = typeRepeatGroups[newSectionId];
			const newFields = Object.values(selectedRepGroup.fields).map((field) => ({ key: field.id, value: field.id }));
			fieldIndex = newFields.length;
			newFields.push({ key: field.id, value: field.id });
			setFields(newFields);
			isRepeatGroup = true;
		} else {
			const selectedSection = sections.find((section) => section.id === newSectionId);
			const newFields = selectedSection?.fields.map((field) => ({ key: field, value: field }));
			fieldIndex = newFields.length;
			newFields.push({ key: field.id, value: field.id });
			setFields(newFields);
		}
		setSelections({ sectionId: newSectionId, isRepeatGroup, fieldIndex });
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
			onMoveFieldToSection(field.id, sectionId, selections.sectionId, selections.fieldIndex, selections.isRepeatGroup);
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
							{sections.map((section) => {
								const repeatGroupsIdsForSection = getRepeatGroupsIdsForSection(section, typeRepeatGroups);
								const sameFieldInType = Boolean(type.fields[field.id]);
								const sameSection = section.id === sectionId;

								return (
									<Box key={section.id} sx={{ display: 'flex', flexDirection: 'column' }}>
										{/* Do not display section if:
										 1- Same section where the field comes from. There's an exception: if the field belongs to a repeat
										    group of the section, not on the root of it.
										 2- The type has a field with the same id as the field being moved.
										 3- If the target is a section (not a repeat group), never allow to move the field if any of the
										 		sections have a field with the same id on their root (sameFieldInType).
										 */}
										{(section.id === sectionId && isComposedPath(fieldIdPath) && !sameFieldInType) ||
										(!sameSection && !sameFieldInType) ? (
											<FormControlLabel
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
										) : null}
										{repeatGroupsIdsForSection.map((repeatGroupFieldIdPath) => {
											// The pathId opf the repeating group of the field being moved
											const currentRepeatGroupIdPath = fieldIdPath.split('.').slice(0, -1).join('.');
											// Validates if the current field is a child of the repeat group or if is the same repeat group
											// being moved.
											const isSameOrChildRepeatGroup = repeatGroupFieldIdPath.includes(fieldIdPath);
											const sameFieldInRepGroup = typeRepeatGroups[repeatGroupFieldIdPath].fields[field.id];

											return (
												// Do not display repeating group if:
												// 1- Current field is a child of the repeat group 'repeatGroupFieldIdPath'.
												// 2- Current field is the same repeat group being moved, or a child of it.
												// 3- Rep Group has a field with the same id as the field being moved.
												currentRepeatGroupIdPath !== repeatGroupFieldIdPath &&
												!isSameOrChildRepeatGroup &&
												!sameFieldInRepGroup && (
													<FormControlLabel
														key={repeatGroupFieldIdPath}
														control={<Radio />}
														value={repeatGroupFieldIdPath}
														sx={{ marginBottom: '10px' }}
														slotProps={{ typography: { variant: 'body2' } }}
														label={
															<FormattedMessage
																defaultMessage='Move to "{sectionTitle}"'
																values={{ sectionTitle: repeatGroupFieldIdPath.replaceAll('.', ' | ') }}
															/>
														}
													/>
												)
											);
										})}
									</Box>
								);
							})}
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
	const { field, fieldIdPath, sectionId, type, onClose, onMoveFieldToSection, ...dialogProps } = props;
	return (
		<EnhancedDialog
			{...dialogProps}
			onClose={onClose}
			maxWidth="sm"
			title={<FormattedMessage defaultMessage="Move to another section" />}
		>
			<MoveFieldToSectionDialogBody
				{...dialogProps}
				fieldIdPath={fieldIdPath}
				field={field}
				sectionId={sectionId}
				type={type}
				onClose={onClose}
				onMoveFieldToSection={onMoveFieldToSection}
			/>
		</EnhancedDialog>
	);
}

const getRepeatGroups = (fields: LookupTable<ContentTypeField>, parentId?: string): LookupTable<ContentTypeField> => {
	const flatRepeatGroups = {};
	Object.values(fields).forEach((field) => {
		if (field.type === 'repeat') {
			flatRepeatGroups[parentId ? `${parentId}.${field.id}` : field.id] = field;
		}
		if (field.fields) {
			const newParentId = parentId ? `${parentId}.${field.id}` : field.id;
			Object.assign(flatRepeatGroups, getRepeatGroups(field.fields, newParentId));
		}
	});
	return flatRepeatGroups;
};

const getRepeatGroupsIdsForSection = (
	section: ContentTypeSection,
	repeatGroups: LookupTable<ContentTypeField>
): string[] => {
	return Object.keys(repeatGroups).filter((key) => {
		const rootId = key.split('.')[0];
		return section.fields.includes(rootId);
	});
};

export default MoveFieldToSectionDialog;
