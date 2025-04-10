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
	createVirtualTypeForDataSource,
	createVirtualTypeForField,
	createVirtualTypeFormContext,
	createVirtualTypeForSection,
	NEW_FIELD_ID,
	prepareSerializeToXmlTypeObject,
	reverseTypeFieldValuesObject,
	TypePropsToEdit,
	typePropsToEdit
} from '../utils';
import { extractAtomValues, useShowAlert } from '../../FormsEngine/lib/formUtils';
import TypeBuilderFormsEngine, { FieldFormViewProps } from './TypeBuilderFormsEngine';
import { FieldChipProps } from './FieldChip';
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
import { writeConfiguration } from '../../../services/configuration';
import { createFormDefinitionPathFromTypeId } from '../../../utils/contentType';
import { useDispatch } from 'react-redux';
import { popDialog, pushDialog } from '../../../state/actions/dialogStack';
import { nanoid } from 'nanoid';

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

export const EditTypeView = forwardRef<HTMLDivElement, EditTypeAppProps>((props, ref) => {
	const { onClose } = props;

	const site = useActiveSiteId();
	const contentTypesLookup = useContentTypes();
	const showAlert = useShowAlert();
	const { formatMessage } = useIntl();
	const jotai = useMemo(() => createJotai(), []); // TODO: Use stable memo?
	const dispatch = useDispatch();

	const dialogContext = useEnhancedDialogContext(); // TODO: keep dialog context inform of pending changes/submitting
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
			...extraFormProps
		});
		// Note: things set here should be cleaned up in closeAndCleanup
		stateRef.current.activeFormContext = stableFormContext;
		setVirtualContentType(virtualType);
		setOpen(true);
	};

	const handleFieldSelected: FieldChipProps['onFieldSelected'] = (fieldIdPath, field) => {
		if (!closeAndCleanup()) return;

		const controlDescriptor = controlDescriptors[field.type as BuiltInControlType];
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
			{ field, fieldIdPath, controlDescriptor: applyTranslations(controlDescriptor, formatMessage) }
		);
		setSelectedFieldIdPath(fieldIdPath);
		stateRef.current.selectedField = field;
	};
	const handleSectionSelected: TypeDetailsViewProps['onSectionSelected'] = (section) => {
		if (!closeAndCleanup()) return;
		const virtualType = createVirtualTypeForSection(sectionDescriptor, formatMessage);
		handleArtefactSelected(
			virtualType,
			createVirtualTypeFormContext(virtualType, section as unknown as LookupTable<unknown>, contentTypesLookup, {
				fieldUpdates$: stateRef.current.fieldUpdates$
			}),
			{ section }
		);
		stateRef.current.selectedSection = section;
	};
	const handleDataSourceSelected: TypeDetailsViewProps['onDataSourceSelected'] = (dataSource) => {
		if (!closeAndCleanup()) return;

		const dataSourceDescriptor = dataSourceDescriptors[dataSource.type];
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
		setSelectedFieldIdPath(dataSource.id);
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
			case 'template':
				showAlert(`Not implemented (template)`);
				break;
			case 'jsController':
				showAlert({
					message: `Not implemented (jsController)`,
					children: (
						<Typography component="ol" variant="body2" marginTop={1} textAlign="left">
							<li>Open code editor</li>
							<li>Two</li>
							<li>Three</li>
						</Typography>
					)
				});
				break;
			case 'groovyController':
				showAlert(`Not implemented (groovyController)`);
				break;
			case 'deleted':
				showAlert(`Not implemented (deleted)`);
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
				save(site, latestUpdate ?? type, tempActuallySaveToServer).subscribe({
					next(xml) {
						const highlighted = hljs.highlight(xml, { language: 'xml' }).value;
						setOpenXmlViewer(highlighted);
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
			defaultValue: ''
		};

		const newFieldPath = fieldPath ? `${fieldPath}.${NEW_FIELD_ID}` : NEW_FIELD_ID;
		setType(addField(type, newField, newFieldPath, sectionId, position));
		handleFieldSelected(newFieldPath, newField, null);
	};

	// region const fieldEditorView = ...
	// TODO: Add field, add section also to render on the reactive side panel
	const fieldEditorView = virtualContentType ? createElement(TypeBuilderFormsEngine, fieldFormViewProps) : null;
	// endregion

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

	const disableSave = !hasPendingChanges || Object.keys(fieldPathsWithErrors).length !== 0;
	// value={} onChange={}
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
							onEditTypeAction={handleEditTypeAction}
							onFieldSelected={handleFieldSelected}
							onDataSourceSelected={handleDataSourceSelected}
							onSectionSelected={handleSectionSelected}
							fieldPathsWithErrors={fieldPathsWithErrors}
							selectedFieldIdPath={selectedFieldIdPath}
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

function addSubField(
	parentField: ContentTypeField,
	newField: ContentTypeField,
	subFieldPath: string,
	position: number
): ContentTypeField {
	const isComposedPath = subFieldPath.includes('.');
	if (isComposedPath) {
		// If still composed, we need to find the root field and add the new field to it recursively
		const rootFieldId = subFieldPath.split('.').shift();
		return {
			...parentField,
			fields: {
				...parentField.fields,
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
		const nextFieldsArray = Object.values(parentField.fields);
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
	fieldPath: string,
	sectionId: string,
	position: number
): ContentType {
	const isComposedPath = fieldPath.includes('.');

	if (isComposedPath) {
		// If the fieldIdPath is composed, we need to find the root field and add the new field to it recursively
		const rootFieldId = fieldPath.split('.').shift();
		// When fieldIdPath is composed (inside a rep-group), sections don't change since the root fields remain the same
		return {
			...type,
			fields: {
				...type.fields,
				[rootFieldId]: addSubField(type.fields[rootFieldId], field, fieldPath.replace(`${rootFieldId}.`, ''), position)
			}
		};
	} else {
		// If not composed, we can add the field directly to the fields lookup and to the sections list
		const nextFields = { ...type.fields, [fieldPath]: field };
		const nextSections = type.sections.concat();
		const sectionIndex = nextSections.findIndex((section) => section.id === sectionId);
		const section = nextSections[sectionIndex];
		const nextSectionFields = nextSections[sectionIndex].fields.concat();
		nextSectionFields.splice(position, 0, fieldPath);
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
	const isComposedFieldIdPath = fieldIdPath.includes('.');

	if (isComposedFieldIdPath) {
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
	const isComposedFieldIdPath = fieldIdPath.includes('.');

	if (isComposedFieldIdPath) {
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
	console.log(index, selectedSection, updatedValues, updatedType);
	return updatedType;
}

function updateTypeFromDataSourceUpdate(
	type: ContentType,
	selectedDataSource: DataSource,
	updatedValues: LookupTable<unknown>
): ContentType {
	const updatedType: ContentType = { ...type, dataSources: type.dataSources.concat() };
	const index = updatedType.dataSources.findIndex((item) => item.id === selectedDataSource.id);
	updatedType.dataSources[index] = { ...selectedDataSource, properties: updatedValues };
	return updatedType;
}

// merge the basic details, the non-edited field values, the manipulated field atoms into a single object
// that gets serialized to XML and stored
function save(siteId: string, type: ContentType, tempSaveSaveToServerArgumentToBeRemoved: boolean): Observable<string> {
	const typeStructure = prepareSerializeToXmlTypeObject(type);
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

export default EditTypeView;

// TODO:
//  - i18n
//  - Because IDs can be modified, keep a lookup table of `{ [nanoid]: id }`? - Probably N/A
//  - Filter based on archetypes on type listing.
//  - BE tickets for APIs etc
//  - BE ticket for UM section ids
//  - BE ticket for UM config.xml transfer props to form-def.xml and remove file.
// 		- Changes have been made on the UI to assume controller, imageThumbnail, no-template-required and paths are in form-def.xml (e.g. parseLegacyFormDefinition)
//  - BE ticket: `/studio/api/2/configuration/content-type/usage` API replies with paths and within the UI (fetchContentTypeUsage) it'll immediately fetch the ContentItem for each path. Could we update for API to return ContentItems?
//  - Can we move display-template, no-template-required and merge-strategy to the root of the type def? If so, update BE, UI and UM
//    - If not moved, drop `label` & `type`?
//  - Should we rename the root tag on form-def.xml from `form` to something like `type`, `contentType` or so?
//  - Can we drop iceId?
//  - Translation of control descriptors and archetype templates
// 	- Should we use UM to remove from maxlength property and move into constraints? Also fix spelling to `maxLength`
// 	- Can we add created, modified, createdBy and modifiedBy to the XML?
