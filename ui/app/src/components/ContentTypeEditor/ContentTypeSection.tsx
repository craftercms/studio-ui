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

export interface ContentTypeSectionProps {
  title: string;
  description: string;
  expandByDefault: boolean;
  fields: string[];
  fieldsDefinitions: LookupTable<ContentTypeFieldType>;
}

export function ContentTypeSection(props: ContentTypeSectionProps) {
  const { title, fields, fieldsDefinitions } = props;
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
        {fields.map((field) => (
          <>
            <ContentTypeField field={fieldsDefinitions[field]} />
          </>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default ContentTypeSection;
