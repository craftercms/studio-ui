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

import React, { createElement, useEffect, useRef, useState } from 'react';
import {
	FormsEngineFormApiContextProps,
	FormsEngineFormContextApi,
	ItemContext,
	ItemMetaContext,
	StableFormContext,
	StableFormContextProps,
	StableGlobalContext,
	useStableFormContext
} from '../../FormsEngine/lib/formsEngineContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNextRounded';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DriveFileMoveOutlined from '@mui/icons-material/DriveFileMoveOutlined';
import { XmlKeys } from '../../FormsEngine/lib/formConsts';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import SwapCallsOutlined from '@mui/icons-material/SwapCallsOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentTypeFieldIcon from '../../../icons/ContentTypeField';
import ListItemText from '@mui/material/ListItemText';
import SectionAccordion from '../../FormsEngine/components/SectionAccordion';
import { renderFieldControl } from '../../FormsEngine/lib/controlHelpers';
import FormBackToTop from '../../FormsEngine/components/FormBackToTop';
import ContentType, {
	ContentTypeField,
	ContentTypeSection,
	DataSource,
	NewContentTypeField
} from '../../../models/ContentType';
import { fooStableGlobalContext, getFieldFromType, NEW_FIELD_ID, PartialContentType } from '../utils';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import Alert from '@mui/material/Alert';
import { controlMap } from '../controlMap';
import { ConfirmDropdown } from '../../ConfirmDropdown';
import MoveFieldToSectionDialog from './MoveFieldToSectionDialog';
import useEnhancedDialogState from '../../../hooks/useEnhancedDialogState';
import SwapFieldDialog from './SwapFieldDialog';

interface TypeModeProps {
	type: ContentType;
}

interface FieldModeProps {
	field: ContentTypeField;
	fieldIdPath: string;
	sectionId: string;
	controlDescriptor: PartialContentType;
	onDeleteField(fieldIdPath: string, sectionId: string): void;
	onMoveFieldToSection(
		fieldIdPath: string,
		originSectionId: string,
		newSectionId: string,
		fieldIndex: number,
		isTargetRepeatGroup: boolean
	): void;
	onSwapField(fieldId: string, sectionId: string, newField: PartialContentType): void;
}

interface SectionModeProps {
	section: ContentTypeSection;
	isMainSection: boolean;
	onDeleteSection(section: ContentTypeSection): void;
}

interface DataSourceModeProps {
	dataSource: DataSource;
	onDeleteDataSource(dataSourceId: string): void;
}

interface BaseProps extends Partial<FieldModeProps & SectionModeProps & DataSourceModeProps & TypeModeProps> {
	virtualType: ContentType;
	formApiContext: FormsEngineFormApiContextProps;
	stableFormContext: StableFormContextProps;
	onClose(): void;
}

export type FieldFormViewProps = BaseProps & (TypeModeProps | FieldModeProps | SectionModeProps | DataSourceModeProps);

function FieldFormViewBody(props: FieldFormViewProps) {
	const { virtualType, onClose } = props;
	const containerRef = useRef<HTMLDivElement>(undefined);
	const stableFormContext = useStableFormContext();

	useEffect(() => {
		containerRef.current.scroll({ top: 0, behavior: 'smooth' });
	}, [virtualType]);

	return (
		<Box height="var(--container-height)" display="flex" flexDirection="column">
			<Box display="flex" justifyContent="space-between" alignItems="center" py={2} px={3}>
				<Box display="flex" flexDirection="column" position="sticky" top="0">
					<Typography variant="h6">{pickPanelTitleByMode(props)}</Typography>
					{createElement(FieldBreadcrumbs, props)}
				</Box>
				<Box display="flex" alignItems="center">
					{createElement(FieldActions, props)}
					{createElement(SectionActions, props)}
					{createElement(DataSourceActions, props)}
					<Divider sx={{ ml: 1, mr: 2 }} orientation="vertical" flexItem />
					<Button variant="outlined" onClick={onClose}>
						<FormattedMessage defaultMessage="Done" />
					</Button>
				</Box>
			</Box>
			<Container ref={containerRef} maxWidth="md" sx={{ overflow: 'auto', flex: 1 }}>
				{createElement(FieldSwapper, props)}

				{virtualType.sections.map((section) => (
					<SectionAccordion
						key={section.title}
						section={section}
						colorize={false}
						renderControl={(fieldId) => {
							const field = virtualType.fields[fieldId];
							// TODO: tokenize not found on file-name
							if (!field)
								return (
									<Alert key={fieldId} severity="error">
										Field {fieldId} not found
									</Alert>
								);
							return renderFieldControl(
								field,
								stableFormContext.atoms.valueByFieldId,
								// TODO: Fix auto focus layout shift. See FE2 solution (render this whole area until panel animation is done).
								false, // index === 0,
								false,
								virtualType,
								controlMap
							);
						}}
					/>
				))}
				<FormBackToTop containerRef={containerRef} />
			</Container>
		</Box>
	);
}

export function TypeBuilderFormsEngine(props: FieldFormViewProps) {
	const { stableFormContext, formApiContext } = props;
	const itemMetaContext = stableFormContext.itemMeta;
	return (
		<ErrorBoundary>
			<StableGlobalContext.Provider value={fooStableGlobalContext}>
				<FormsEngineFormContextApi.Provider value={formApiContext}>
					<StableFormContext.Provider value={stableFormContext}>
						<ItemContext.Provider value={null}>
							<ItemMetaContext.Provider value={itemMetaContext}>
								{createElement(FieldFormViewBody, props)}
							</ItemMetaContext.Provider>
						</ItemContext.Provider>
					</StableFormContext.Provider>
				</FormsEngineFormContextApi.Provider>
			</StableGlobalContext.Provider>
		</ErrorBoundary>
	);
}

function FieldBreadcrumbs(props: FieldFormViewProps): JSX.Element {
	if (!props.field) return;
	const fieldPathIds = props.fieldIdPath?.split('.') ?? [];
	return (
		fieldPathIds.length > 1 && (
			<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
				{fieldPathIds.map((id) => {
					// Retrieve the fieldPathId by removing everything after `id` in fieldPathIds
					const currentFieldPathId = fieldPathIds.slice(0, fieldPathIds.indexOf(id) + 1).join('.');
					const currentField = getFieldFromType(props.type, currentFieldPathId);
					return (
						<Typography variant="body2" key={id}>
							{currentField?.name ?? id}
						</Typography>
					);
				})}
			</Breadcrumbs>
		)
	);
}

function FieldActions(props: FieldFormViewProps): JSX.Element {
	const { field, fieldIdPath, sectionId, onDeleteField, onMoveFieldToSection, type } = props;
	const [openMoveFieldDialog, setOpenMoveFieldDialog] = useState(false);
	if (!field) return;

	const handleMoveFieldToSection: FieldFormViewProps['onMoveFieldToSection'] = (
		fieldId,
		originSectionId,
		newSectionId,
		fieldIndex,
		isRepeatGroup
	) => {
		setOpenMoveFieldDialog(false);
		onMoveFieldToSection?.(fieldIdPath, originSectionId, newSectionId, fieldIndex, isRepeatGroup);
	};

	return (
		<>
			<Tooltip title={<FormattedMessage defaultMessage="Move to another section" />}>
				<IconButton onClick={() => setOpenMoveFieldDialog(true)}>
					<DriveFileMoveOutlined />
				</IconButton>
			</Tooltip>
			{field.id !== XmlKeys.internalName && field.id !== XmlKeys.fileName && (
				<ConfirmDropdown
					icon={DeleteRounded}
					iconTooltip={<FormattedMessage defaultMessage="Delete field" />}
					confirmHelperText={
						!(field as NewContentTypeField).NEW ? (
							<FormattedMessage
								defaultMessage={'Delete "{fieldName} ({fieldId})"?'}
								values={{
									fieldName: field.name,
									fieldId: field.id
								}}
							/>
						) : (
							<FormattedMessage defaultMessage="Delete new field?" />
						)
					}
					cancelText={<FormattedMessage defaultMessage="No" />}
					confirmText={<FormattedMessage defaultMessage="Yes" />}
					onConfirm={() => onDeleteField?.((field as NewContentTypeField).NEW ? NEW_FIELD_ID : fieldIdPath, sectionId)}
				/>
			)}
			<MoveFieldToSectionDialog
				fieldIdPath={fieldIdPath}
				field={field}
				sectionId={sectionId}
				type={type}
				open={openMoveFieldDialog}
				onClose={() => setOpenMoveFieldDialog(false)}
				onMoveFieldToSection={handleMoveFieldToSection}
			/>
		</>
	);
}

function FieldSwapper(props: FieldFormViewProps): JSX.Element {
	const { field, sectionId, controlDescriptor, onSwapField } = props;
	const swapFieldDialogState = useEnhancedDialogState();
	if (!props.field) return;

	const handleSwapField = (newField: PartialContentType) => {
		onSwapField?.(field.id, sectionId, newField);
		swapFieldDialogState.onClose();
	};

	return (
		<>
			<ListItem
				component="div"
				secondaryAction={
					field.id === 'file-name' && (
						<Tooltip title={<FormattedMessage defaultMessage="Swap Field" />}>
							<IconButton onClick={() => swapFieldDialogState.onOpen()}>
								<SwapCallsOutlined />
							</IconButton>
						</Tooltip>
					)
				}
			>
				<ListItemIcon>
					<ContentTypeFieldIcon />
				</ListItemIcon>
				<ListItemText
					primary={controlDescriptor.name}
					secondary={controlDescriptor.description || controlDescriptor.id}
				/>
			</ListItem>
			<SwapFieldDialog
				currentFieldType={field.type}
				open={swapFieldDialogState.open}
				onClose={swapFieldDialogState.onClose}
				onSwapField={handleSwapField}
			/>
		</>
	);
}

function SectionActions(props: FieldFormViewProps): JSX.Element {
	const { section, isMainSection, onDeleteSection } = props;
	if (!section) return;
	return (
		<>
			{!isMainSection && (
				<ConfirmDropdown
					icon={DeleteRounded}
					iconTooltip={<FormattedMessage defaultMessage="Delete Section" />}
					confirmHelperText={
						<FormattedMessage defaultMessage={'Delete "{title}"?'} values={{ title: section.title }} />
					}
					cancelText={<FormattedMessage defaultMessage="No" />}
					confirmText={<FormattedMessage defaultMessage="Yes" />}
					onConfirm={() => onDeleteSection?.(section)}
				/>
			)}
		</>
	);
}

function DataSourceActions(props: FieldFormViewProps): JSX.Element {
	const { dataSource, onDeleteDataSource } = props;
	if (!dataSource) return;
	return (
		<>
			<ConfirmDropdown
				icon={DeleteRounded}
				iconTooltip={<FormattedMessage defaultMessage="Delete Data Source" />}
				confirmHelperText={<FormattedMessage defaultMessage={'Delete "{name}"?'} values={{ name: dataSource.title }} />}
				cancelText={<FormattedMessage defaultMessage="No" />}
				confirmText={<FormattedMessage defaultMessage="Yes" />}
				onConfirm={() => {
					onDeleteDataSource?.(dataSource.id);
				}}
			/>
		</>
	);
}

type Mode = 'field' | 'section' | 'dataSource' | 'type';

// TODO: Remove if unnecessary
function identifyMode(props: FieldFormViewProps): Mode {
	if (props.type) {
		return 'type';
	} else if (props.field) {
		return 'field';
	} else if (props.section) {
		return 'section';
	} else if (props.dataSource) {
		return 'dataSource';
	}
}

function pickPanelTitleByMode(props: FieldFormViewProps): JSX.Element {
	if (props.type) {
		return <FormattedMessage defaultMessage="Edit Type" />;
	} else if (props.field) {
		return <FormattedMessage defaultMessage="Edit Field" />;
	} else if (props.section) {
		return <FormattedMessage defaultMessage="Edit Section" />;
	} else if (props.dataSource) {
		return <FormattedMessage defaultMessage="Edit Data Source" />;
	}
}

export default TypeBuilderFormsEngine;
