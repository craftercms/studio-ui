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

import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { ContentTypeField as ContentTypeFieldType, LookupTable } from '../../models';
import { ContentTypeField } from './ContentTypeField';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { FIELD_DROPPABLE_TYPE } from './utils';

export interface ContentTypeSectionProps {
  title: string;
  description: string;
  expandByDefault: boolean;
  fields: string[];
  fieldsDefinitions: LookupTable<ContentTypeFieldType>;
  sectionIndex: number;
  onAddField(): void;
}

export function ContentTypeSection(props: ContentTypeSectionProps) {
  const { title, fields, fieldsDefinitions, sectionIndex, onAddField } = props;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Accordion expanded={isOpen}>
      <AccordionSummary
        expandIcon={
          <IconButton onClick={() => setIsOpen(!isOpen)}>
            <ExpandMoreIcon />
          </IconButton>
        }
      >
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Droppable droppableId={`${sectionIndex}`} type={FIELD_DROPPABLE_TYPE}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field} index={index} draggableId={`${sectionIndex}|${field}`}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <ContentTypeField field={fieldsDefinitions[field]} sectionId={`${sectionIndex}|${field}`} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 1, borderStyle: 'dashed !important', borderRadius: '4px' }}
          onClick={onAddField}
        >
          <FormattedMessage id="contentTypeEditor.addFields" defaultMessage="Add Fields" />
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}

export default ContentTypeSection;
