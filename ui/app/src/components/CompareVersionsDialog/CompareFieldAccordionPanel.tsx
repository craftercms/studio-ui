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

import React, { RefObject, useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccordionDetails from '@mui/material/AccordionDetails';
import { CompareFieldPanel, CompareFieldPanelProps } from './CompareFieldPanel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrowsRounded';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import IconButton from '@mui/material/IconButton';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';

export interface CompareFieldPanelAccordionProps extends CompareFieldPanelProps {
  selected: boolean;
  fieldRef: RefObject<HTMLDivElement>;
}

export function CompareFieldAccordionPanel(props: CompareFieldPanelAccordionProps) {
  const { fieldRef, selected, ...rest } = props;
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (selected) {
      setExpanded(true);
    }
  }, [selected, setExpanded]);

  return (
    <Accordion
      ref={fieldRef}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      slotProps={{ transition: { mountOnEnter: true } }}
      sx={{
        margin: 0,
        border: 0,
        boxShadow: 'none',
        background: 'none',
        '&.Mui-expanded': {
          margin: 0,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ [`.${accordionSummaryClasses.content}`]: { justifyContent: 'space-between', alignItems: 'center' } }}
      >
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {props.field.name}{' '}
          </Box>
          ({props.field.id})
        </Typography>
        <Box>
          <Button startIcon={<CompareArrowsIcon />}>
            <FormattedMessage defaultMessage="Compare" />
          </Button>
          <Button>
            <FormattedMessage defaultMessage="Show whitespace" />
          </Button>
          <Button>
            <FormattedMessage defaultMessage="Split view" />
          </Button>
          <Button>
            <FormattedMessage defaultMessage="No Wrap" />
          </Button>
          <Divider orientation="vertical" sx={{ display: 'inline-flex', height: '25px', ml: 2, mr: 2 }} />
          <IconButton size="small" color={'primary'}>
            <TextSnippetOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color={'default'}>
            <CodeOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <CompareFieldPanel {...rest} showFieldsNavigation={false} dynamicHeight />
      </AccordionDetails>
    </Accordion>
  );
}
