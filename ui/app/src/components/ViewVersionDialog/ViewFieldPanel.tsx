/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { ContentTypeField } from '../../models';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import React from 'react';
import ContentFieldView from './ContentFieldView';

interface ViewFieldPanelProps {
  content: any;
  field: ContentTypeField;
  xml: string;
  contentTypeFields: ContentTypeField[];
}

export function ViewFieldPanel(props: ViewFieldPanelProps) {
  const { content, field, contentTypeFields, xml } = props;
  return (
    <Accordion
      sx={{
        margin: 0,
        '&.Mui-expanded': {
          margin: 0,
          borderBottom: `1px solid rgba(0,0,0,0.12)`
        }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {field.name}
          </Box>{' '}
          ({field.id})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ContentFieldView
          content={content}
          field={field}
          contentTypeFields={contentTypeFields}
          xml={xml}
          showToolbar={false}
        />
      </AccordionDetails>
    </Accordion>
  );
}

export default ViewFieldPanel;
