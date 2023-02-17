/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ContentType, LegacyContentType, LookupTable } from '../../models';
import useSpreadState from '../../hooks/useSpreadState';
import { FormattedMessage, useIntl } from 'react-intl';
import { asLocalizedDateTime } from '../../utils/datetime';
import useLocale from '../../hooks/useLocale';
import { reversePluckProps } from '../../utils/object';
import { useContentTypePreviewImage } from '../NewContentDialog';
import { useDispatch } from 'react-redux';
import { editContentTypeTemplate } from '../../state/actions/misc';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import translations from './translations';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import { editControllerActionCreator } from '../../utils/itemActions';
import DeleteContentTypeDialog from '../DeleteContentTypeDialog';
import getStyles from './styles';
import ContentTypeSection from './ContentTypeSection';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import IconButton from '@mui/material/IconButton';
import { fetchContentType } from '../../services/contentTypes';
import CreateContentTypeFieldDialog from '../CreateContentTypeFieldDialog/CreateContentTypeFieldDialog';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableLocation } from 'react-beautiful-dnd';
import { FIELD_DROPPABLE_TYPE, SECTION_DROPPABLE_TYPE } from './utils';

export interface ContentTypeEditorProps {
  config: LegacyContentType;
  onGoBack(): void;
}

const getInfoFromDraggableLocation = (
  formDefinition: ContentType,
  repeatingFieldsOrder: LookupTable<string[]>,
  location: DraggableLocation
) => {
  const { droppableId } = location;
  const droppableIdParts = droppableId.split('|');
  const isRepeatingGroup = droppableIdParts.length > 1;
  let field;
  let fieldId;
  let containerIndex;
  let container;

  if (isRepeatingGroup) {
    const repeatingId = droppableIdParts[1];
    container = formDefinition.fields[repeatingId];
    fieldId = repeatingFieldsOrder[repeatingId][location.index];
    field = container.fields[fieldId];
  } else {
    containerIndex = parseInt(droppableIdParts[0]);
    container = formDefinition.sections[containerIndex];
    fieldId = container.fields[location.index];
    field = formDefinition.fields[fieldId];
  }

  return {
    isRepeatingGroup,
    index: location.index,
    fieldId,
    field,
    containerIndex,
    container
  };
};

const parseResult = (formDefinition: ContentType, repeatingFieldsOrder: LookupTable<string[]>, result: DropResult) => {
  const { source, destination } = result;
  return {
    source: getInfoFromDraggableLocation(formDefinition, repeatingFieldsOrder, source),
    destination: getInfoFromDraggableLocation(formDefinition, repeatingFieldsOrder, destination)
  };
};

const reorderSections = (formDefinition: ContentType, result: DropResult) => {
  const { destination, source } = result;

  const newSectionsOrder = Array.from(formDefinition.sections);
  const section = formDefinition.sections[source.index];
  newSectionsOrder.splice(source.index, 1);
  newSectionsOrder.splice(destination.index, 0, section);

  return newSectionsOrder;
};

const reorderFields = (
  formDefinition: ContentType,
  repeatingFieldsOrder: LookupTable<string[]>,
  result: DropResult
) => {
  const parsedResult = parseResult(formDefinition, repeatingFieldsOrder, result);
  const { source, destination } = parsedResult;
  let newRepeatingFieldsOrder;
  let repeatingGroupFields;

  console.log('formDefinition', formDefinition);
  console.log('parsedResult', parsedResult);

  const newSourceContainer = JSON.parse(JSON.stringify(source.container));
  const newDestinationContainer = JSON.parse(JSON.stringify(destination.container));

  const sourceContainerIndex = source.containerIndex;
  const destinationContainerIndex = destination.containerIndex;

  const newSections = Array.from(formDefinition.sections);
  const newFormDefFields = JSON.parse(JSON.stringify(formDefinition.fields));

  if (sourceContainerIndex === destinationContainerIndex) {
    // If field is moved inside its own section

    const newFields = newSourceContainer.fields;
    newFields.splice(source.index, 1);
    newFields.splice(destination.index, 0, source.fieldId);

    // Update sections array
    newSections[sourceContainerIndex] = newSourceContainer;
  } else if (
    source.isRepeatingGroup &&
    destination.isRepeatingGroup &&
    source.container.id &&
    destination.container.id
  ) {
    // If both source and destination are repeating groups, and are the same repeating group
    // TODO!
  } else {
    // If field is moved to another section, or between rep groups

    if (source.isRepeatingGroup) {
      // If source is repeating group
      // TODO, remove field from repeating group fields lookup table, update rep-groups order lookup table
      const repeatingGroupId = source.container.id;
      repeatingGroupFields = JSON.parse(JSON.stringify(formDefinition.fields[repeatingGroupId].fields));
      delete repeatingGroupFields[source.fieldId];
      newRepeatingFieldsOrder = {
        ...repeatingFieldsOrder,
        [repeatingGroupId]: repeatingFieldsOrder[repeatingGroupId].splice(source.index, 1)
      };
      newFormDefFields[repeatingGroupId].fields = repeatingGroupFields;
    } else {
      // If source is not repeating group - Update sourceFields array
      const newSourceFields = newSourceContainer.fields;
      newSourceFields.splice(source.index, 1);
      newSections[sourceContainerIndex] = newSourceContainer;
    }

    if (destination.isRepeatingGroup) {
      // If destination is repeating group
      // TODO!
    } else {
      // If source is not repeating group - Update destinationFields array
      const newDestinationFields = newDestinationContainer.fields;
      newDestinationFields.splice(destination.index, 0, source.fieldId);

      // If source is a repeating group, I need to get the source field and put it in the form definition fields lookup.
      if (source.isRepeatingGroup) {
        newFormDefFields[source.field.id] = source.field;
      }

      newSections[destinationContainerIndex] = newDestinationContainer;
    }
  }

  return {
    sections: newSections,
    fields: newFormDefFields,
    repeatingFieldsOrder: newRepeatingFieldsOrder
  };
};

export function ContentTypeEditor(props: ContentTypeEditorProps) {
  const { onGoBack } = props;
  const [config, setConfig] = useSpreadState(props.config);
  const [formDefinition, setFormDefinition] = useSpreadState(null);
  const [repeatingFieldsOrder, setRepeatingFieldsOrder] = useSpreadState({});
  const { name: contentTypeId, label, lastUpdated, type } = config;
  const imageSrc = useContentTypePreviewImage(contentTypeId);
  const locale = useLocale();
  const dispatch = useDispatch();
  const deleteContentTypeDialogState = useEnhancedDialogState();
  const createFieldDialogState = useEnhancedDialogState();
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const sx = getStyles();

  // region effects
  useEffect(() => {
    if (config) {
      fetchContentType(siteId, config.name).subscribe((definition) => {
        setFormDefinition(definition);
        const repFieldsOrder = {};
        Object.entries(definition.fields).forEach(([key, value]) => {
          if (value.type === 'repeat') {
            repFieldsOrder[key] = Object.keys(value.fields);
          }
        });
        setRepeatingFieldsOrder(repFieldsOrder);
      });
    }
  }, [config, setFormDefinition, siteId, setRepeatingFieldsOrder]);
  // endregion

  const editTemplate = () => {
    dispatch(editContentTypeTemplate({ contentTypeId }));
  };

  const editController = () => {
    dispatch(editControllerActionCreator(formDefinition.type, formDefinition.id));
  };

  const openCreateFieldDialog = () => {
    createFieldDialogState.onOpen();
  };

  // region DND test
  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // Dropped outside the list or moving to the same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    if (type === SECTION_DROPPABLE_TYPE) {
      // Reordering section
      setFormDefinition({
        ...formDefinition,
        sections: reorderSections(formDefinition, result)
      });
    } else if (type === FIELD_DROPPABLE_TYPE) {
      // Reordering field
      const reorderedFields = reorderFields(formDefinition, repeatingFieldsOrder, result);

      setFormDefinition({
        ...formDefinition,
        ...(reorderedFields.sections && { sections: reorderedFields.sections }),
        ...(reorderedFields.fields && { fields: reorderedFields.fields })
      });
    }
  };
  // endregion

  return (
    <>
      <GlobalAppToolbar
        title={formatMessage(translations.newContentType)}
        startContent={
          <IconButton onClick={() => onGoBack()}>
            <ArrowBackOutlinedIcon />
          </IconButton>
        }
      />
      <Box display="flex">
        {/* TODO: add loading/error views */}
        {formDefinition && (
          <>
            <Box flexGrow={1} p={2} sx={sx.body}>
              <Card sx={sx.contentTypeInfo}>
                <CardMedia component="img" sx={{ width: 208 }} image={imageSrc} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography variant="body1">
                      {type === 'component' ? (
                        <FormattedMessage id="words.component" defaultMessage="Component" />
                      ) : (
                        <FormattedMessage id="words.page" defaultMessage="Page" />
                      )}
                      &nbsp;• {contentTypeId}
                    </Typography>
                    <Typography component="div" variant="h6" sx={sx.semibold}>
                      {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                      <FormattedMessage
                        id="contentTypeEditor.lastModified"
                        defaultMessage="Last modified on <b>{modifiedDate}</b>"
                        values={{
                          modifiedDate: asLocalizedDateTime(
                            lastUpdated,
                            locale.localeCode,
                            reversePluckProps(locale.dateTimeFormatOptions, 'hour', 'minute', 'second')
                          ),
                          b: (message) => {
                            return <strong>{message}</strong>;
                          }
                        }}
                      />
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="text" disabled>
                        <FormattedMessage id="contentTypeEditor.editProperties" defaultMessage="Edit Properties" />
                      </Button>
                      <Button variant="text" onClick={editTemplate}>
                        <FormattedMessage id="contentTypeEditor.editTemplate" defaultMessage="Edit Template" />
                      </Button>
                      <Button variant="text" onClick={editController}>
                        <FormattedMessage id="contentTypeEditor.editController" defaultMessage="Edit Controller" />
                      </Button>
                      <Button variant="text" color="error">
                        <FormattedMessage id="contentTypeEditor.deleteType" defaultMessage="Delete Type" />
                      </Button>
                    </Box>
                  </CardContent>
                </Box>
              </Card>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections" type="sections">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {formDefinition?.sections.map((section, index) => (
                        <Draggable key={index} draggableId={`section-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <ContentTypeSection
                                {...section}
                                sectionIndex={index}
                                fieldsDefinitions={formDefinition.fields}
                                repeatingFieldsOrder={repeatingFieldsOrder}
                                onAddField={openCreateFieldDialog}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Box display="flex" justifyContent="center">
                <Button
                  variant="outlined"
                  sx={{ borderStyle: 'dashed !important', borderRadius: '4px' }}
                  onClick={addSection}
                >
                  <FormattedMessage id="contentTypeEditor.addSection" defaultMessage="Add Section" />
                </Button>
              </Box>
            </Box>
            <CreateContentTypeFieldDialog
              open={createFieldDialogState.open}
              onClose={createFieldDialogState.onClose}
              isSubmitting={createFieldDialogState.isSubmitting}
              hasPendingChanges={createFieldDialogState.hasPendingChanges}
              isMinimized={createFieldDialogState.isMinimized}
            />
            <DeleteContentTypeDialog
              open={deleteContentTypeDialogState.open}
              onClose={deleteContentTypeDialogState.onClose}
              isSubmitting={deleteContentTypeDialogState.isSubmitting}
              hasPendingChanges={deleteContentTypeDialogState.hasPendingChanges}
              isMinimized={deleteContentTypeDialogState.isMinimized}
              onSubmittingAndOrPendingChange={deleteContentTypeDialogState.onSubmittingAndOrPendingChange}
              contentType={formDefinition}
              onComplete={() => {
                deleteContentTypeDialogState.onClose();
              }}
            />
          </>
        )}
      </Box>
    </>
  );
}

export default ContentTypeEditor;
