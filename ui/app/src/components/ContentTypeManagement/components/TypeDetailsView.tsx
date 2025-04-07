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

import ContentType, { ContentTypeSection, DataSource, PossibleContentTypeDraft } from '../../../models/ContentType';
import FieldChip, { FieldChipProps } from './FieldChip';
import React, { useMemo, useRef, useState } from 'react';
import { createStore, Provider } from 'jotai/index';
import { StableFormContext, StableFormContextProps } from '../../FormsEngine/lib/formsEngineContext';
import { createStableFormContextProps, createVirtualDataSourceFields, createVirtualSection } from '../utils';
import ErrorBoundary from '../../ErrorBoundary';
import Box from '@mui/material/Box';
import TypeBuilderAddButton from './TypeBuilderAddButton';
import { FormattedMessage } from 'react-intl';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import UnfoldMore from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLess from '@mui/icons-material/UnfoldLessRounded';
import SectionAccordion from '../../FormsEngine/components/SectionAccordion';
import { accordionClasses } from '@mui/material/Accordion';
import Button from '@mui/material/Button';
import TypeDetailsViewHeader, { TypeDetailsViewHeaderProps } from './TypeDetailsViewHeader';
import LookupTable from '../../../models/LookupTable';
import { defaultDataSourcesSection } from '../descriptors/controls';
import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { DialogBody } from '../../DialogBody';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import DialogFooter from '../../DialogFooter/DialogFooter';
import SecondaryButton from '../../SecondaryButton/SecondaryButton';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import { atom } from 'jotai';

export interface TypeDetailsViewProps {
	type: PossibleContentTypeDraft;
	fieldPathsWithErrors: LookupTable<boolean>;
	selectedFieldIdPath: string;
	onFieldSelected: FieldChipProps['onFieldSelected'];
	onDataSourceSelected(dataSource: DataSource): void;
	onSectionSelected(section: ContentTypeSection): void;
	onEditTypeAction: TypeDetailsViewHeaderProps['onActionClick'];
	onInsertSection: SectionInsertionProps['onInsertSection'];
}

export function TypeDetailsView(props: TypeDetailsViewProps) {
	const {
		type,
		selectedFieldIdPath,
		onFieldSelected,
		fieldPathsWithErrors,
		onSectionSelected,
		onDataSourceSelected,
		onEditTypeAction
	} = props;

	const store = useMemo(() => createStore(), []); // TODO: Use stable memo?
	const stableFormContextRef = useRef<StableFormContextProps>(null);
	if (stableFormContextRef.current === null)
		stableFormContextRef.current = createStableFormContextProps({ type }, true);

	const [openSectionInserter, setOpenSectionInserter] = useState(false);

	const dataSourcesSection = useMemo(
		() =>
			createVirtualSection({
				...defaultDataSourcesSection,
				fields: type.dataSources?.map((dataSource) => dataSource.id) ?? []
			}),
		[type]
	);

	const dataSourceFields = useMemo(() => createVirtualDataSourceFields(type), [type]);

	const setSectionsExpandedState = (expanded: boolean) => {
		Object.values(stableFormContextRef.current.atoms.expandedStateBySectionId).forEach((atom) => {
			store.set(atom, expanded);
		});
	};
	const handleExpandAllSections = () => {
		setSectionsExpandedState(true);
	};
	const handleCollapseAllSections = () => {
		setSectionsExpandedState(false);
	};
	const handleInsertSection: SectionInsertionProps['onInsertSection'] = (
		section: ContentTypeSection,
		position: number
	) => {
		stableFormContextRef.current.atoms.expandedStateBySectionId[section.id] = atom(true);
		setOpenSectionInserter(false);
		props.onInsertSection?.(section, position);
	};

	const handleDataSourceSelected = (_, field) => {
		onDataSourceSelected?.(type.dataSources.find((dataSource) => dataSource.id === field.id));
	};

	return (
		<ErrorBoundary>
			<Provider store={store}>
				<StableFormContext.Provider value={stableFormContextRef.current}>
					<TypeDetailsViewHeader type={type} onActionClick={onEditTypeAction} />

					<Box display="flex" justifyContent="space-between" mt={(theme) => `${theme.spacing(1)} !important`}>
						<TypeBuilderAddButton onClick={() => setOpenSectionInserter(true)}>
							<FormattedMessage defaultMessage="Add Section" />
						</TypeBuilderAddButton>
						<div>
							<Divider orientation="vertical" flexItem />
							<Tooltip title={<FormattedMessage defaultMessage="Expand All" />}>
								<IconButton onClick={handleExpandAllSections}>
									<UnfoldMore />
								</IconButton>
							</Tooltip>
							<Tooltip title={<FormattedMessage defaultMessage="Collapse All" />}>
								<IconButton onClick={handleCollapseAllSections}>
									<UnfoldLess />
								</IconButton>
							</Tooltip>
						</div>
					</Box>

					{type.sections.map((section) => (
						<SectionAccordion
							key={section.id}
							section={section}
							sx={{ [`&.${accordionClasses.expanded}`]: { margin: 0 } }}
							slotProps={{
								accordionDetails: {
									className: '',
									children: (
										<TypeBuilderAddButton>
											<FormattedMessage defaultMessage="Add Field" />
										</TypeBuilderAddButton>
									)
								}
							}}
							renderControl={(fieldId) => (
								<FieldChip
									key={fieldId}
									field={type.fields[fieldId]}
									fieldPathsWithErrors={fieldPathsWithErrors}
									onFieldSelected={onFieldSelected}
									selectedFieldIdPath={selectedFieldIdPath}
								/>
							)}
						>
							<Button sx={{ position: 'absolute', top: 15, right: 10 }} onClick={() => onSectionSelected?.(section)}>
								<FormattedMessage defaultMessage="Edit" />
							</Button>
						</SectionAccordion>
					))}

					<Divider sx={{ mx: -3 }} />

					<SectionAccordion
						colorize={false}
						variant="outlined"
						section={dataSourcesSection as ContentTypeSection}
						slotProps={{
							accordionDetails: {
								className: '',
								children: (
									<TypeBuilderAddButton>
										<FormattedMessage defaultMessage="Add Data Source" />
									</TypeBuilderAddButton>
								)
							}
						}}
						renderControl={(fieldId) => (
							<FieldChip
								key={fieldId}
								field={dataSourceFields[fieldId]}
								fieldPathsWithErrors={fieldPathsWithErrors}
								onFieldSelected={handleDataSourceSelected}
								selectedFieldIdPath={selectedFieldIdPath}
							/>
						)}
					/>

					<SectionInsertionDialog
						type={type}
						open={openSectionInserter}
						onClose={() => setOpenSectionInserter(false)}
						onInsertSection={handleInsertSection}
					/>
				</StableFormContext.Provider>
			</Provider>
		</ErrorBoundary>
	);
}

interface SectionInsertionProps extends EnhancedDialogProps {
	type: ContentType;
	onInsertSection: (section: ContentTypeSection, position: number) => void;
}

function SectionInsertionDialog({ type, onInsertSection, ...dialogProps }: SectionInsertionProps) {
	const [position, setPosition] = useState(type.sections.length);
	const handleAccept = () => {
		onInsertSection?.(createVirtualSection({ title: 'New Section', fields: [] } as ContentTypeSection), position);
	};
	return (
		<EnhancedDialog
			{...dialogProps}
			maxWidth="xs"
			fullWidth
			title={<FormattedMessage defaultMessage="Insert New Section" />}
		>
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
		</EnhancedDialog>
	);
}

export default TypeDetailsView;
