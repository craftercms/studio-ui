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

import ContentType, {
	ContentTypeField,
	ContentTypeSection,
	DataSource,
	NewContentTypeField,
	NewDataSource,
	PossibleContentTypeDraft
} from '../../../models/ContentType';
import LookupTable from '../../../models/LookupTable';
import React, { createElement, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
	applyTranslations,
	buildContentTypeXml,
	createDataSourceValuesObject,
	createEmptyTypeStructure,
	createFieldFormContextApi,
	createTypeFieldValuesObject,
	createTypeFormValuesObject,
	createTypeTemplate,
	createVirtualTypeForDataSource,
	createVirtualTypeForField,
	createVirtualTypeFormContext,
	createVirtualTypeForSection,
	DescriptorContentType,
	editTypeController,
	editTypeTemplate,
	getFieldFromType,
	isComposedPath,
	NEW_DATASOURCE_ID,
	NEW_FIELD_ID,
	prepareSerializeToXmlTypeObject,
	reverseTypeFieldValuesObject,
	TYPE_GROOVY_CONTROLLER_BASE_PATH,
	TYPE_TEMPLATE_BASE_PATH,
	TypePropsToEdit,
	typePropsToEdit
} from '../utils';
import { extractAtomValues, useShowAlert } from '../../FormsEngine/lib/formUtils';
import TypeBuilderFormsEngine, { FieldFormViewProps } from './TypeBuilderFormsEngine';
import controlDescriptors, { sectionDescriptor, typeBasicDetailsDescriptor } from '../descriptors/controls';
import dataSourceDescriptors from '../descriptors/dataSources';
import type { BuiltInControlType } from '../../FormsEngine/lib/controlMap';
import TypeDetailsView, { TypeDetailsViewProps } from './TypeDetailsView';
import {
	FormsEngineAtoms,
	FormsEngineFormApiContextProps,
	StableFormContextProps
} from '../../FormsEngine/lib/formsEngineContext';
import useContentTypes from '../../../hooks/useContentTypes';
import { createStore as createJotai, Provider } from 'jotai';
import { debounceTime, map, Observable, of, Subject } from 'rxjs';
import EditTypeViewLayout, { EditAppLayoutProps } from './EditTypeViewLayout';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { JotaiStore } from '../../FormsEngine/types';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import hljs from '../../../env/hljs';
import Typography from '@mui/material/Typography';
import { createLookupTable, pluckProps } from '../../../utils/object';
import Box, { BoxProps } from '@mui/material/Box';
import useEnhancedDialogContext from '../../EnhancedDialog/useEnhancedDialogContext';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { fetchSiteUiConfig, writeConfiguration } from '../../../services/configuration';
import { createFormDefinitionPathFromTypeId } from '../../../utils/contentType';
import { useDispatch } from 'react-redux';
import { popDialog, pushDialog } from '../../../state/actions/dialogStack';
import { nanoid } from 'nanoid';
import useEnv from '../../../hooks/useEnv';
import { deserialize, fromString } from '../../../utils/xml';
import useSpreadState from '../../../hooks/useSpreadState';
import { asArray } from '../../../utils/array';
import { showErrorDialog } from '../../../state/reducers/dialogs/error';

export interface EditTypeAppProps {
	/**
	 * The content type object structure that represents what's actually stored in the system.
	 * In the case of new/create, it would not have been stored yet (no XML file).
	 **/
	type: PossibleContentTypeDraft;
	sx?: BoxProps['sx'];
	style?: BoxProps['style'];
	onClose?: () => void;
}

// How this works:
//
// => Note: "Artefact" refers to a field, section, data source, or the type metadata (its "basic" details.)
//
// - A type object is received and cloned as the working copy on which edits will be made
//
// - When a field/section/etc is clicked, the fieldFormContext for the selected field gets created if it doesn't exist
// - The TypeBuilderFormsEngine component gets the needed contexts as props
//   - Each descriptor gets mapped to a "virtual" ContentType data structure to render a FormsEngine-like form using FormsEngine control components
// - The TypeBuilderFormsEngine updates atoms internally with user input. Atoms will live past the form on the EditTypeView.
// - When "save" is requested, the EditTypeView merges the basic details, the non-edited field values, the manipulated field atoms into a single object that gets serialized to XML and stored
//
// - When a field is added/removed...

interface EditAppContextProps {
	fieldUpdates$: Subject<string>;
	formContextApi: FormsEngineFormApiContextProps;
	activeFormContext: StableFormContextProps;
	selectedField: ContentTypeField;
	selectedSection: ContentTypeSection;
	selectedDataSource: DataSource;
	/**
	 * Keeps track of whether anything was changed when any form (type, field, section, data source) was opened.
	 * Resets when the form closes or changes to a different artefact (type, field, etc.)
	 * Used to avoid committing changes where not necessary.
	 **/
	formFieldsChanged: boolean;
}

export interface ContentTypeManagementConfig {
	controls: LookupTable<{ descriptor: DescriptorContentType; icon: { id: string }; id: string }>;
	controlExclusions: string[];
	dataSources: LookupTable<{ descriptor: DescriptorContentType; icon: { id: string }; id: string }>;
	dataSourceExclusions: string[];
}

export const EditTypeView = forwardRef<HTMLDivElement, EditTypeAppProps>((props, ref) => {
	const { onClose } = props;

	const site = useActiveSiteId();
	const contentTypesLookup = useContentTypes();
	const showAlert = useShowAlert();
	const { formatMessage } = useIntl();
	const jotai = useMemo(() => createJotai(), []); // TODO: Use stable memo?
	const dispatch = useDispatch();
	const { activeEnvironment } = useEnv();

	const dialogContext = useEnhancedDialogContext();
	const stateRef = useRef<EditAppContextProps>(null);
	if (!stateRef.current) stateRef.current = createContextObject();

	const [type, setType] = useState(() => ({ ...props.type })); // Working copy of the ContentType being edited.
	const [open, setOpen] = useState(false);
	const [openXmlViewer, setOpenXmlViewer] = useState<string>(); // TODO: Temp, for testing, remove.
	const [selectedFieldIdPath, setSelectedFieldIdPath] = useState<string>(null);
	const [hasPendingChanges, setHasPendingChanges] = useState(false);
	const [virtualContentType, setVirtualContentType] = useState<ContentType>(null);
	const [fieldFormViewProps, setFieldFormViewProps] = useState<FieldFormViewProps>(null);
	const [fieldPathsWithErrors, setFieldPathsWithErrors] = useState<LookupTable<boolean>>({});
	const [config, setConfig] = useSpreadState<ContentTypeManagementConfig>({
		controls: null,
		controlExclusions: null,
		dataSources: null,
		dataSourceExclusions: null
	});

	const configDescriptors = useMemo(() => {
		const controlDescriptors = Object.values(config?.controls ?? {}).map(({ descriptor }) => descriptor);
		const dataSourceDescriptors = Object.values(config?.dataSources ?? {}).map(({ descriptor }) => descriptor);

		return {
			controlDescriptors: controlDescriptors.length ? createLookupTable(controlDescriptors) : null,
			dataSourceDescriptors: dataSourceDescriptors.length ? createLookupTable(dataSourceDescriptors) : null
		};
	}, [config?.controls, config?.dataSources]);

	/** Saves and commits the state changes. Returns undefined if no changes occurred. */
	const commitOpenFormChanges = () => {
		// No form open, nothing to commit. Or, a form was opened but no changes were made.
		if (!open || !stateRef.current.formFieldsChanged) return;
		let updatedType: ContentType;
		const values = extractAtomValues(jotai, stateRef.current.activeFormContext.atoms.valueByFieldId);
		if (stateRef.current.selectedField) {
			updatedType = updateTypeFromFieldUpdate(type, stateRef.current.selectedField, values, selectedFieldIdPath);
		} else if (stateRef.current.selectedSection) {
			updatedType = updateTypeFromSectionUpdate(type, stateRef.current.selectedSection, values);
		} else if (stateRef.current.selectedDataSource) {
			updatedType = updateTypeFromDataSourceUpdate(type, stateRef.current.selectedDataSource, values);
		} else {
			// There's no selected field, section or data source, so assume the type itself is being edited.
			updatedType = updateTypeProps(type, values as TypePropsToEdit);
		}
		setType(updatedType);
		return updatedType;
	};
	/** Returns true if no form is opened or if the active form it's all valid and can be committed and closed. Returns false otherwise. */
	const performCurrentFormErrorCheckAndWarning = () => {
		if (open && validityAtomsHaveErrors(jotai, stateRef.current.activeFormContext.atoms.validationByFieldId)) {
			showAlert(formatMessage({ defaultMessage: `Please fix errors before moving on` }));
			return false;
		}
		return true;
	};
	/** Closes the active form and cleans up state. */
	const closeAndCleanup = () => {
		if (!performCurrentFormErrorCheckAndWarning()) return false;
		commitOpenFormChanges();
		stateRef.current.selectedField = null;
		stateRef.current.selectedSection = null;
		stateRef.current.selectedDataSource = null;
		stateRef.current.formFieldsChanged = false;
		// `activeFormContext` is not nulled since without it, TypeBuilderFormsEngine would crash
		// stateRef.current.activeFormContext = null;
		setVirtualContentType(null);
		setSelectedFieldIdPath(null);
		setOpen(false);
		return true;
	};
	/** Performs the common steps that must occur when an artefact is selected for editing. */
	const handleArtefactSelected = (
		virtualType: ContentType,
		stableFormContext: StableFormContextProps,
		extraFormProps?: Partial<FieldFormViewProps>
	) => {
		setFieldFormViewProps({
			type,
			virtualType,
			stableFormContext,
			formApiContext: stateRef.current.formContextApi,
			onClose: () => effectRefs.current.closeAndCleanup(),
			onDeleteField: handleDeleteField,
			onDeleteSection: handleDeleteSection,
			onDeleteDataSource: handleDeleteDataSource,
			onMoveFieldToSection: handleMoveFieldToSection,
			onSwapField: handleSwapFileNameField,
			...extraFormProps
		});
		// Note: things set here should be cleaned up in closeAndCleanup
		stateRef.current.activeFormContext = stableFormContext;
		setVirtualContentType(virtualType);
		setOpen(true);
	};

	const handleFieldSelected = (
		fieldIdPath: string,
		field: ContentTypeField,
		sectionId: string,
		overrideType?: ContentType
	) => {
		if (!closeAndCleanup()) return;

		const controlDescriptor =
			controlDescriptors[field.type as BuiltInControlType] ?? config.controls?.[field.type].descriptor;
		if (!controlDescriptor)
			return showAlert(`No control descriptor found for field "${field.name}" of type "${field.type}"`);

		// Adding data sources to the virtual type to ensure they are available for rendering in the dataSourceSelector.
		const virtualType = createVirtualTypeForField(
			{ ...controlDescriptor, dataSources: type.dataSources },
			formatMessage
		);
		handleArtefactSelected(
			virtualType,
			createVirtualTypeFormContext(virtualType, createTypeFieldValuesObject(field), contentTypesLookup, {
				fieldUpdates$: stateRef.current.fieldUpdates$
			}),
			{
				field,
				fieldIdPath,
				controlDescriptor: applyTranslations(controlDescriptor, formatMessage),
				sectionId,
				...(overrideType && { type: overrideType })
			}
		);
		setSelectedFieldIdPath(fieldIdPath);
		stateRef.current.selectedField = field;
	};
	const handleSectionSelected: TypeDetailsViewProps['onSectionSelected'] = (section) => {
		if (!closeAndCleanup()) return;
		const sectionIndex = type.sections.findIndex((s) => s.id === section.id);
		const virtualType = createVirtualTypeForSection(sectionDescriptor, formatMessage);
		handleArtefactSelected(
			virtualType,
			createVirtualTypeFormContext(virtualType, section as unknown as LookupTable<unknown>, contentTypesLookup, {
				fieldUpdates$: stateRef.current.fieldUpdates$
			}),
			{ section, isMainSection: sectionIndex === 0 }
		);
		stateRef.current.selectedSection = section;
	};
	const handleDataSourceSelected: TypeDetailsViewProps['onDataSourceSelected'] = (dataSource) => {
		if (!closeAndCleanup()) return;

		const dataSourceDescriptor =
			dataSourceDescriptors[dataSource.type] ?? config.dataSources?.[dataSource.type].descriptor;
		if (!dataSourceDescriptor)
			return showAlert(`No control descriptor found for field "${dataSource.title}" of type "${dataSource.type}"`);

		const virtualType = createVirtualTypeForDataSource(dataSourceDescriptor, formatMessage);
		handleArtefactSelected(
			virtualType,
			createVirtualTypeFormContext(virtualType, createDataSourceValuesObject(dataSource), contentTypesLookup, {
				fieldUpdates$: stateRef.current.fieldUpdates$
			}),
			{ dataSource }
		);
		const dataSourceId = dataSource.id ? dataSource.id : NEW_DATASOURCE_ID;
		setSelectedFieldIdPath(dataSourceId);
		stateRef.current.selectedDataSource = dataSource;
	};
	const handleEditTypeProperties = () => {
		if (!closeAndCleanup()) return;
		const virtualType = createEmptyTypeStructure(applyTranslations(typeBasicDetailsDescriptor, formatMessage));
		handleArtefactSelected(
			virtualType,
			createVirtualTypeFormContext(virtualType, createTypeFormValuesObject(type), contentTypesLookup, {
				fieldUpdates$: stateRef.current.fieldUpdates$
			})
		);
	};

	const onUpdateHasPendingChanges = (hasPendingChanges: boolean) => {
		setHasPendingChanges(hasPendingChanges);
		dialogContext?.updateSubmittingOrHasPendingChanges({ hasPendingChanges });
	};

	const effectRefs = useUpdateRefs({
		jotai,
		selectedFieldIdPath,
		fieldPathsWithErrors,
		closeAndCleanup,
		handleEditTypeProperties,
		onUpdateHasPendingChanges
	});

	const handleCloseDrawer: EditAppLayoutProps['onClose'] = () => effectRefs.current.closeAndCleanup();
	const handleEditTypeAction: TypeDetailsViewProps['onEditTypeAction'] = (e, target) => {
		switch (target) {
			case 'properties': {
				handleEditTypeProperties();
				break;
			}
			case 'template': {
				const templatePath = type.displayTemplate;
				if (templatePath) {
					editTypeTemplate(templatePath, dispatch);
				} else {
					createTypeTemplate(TYPE_TEMPLATE_BASE_PATH, dispatch, (item) => {
						editTypeTemplate(`${item.path}/${item.fileName}`, dispatch);
					});
				}
				break;
			}
			case 'jsController':
				editTypeController(TYPE_GROOVY_CONTROLLER_BASE_PATH, type.id, dispatch, 'javascript');
				break;
			case 'groovyController':
				editTypeController(TYPE_GROOVY_CONTROLLER_BASE_PATH, type.id, dispatch, 'groovy');
				break;
			case 'deleted':
				onClose?.();
				window.top.postMessage(
					{
						type: 'CONTENT_TYPES_ON_DELETED'
					},
					'*'
				);
				break;
		}
	};
	const handleToolbarActionClick: EditAppLayoutProps['onActionClick'] = (e, action) => {
		switch (action) {
			case 'exit':
				if (!performCurrentFormErrorCheckAndWarning()) break;
				if (hasPendingChanges) {
					const id = nanoid();
					dispatch(
						pushDialog({
							id,
							component: 'craftercms.components.ConfirmDialog',
							props: {
								title: <FormattedMessage defaultMessage="Discard changes?" />,
								onOk: () => {
									onClose?.();
									onUpdateHasPendingChanges(false);
									dispatch(popDialog({ id }));
								},
								onCancel: () => dispatch(popDialog({ id }))
							}
						})
					);
				} else {
					onClose?.();
				}
				break;
			case 'save': {
				if (!performCurrentFormErrorCheckAndWarning()) break;
				const latestUpdate = commitOpenFormChanges();
				const tempActuallySaveToServer =
					(document.getElementById('tempSaveToServerCheckbox') as HTMLInputElement)?.checked ?? false;
				save(site, latestUpdate ?? type, tempActuallySaveToServer, configDescriptors).subscribe({
					next(xml) {
						const highlighted = hljs.highlight(xml, { language: 'xml' }).value;
						setOpenXmlViewer(highlighted);
						dialogContext?.updateSubmittingOrHasPendingChanges({ hasPendingChanges: false });
						setHasPendingChanges(false);
						if (tempActuallySaveToServer) showAlert(`Save successful.`);
					},
					error() {
						showAlert(formatMessage({ defaultMessage: `Error saving content type` }));
					}
				});
				break;
			}
		}
	};

	const resetSelection = () => {
		setSelectedFieldIdPath(null);
		stateRef.current.selectedField = null;
		setVirtualContentType(null);
		setFieldFormViewProps(null);
		setHasPendingChanges(false);
		setOpen(false);
	};

	// region insert
	const handleInsertSection: TypeDetailsViewProps['onInsertSection'] = (section, position) => {
		setType(insertSection(type, section, position));
		onUpdateHasPendingChanges(true);
		handleSectionSelected(section);
	};
	const handleInsertField: TypeDetailsViewProps['onInsertField'] = (fieldType, sectionId, position, fieldPath) => {
		const newField: NewContentTypeField = {
			NEW: true,
			id: '',
			name: '',
			description: '',
			type: fieldType,
			validations: {},
			defaultValue: '',
			fields: {},
			properties: {}
		};

		const newFieldPath = fieldPath ? `${fieldPath}.${NEW_FIELD_ID}` : NEW_FIELD_ID;
		setType(addField(type, newField, newFieldPath, sectionId, position));
		handleFieldSelected(newFieldPath, newField, sectionId);
	};
	const handleInsertDataSource: TypeDetailsViewProps['onInsertDataSource'] = (dataSourceType, position) => {
		const newDataSource: NewDataSource = {
			NEW: true,
			id: '',
			title: '',
			type: dataSourceType,
			interface: '',
			properties: {}
		};

		const nextDataSources = type.dataSources.concat();
		nextDataSources.splice(position, 0, newDataSource);
		setType({ ...type, dataSources: nextDataSources });
		handleDataSourceSelected(newDataSource);
	};
	// endregion

	// region delete
	const handleDeleteSection: FieldFormViewProps['onDeleteSection'] = (section) => {
		resetSelection();
		onUpdateHasPendingChanges(true);
		setType(deleteSection(type, section));
	};
	const handleDeleteField: FieldFormViewProps['onDeleteField'] = (fieldIdPath: string, sectionId) => {
		resetSelection();
		onUpdateHasPendingChanges(true);
		setType(deleteField(type, fieldIdPath, sectionId));
	};
	const handleDeleteDataSource: FieldFormViewProps['onDeleteDataSource'] = (dataSourceId) => {
		resetSelection();
		onUpdateHasPendingChanges(true);
		const nextDataSources = type.dataSources.filter((dataSource) => dataSource.id !== dataSourceId);
		setType({ ...type, dataSources: nextDataSources });
	};
	// endregion

	const handleSwapFileNameField: FieldFormViewProps['onSwapField'] = (fieldId, sectionId, newField) => {
		onUpdateHasPendingChanges(true);
		setType((prevType) => {
			const nextType = {
				...prevType,
				fields: {
					...prevType.fields,
					[fieldId]: {
						...prevType.fields[fieldId],
						type: newField.id
					}
				}
			};
			handleFieldSelected(fieldId, nextType.fields[fieldId], sectionId, nextType);
			return nextType;
		});
	};

	// region const fieldEditorView = ...
	const fieldEditorView = virtualContentType ? createElement(TypeBuilderFormsEngine, fieldFormViewProps) : null;
	// endregion

	const handleMoveFieldToSection: FieldFormViewProps['onMoveFieldToSection'] = (
		fieldIdPath,
		originSectionId,
		newSectionId,
		fieldIndex,
		isTargetRepeatGroup
	) => {
		onUpdateHasPendingChanges(true);
		if (isTargetRepeatGroup) {
			const fieldId = getIdFromIdPath(fieldIdPath);
			// For repeat groups as targets, newSectionId is the path of the selected repeating group
			const newFieldIdPath = `${newSectionId}.${fieldId}`;
			const fieldIdRoot = newFieldIdPath.split('.')[0];
			// Section where the field will be added (when moving to a repeat group, newSectionId is the path of the selected repeating group)
			const targetSectionId = type.sections.find((section) => section.fields.includes(fieldIdRoot)).id;
			setType((prevType) => {
				const field = getFieldFromType(prevType, fieldIdPath);
				let nextType = deleteField(prevType, fieldIdPath, originSectionId);
				nextType = addField(nextType, field, newFieldIdPath, targetSectionId, fieldIndex);
				handleFieldSelected(newFieldIdPath, field, targetSectionId, nextType);
				return nextType;
			});
		} else {
			setType((prevType) => {
				const field = getFieldFromType(prevType, fieldIdPath);
				let nextType = deleteField(prevType, fieldIdPath, originSectionId);
				nextType = addField(nextType, field, field.id, newSectionId, fieldIndex);
				handleFieldSelected(fieldIdPath, field, newSectionId, nextType);
				return nextType;
			});
		}
	};

	// `fieldUpdates$` subscription
	useEffect(() => {
		const sub = stateRef.current.fieldUpdates$.pipe(debounceTime(500)).subscribe(() => {
			const { jotai, fieldPathsWithErrors, selectedFieldIdPath, onUpdateHasPendingChanges } = effectRefs.current;
			onUpdateHasPendingChanges(true);
			stateRef.current.formFieldsChanged = true;

			const { activeFormContext } = stateRef.current;
			const { atoms } = activeFormContext;
			const nextFieldPathsWithErrors = { ...fieldPathsWithErrors };

			// Check validations atoms of the form to see if there are any unfulfilled validations.
			nextFieldPathsWithErrors[selectedFieldIdPath] = validityAtomsHaveErrors(jotai, atoms.validationByFieldId);
			if (!nextFieldPathsWithErrors[selectedFieldIdPath]) delete nextFieldPathsWithErrors[selectedFieldIdPath];

			setFieldPathsWithErrors(nextFieldPathsWithErrors);
		});
		return () => {
			sub.unsubscribe();
		};
	}, [effectRefs]);

	useEffect(() => {
		if (type.NEW) {
			effectRefs.current.handleEditTypeProperties();
		}
	}, [type.NEW, effectRefs]);

	useEffect(() => {
		fetchSiteUiConfig(site, activeEnvironment).subscribe({
			next: (config) => {
				const configDOM = fromString(config);
				const contentTypesConfigDOM = configDOM.querySelector(
					'widget[id="craftercms.components.ContentTypeManagement"] > configuration'
				);
				const contentTypesConfig = contentTypesConfigDOM ? deserialize(contentTypesConfigDOM).configuration : null;
				if (contentTypesConfig) {
					setConfig({
						controls: parseConfigPlugins(contentTypesConfig.controls),
						controlExclusions: asArray(contentTypesConfig.controlExclusions),
						dataSources: parseConfigPlugins(contentTypesConfig.dataSources),
						dataSourceExclusions: asArray(contentTypesConfig.dataSourceExclusions)
					});
				}
			},
			error: ({ response }) => {
				dispatch(showErrorDialog({ error: response.response }));
			}
		});
	}, [site, activeEnvironment, setConfig, dispatch]);

	const disableSave = !hasPendingChanges || Object.keys(fieldPathsWithErrors).length !== 0;
	return (
		<Provider store={jotai}>
			<EditTypeViewLayout
				sx={props.sx}
				ref={ref}
				style={props.style}
				open={open}
				onClose={handleCloseDrawer}
				disableSave={disableSave}
				onActionClick={handleToolbarActionClick}
				drawerContent={fieldEditorView}
				mainContent={
					<>
						<TypeDetailsView
							type={type}
							onInsertSection={handleInsertSection}
							onInsertField={handleInsertField}
							onInsertDataSource={handleInsertDataSource}
							onEditTypeAction={handleEditTypeAction}
							onFieldSelected={handleFieldSelected}
							onDataSourceSelected={handleDataSourceSelected}
							onSectionSelected={handleSectionSelected}
							fieldPathsWithErrors={fieldPathsWithErrors}
							selectedFieldIdPath={selectedFieldIdPath}
							config={config}
						/>
						<Box>
							{/* TODO: Remove this whole box and the fragment container. */}
							<FormControlLabel control={<Checkbox id="tempSaveToServerCheckbox" />} label="Actually save to server?" />
							<Typography variant="body2">
								While we have this module in "beta", when you press save, you'll be shown the XML that would be saved to
								the server. If you want to actually save, mark this checkbox.
							</Typography>
						</Box>
					</>
				}
				isNew={type.NEW}
			/>
			{
				// region TODO: Temp Dialog to show XML
				<Dialog open={Boolean(openXmlViewer)} onClose={() => setOpenXmlViewer(null)} maxWidth="lg" fullWidth>
					<Typography
						variant="body2"
						component="pre"
						dangerouslySetInnerHTML={{ __html: openXmlViewer }}
						sx={{ py: 1, px: 2, fontFamily: 'monospace' }}
					/>
				</Dialog>
				// endregion
			}
		</Provider>
	);
});

function createContextObject(): EditAppContextProps {
	return {
		fieldUpdates$: new Subject<string>(),
		formContextApi: createFieldFormContextApi(),
		activeFormContext: null,
		selectedField: null,
		selectedSection: null,
		selectedDataSource: null,
		formFieldsChanged: false
	};
}

function getIdFromIdPath(idPath: string): string {
	const pieces = idPath.split('.');
	return pieces.pop();
}

function insertSection(type: ContentType, section: ContentTypeSection, position: number = 0): ContentType {
	const nextType = { ...type, sections: type.sections.concat() };
	nextType.sections.splice(position, 0, section);
	return nextType;
}

function deleteSection(type: ContentType, section: ContentTypeSection): ContentType {
	const nextType = { ...type, sections: type.sections.concat() };
	const sectionIndex = nextType.sections.findIndex((s) => s.id === section.id);
	nextType.sections.splice(sectionIndex, 1);
	return nextType;
}

function addSubField(
	parentField: ContentTypeField,
	newField: ContentTypeField,
	subFieldPath: string,
	position: number
): ContentTypeField {
	if (isComposedPath(subFieldPath)) {
		// If still composed, we need to find the root field and add the new field to it recursively
		const rootFieldId = subFieldPath.split('.').shift();
		return {
			...parentField,
			fields: {
				...(parentField.fields ?? {}),
				[rootFieldId]: addSubField(
					parentField.fields[rootFieldId],
					newField,
					subFieldPath.replace(`${rootFieldId}.`, ''),
					position
				)
			}
		};
	} else {
		// If not composed, we can add the field directly to the parent fields lookup.
		// Since the fields prop under a parentField is a lookupTable and we need to insert on a specific position, we first
		// convert it to an array, insert the new field and then convert it back to a lookupTable.
		const nextFieldsArray = Object.values(parentField.fields ?? {});
		nextFieldsArray.splice(position, 0, newField);
		const nextFields = createLookupTable(nextFieldsArray, 'id');
		return {
			...parentField,
			fields: nextFields
		};
	}
}

function addField(
	type: ContentType,
	field: ContentTypeField,
	fieldIdPath: string,
	sectionId: string,
	position: number
): ContentType {
	if (isComposedPath(fieldIdPath)) {
		// If the fieldIdPath is composed, we need to find the root field and add the new field to it recursively
		const rootFieldId = fieldIdPath.split('.').shift();
		// When fieldIdPath is composed (inside a rep-group), sections don't change since the root fields remain the same
		return {
			...type,
			fields: {
				...type.fields,
				[rootFieldId]: addSubField(
					type.fields[rootFieldId],
					field,
					fieldIdPath.replace(`${rootFieldId}.`, ''),
					position
				)
			}
		};
	} else {
		// If not composed, we can add the field directly to the fields lookup and to the sections list
		const nextFields = { ...type.fields, [fieldIdPath]: field };
		const nextSections = type.sections.concat();
		const sectionIndex = nextSections.findIndex((section) => section.id === sectionId);
		const section = nextSections[sectionIndex];
		const nextSectionFields = nextSections[sectionIndex].fields.concat();
		nextSectionFields.splice(position, 0, fieldIdPath);
		nextSections[sectionIndex] = {
			...section,
			fields: nextSectionFields
		};
		return { ...type, sections: nextSections, fields: nextFields };
	}
}

function deleteSubField(parentField: ContentTypeField, fieldIdPath: string): ContentTypeField {
	if (isComposedPath(fieldIdPath)) {
		// If still composed, we need to find the root field and delete the field recursively
		const rootFieldId = fieldIdPath.split('.').shift();
		return {
			...parentField,
			fields: {
				...(parentField.fields ?? {}),
				[rootFieldId]: deleteSubField(parentField.fields[rootFieldId], fieldIdPath.replace(`${rootFieldId}.`, ''))
			}
		};
	} else {
		const nextFields = { ...(parentField.fields ?? {}) };
		delete nextFields[fieldIdPath];
		return { ...parentField, fields: nextFields };
	}
}

function deleteField(type: ContentType, fieldIdPath: string, sectionId: string): ContentType {
	if (isComposedPath(fieldIdPath)) {
		// If the fieldIdPath is composed, we need to find the root field and remove the field recursively
		const rootFieldId = fieldIdPath.split('.').shift();
		// When fieldIdPath is composed (inside a rep-group), sections don't change since the root fields remain the same
		return {
			...type,
			fields: {
				...type.fields,
				[rootFieldId]: deleteSubField(type.fields[rootFieldId], fieldIdPath.replace(`${rootFieldId}.`, ''))
			}
		};
	} else {
		const nextFields = { ...type.fields };
		delete nextFields[fieldIdPath];

		const nextSections = type.sections.concat();
		const sectionIndex = nextSections.findIndex((section) => section.id === sectionId);
		const section = nextSections[sectionIndex];
		const nextSectionFields = nextSections[sectionIndex].fields.concat();
		const fieldIndex = nextSectionFields.findIndex((fieldId) => fieldId === fieldIdPath);
		nextSectionFields.splice(fieldIndex, 1);
		nextSections[sectionIndex] = {
			...section,
			fields: nextSectionFields
		};

		return { ...type, sections: nextSections, fields: nextFields };
	}
}

function updateTypeProps(type: ContentType, updatedTypeDetails: TypePropsToEdit): ContentType {
	return { ...type, ...pluckProps(updatedTypeDetails, ...typePropsToEdit) };
}

function updateTypeFromSubFieldUpdate(
	fields: LookupTable<ContentTypeField>,
	selectedField: ContentTypeField | NewContentTypeField,
	updatedValues: LookupTable<unknown>,
	fieldIdPath: string
): LookupTable<ContentTypeField> {
	if (isComposedPath(fieldIdPath)) {
		const rootFieldId = fieldIdPath.split('.').shift();
		return {
			...fields,
			[rootFieldId]: {
				...fields[rootFieldId],
				fields: updateTypeFromSubFieldUpdate(
					fields[rootFieldId].fields,
					selectedField,
					updatedValues,
					fieldIdPath.replace(`${rootFieldId}.`, '')
				)
			}
		};
	} else {
		const updatedField = reverseTypeFieldValuesObject(selectedField, updatedValues);
		let updatedFields = { ...fields };

		if (updatedField.id !== selectedField.id) {
			// Since the order of the fields is determined by the lookupTable order, we need to convert it to array, set the
			// field in the proper position and convert it back to a lookupTable.
			const updatedFieldsArray = Object.values(updatedFields);
			const originalFieldIndex = updatedFieldsArray.findIndex((field) => field.id === selectedField.id);
			updatedFieldsArray.splice(originalFieldIndex, 0, updatedField);
			updatedFields = createLookupTable(updatedFieldsArray, 'id');

			// Delete the old id
			delete updatedFields[selectedField.id];
		} else {
			updatedFields[updatedField.id] = updatedField;
		}
		return updatedFields;
	}
}

function updateTypeFromFieldUpdate(
	type: ContentType,
	selectedField: ContentTypeField | NewContentTypeField,
	updatedValues: LookupTable<unknown>,
	fieldIdPath: string
): ContentType {
	if (!selectedField) return;

	const isNewField = (selectedField as NewContentTypeField).NEW;
	const selectedFieldId = isNewField ? NEW_FIELD_ID : selectedField.id;

	if (isComposedPath(fieldIdPath)) {
		// When the field is not on the root level (composed fieldIdPath), the field is under another field, where each
		// field contains a lookupTable of fields. In that screnario sections should not be updated.
		const rootFieldId = fieldIdPath.split('.').shift();
		return {
			...type,
			fields: {
				...type.fields,
				[rootFieldId]: {
					...type.fields[rootFieldId],
					fields: updateTypeFromSubFieldUpdate(
						type.fields[rootFieldId].fields,
						selectedField,
						updatedValues,
						fieldIdPath.replace(`${rootFieldId}.`, '')
					)
				}
			}
		};
	} else {
		// If the field is on the root level, the edition is different since the structure of `type` has sections with the
		// fields (string array) and the lookupTable of the fields. Both properties need to be updated.
		const updatedType: ContentType = { ...type, fields: { ...type.fields } };
		const updatedField = reverseTypeFieldValuesObject(selectedField, updatedValues);
		updatedType.fields[updatedField.id] = updatedField;
		if (updatedField.id !== selectedFieldId) {
			// Delete the old id
			delete updatedType.fields[selectedFieldId];
			// Find the section in which the field is located
			const sectionIndex = updatedType.sections.findIndex((section) => section.fields.includes(selectedFieldId));
			const section: ContentTypeSection = {
				...updatedType.sections[sectionIndex],
				fields: updatedType.sections[sectionIndex].fields.concat()
			};
			// Replace the field in the section
			const fieldIndex = section.fields.findIndex((fieldId) => fieldId === selectedFieldId);
			section.fields[fieldIndex] = updatedField.id;
			updatedType.sections = updatedType.sections.concat();
			updatedType.sections[sectionIndex] = section;
		}
		return updatedType;
	}
}

function updateTypeFromSectionUpdate(
	type: ContentType,
	selectedSection: ContentTypeSection,
	updatedValues: LookupTable<unknown>
): ContentType {
	const updatedType: ContentType = { ...type, sections: type.sections.concat() };
	const index = updatedType.sections.findIndex((item) => item.id === selectedSection.id);
	updatedType.sections[index] = { ...selectedSection, ...updatedValues };
	return updatedType;
}

function updateTypeFromDataSourceUpdate(
	type: ContentType,
	selectedDataSource: DataSource,
	updatedValues: LookupTable<unknown>
): ContentType {
	const updatedType: ContentType = { ...type, dataSources: type.dataSources.concat() };
	const index = updatedType.dataSources.findIndex((item) => {
		if (selectedDataSource.id) {
			return item.id === selectedDataSource.id;
		} else {
			return (item as NewDataSource).NEW;
		}
	});

	const nextDataSource = { ...selectedDataSource };
	// When updating a new data source, we need to exclude NEW prop from the new datasource content
	delete (nextDataSource as NewDataSource).NEW;
	const { title, id, ...properties }: Partial<DataSource> = updatedValues;
	updatedType.dataSources[index] = { ...nextDataSource, id, title, properties };
	return updatedType;
}

// merge the basic details, the non-edited field values, the manipulated field atoms into a single object
// that gets serialized to XML and stored
function save(
	siteId: string,
	type: ContentType,
	tempSaveSaveToServerArgumentToBeRemoved: boolean,
	configDescriptors?: {
		controlDescriptors: LookupTable<DescriptorContentType>;
		dataSourceDescriptors: LookupTable<DescriptorContentType>;
	}
): Observable<string> {
	const typeStructure = prepareSerializeToXmlTypeObject(type, configDescriptors);
	// console.log(typeStructure);
	const xml = buildContentTypeXml(typeStructure);
	// TODO: Validation? This get pre-validated?
	if (tempSaveSaveToServerArgumentToBeRemoved) {
		return writeConfiguration(siteId, createFormDefinitionPathFromTypeId(type.id), 'studio', xml).pipe(map(() => xml));
	} else {
		return of(xml);
	}
}

function validityAtomsHaveErrors(jotai: JotaiStore, atoms: FormsEngineAtoms['validationByFieldId']) {
	// Check validations atoms of the form to see if there are any unfulfilled validations.
	return Object.values(atoms).some((atom) => !jotai.get(atom).isValid);
}

function parseConfigPlugins(
	plugins: { descriptor: DescriptorContentType; icon: { id: string }; id: string }[]
): ContentTypeManagementConfig['controls'] {
	if (!plugins) return;
	const parsedControls = asArray(plugins).map((plugin) => {
		const fields = Object.values(plugin.descriptor.fields)?.map((field) => {
			return {
				...field,
				validations: field.validations ?? {}
			};
		});
		return {
			...plugin,
			descriptor: {
				...plugin.descriptor,
				fields: createLookupTable(fields),
				sections: asArray(plugin.descriptor?.sections) ?? []
			}
		};
	});
	return createLookupTable(parsedControls);
}

export default EditTypeView;

// TODO:
//  - Because IDs can be modified, keep a lookup table of `{ [nanoid]: id }`? - Probably N/A
//  - BE tickets for APIs etc
//  - BE ticket for UM section ids
//  - BE ticket for UM config.xml transfer props to form-def.xml and remove file.
// 		- Changes have been made on the UI to assume controller, imageThumbnail, no-template-required and paths are in form-def.xml (e.g. parseLegacyFormDefinition)
//  - BE ticket: `/studio/api/2/configuration/content-type/usage` API replies with paths and within the UI (fetchContentTypeUsage) it'll immediately fetch the ContentItem for each path. Could we update for API to return ContentItems?
//  - Can we move display-template, no-template-required and merge-strategy to the root of the type def? If so, update BE, UI and UM
//    - If not moved, drop `label` & `type`?
//  - Should we rename the root tag on form-def.xml from `form` to something like `type`, `contentType` or so?
//  - Can we drop iceId?
// 	- Should we use UM to remove from maxlength property and move into constraints? Also fix spelling to `maxLength`
// 	- Can we add created, modified, createdBy and modifiedBy to the XML?
//  - Assess removal of internalName/disabled controls.
