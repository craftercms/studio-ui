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

import React, { createElement, useEffect, useRef } from 'react';
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
import ContentType, { ContentTypeField, ContentTypeSection } from '../../../models/ContentType';
import { fooStableGlobalContext, PartialContentType } from '../utils';
import ErrorBoundary from '../../ErrorBoundary/ErrorBoundary';
import Alert from '@mui/material/Alert';

interface TypeModeProps {
	type: ContentType;
}

interface FieldModeProps {
	field: ContentTypeField;
	fieldIdPath: string;
	controlDescriptor: PartialContentType;
}

interface SectionModeProps {
	section: ContentTypeSection;
}

interface DataSourceModeProps {
	dataSource: unknown;
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

				{virtualType.sections.map((section, index) => (
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
								virtualType
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
				{fieldPathIds.map((id) => (
					<Typography variant="body2">{id}</Typography>
				))}
			</Breadcrumbs>
		)
	);
}

function FieldActions(props: FieldFormViewProps): JSX.Element {
	if (!props.field) return;
	const field = props.field;
	return (
		<>
			<Tooltip title={<FormattedMessage defaultMessage="Move to another section" />}>
				<IconButton>
					<DriveFileMoveOutlined />
				</IconButton>
			</Tooltip>
			{field.id !== XmlKeys.internalName && field.id !== XmlKeys.fileName && (
				<Tooltip title={<FormattedMessage defaultMessage="Delete field" />}>
					<IconButton>
						<DeleteRounded />
					</IconButton>
				</Tooltip>
			)}
		</>
	);
}

function FieldSwapper(props: FieldFormViewProps): JSX.Element {
	if (!props.field) return;
	const { field, controlDescriptor } = props;
	return (
		<ListItem
			component="div"
			secondaryAction={
				field.type === 'file-name' && (
					<Tooltip title={<FormattedMessage defaultMessage="Swap Field" />}>
						<IconButton>
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
	);
}

function SectionActions(props: FieldFormViewProps): JSX.Element {
	if (!props.section) return;
	const section = props.section;
	return (
		<>
			<Tooltip title={<FormattedMessage defaultMessage="Delete Section" />}>
				<IconButton>
					<DeleteRounded />
				</IconButton>
			</Tooltip>
		</>
	);
}

function DataSourceActions(props: FieldFormViewProps): JSX.Element {
	if (!props.dataSource) return;
	const dataSource = props.dataSource;
	return (
		<>
			<Tooltip title={<FormattedMessage defaultMessage="Delete Data Source" />}>
				<IconButton>
					<DeleteRounded />
				</IconButton>
			</Tooltip>
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
