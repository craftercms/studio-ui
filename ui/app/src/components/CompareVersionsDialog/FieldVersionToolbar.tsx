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

import Button from '@mui/material/Button';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import React, { ReactNode } from 'react';
import { ContentTypeField } from '../../models';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';

interface FieldVersionToolbarProps {
  field: ContentTypeField;
  contentTypeFields: ContentTypeField[];
  compareXml: boolean;
  showCleanText: boolean;
  actions?: ReactNode;
  showFieldsNavigation?: boolean;
  setCompareXml(value: boolean): void;
  setShowCleanText(value: boolean): void;
  onSelectField?(field: ContentTypeField): void;
}

export function FieldVersionToolbar(props: FieldVersionToolbarProps) {
  const {
    field,
    contentTypeFields,
    onSelectField,
    compareXml,
    setCompareXml,
    showCleanText,
    setShowCleanText,
    actions,
    showFieldsNavigation = true
  } = props;
  const currentFieldIndex = contentTypeFields.findIndex((f) => f.id === field.id);
  const nextField = contentTypeFields[currentFieldIndex + 1] || contentTypeFields[0];
  const previousField = contentTypeFields[currentFieldIndex - 1] || contentTypeFields[contentTypeFields.length - 1];

  const onSelectNextField = (fieldId: string) => {
    const index = contentTypeFields.findIndex((f) => f.id === fieldId);
    const nextField = contentTypeFields[index + 1] || contentTypeFields[0];
    onSelectField?.(nextField);
  };

  const onSelectPreviousField = (fieldId: string) => {
    const index = contentTypeFields.findIndex((f) => f.id === fieldId);
    const previousField = contentTypeFields[index - 1] || contentTypeFields[contentTypeFields.length - 1];
    onSelectField?.(previousField);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {showFieldsNavigation && contentTypeFields.length > 1 && (
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={() => onSelectPreviousField(field.id)}
          title={previousField.name}
        >
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 160 }}>
            {previousField.name}
          </Typography>
        </Button>
      )}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexGrow: 1,
          pb: 1,
          pt: 1,
          pl: 2,
          pr: 2,
          ml: 2,
          mr: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold' }}>{field.name}</Typography>
          <InfoOutlinedIcon sx={{ ml: 2, color: (theme) => theme.palette.text.secondary }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {actions}
          {Boolean(actions) && (
            <Divider orientation="vertical" sx={{ display: 'inline-flex', height: '25px', ml: 2, mr: 2 }} />
          )}
          {field.type === 'html' && (
            <Tooltip title={<FormattedMessage defaultMessage="Show clean text" />}>
              <IconButton
                size="small"
                onClick={() => {
                  setShowCleanText(true);
                  setCompareXml(false);
                }}
                color={showCleanText && !compareXml ? 'primary' : 'default'}
              >
                <NotesRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={<FormattedMessage defaultMessage="Compare" />}>
            <IconButton
              size="small"
              onClick={() => {
                setShowCleanText(false);
                setCompareXml(false);
              }}
              color={!showCleanText && !compareXml ? 'primary' : 'default'}
            >
              <TextSnippetOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<FormattedMessage defaultMessage="Compare XML" />}>
            <IconButton size="small" onClick={() => setCompareXml(true)} color={compareXml ? 'primary' : 'default'}>
              <CodeOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      {showFieldsNavigation && contentTypeFields.length > 1 && (
        <Button
          endIcon={<NavigateNextRoundedIcon />}
          onClick={() => onSelectNextField(field.id)}
          title={nextField.name}
        >
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 160 }}>
            {nextField.name}
          </Typography>
        </Button>
      )}
    </Box>
  );
}

export default FieldVersionToolbar;
