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
import { useHotkeys } from 'react-hotkeys-hook';
import { initialFieldViewState, useVersionsDialogContext } from './CompareVersionsDialog';
import CompareArrowsIcon from '@mui/icons-material/CompareArrowsRounded';
import { MonacoWrapper } from '../MonacoWrapper';
import { typesDiffMap } from './CompareFieldPanel';

interface FieldVersionToolbarProps {
  field: ContentTypeField;
  contentTypeFields: ContentTypeField[];
  isDiff?: boolean;
  actions?: ReactNode;
  showFieldsNavigation?: boolean;
  justContent?: boolean;
  onSelectField?(field: ContentTypeField): void;
}

export function FieldVersionToolbar(props: FieldVersionToolbarProps) {
  const {
    field,
    contentTypeFields,
    onSelectField,
    actions,
    showFieldsNavigation = true,
    isDiff = true,
    justContent
  } = props;
  const fieldType = field.type;
  const currentFieldIndex = contentTypeFields.findIndex((f) => f.id === field.id);
  const nextField = contentTypeFields[currentFieldIndex + 1] || contentTypeFields[0];
  const previousField = contentTypeFields[currentFieldIndex - 1] || contentTypeFields[contentTypeFields.length - 1];

  const [{ fieldsViewState }, contextApiRef] = useVersionsDialogContext();
  const viewState = fieldsViewState[field.id] ?? initialFieldViewState;
  const { compareXml, cleanText, xmlEditorOptions, compareMode, compareModeDisabled } = viewState;
  const showDivider =
    (!compareXml && fieldType === 'repeat') ||
    compareXml ||
    typesDiffMap[fieldType] === MonacoWrapper ||
    Boolean(actions);

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

  useHotkeys('ArrowLeft,ArrowRight', (event) => {
    switch (event.key) {
      case 'ArrowLeft':
        onSelectPreviousField(field.id);
        break;
      case 'ArrowRight':
        onSelectNextField(field.id);
        break;
    }
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: justContent ? 0 : 2 }}>
      {showFieldsNavigation && contentTypeFields.length > 1 && (
        <Button
          sx={{ mx: 1 }}
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
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexGrow: 1,
          py: 1,
          px: 2,
          ...(justContent && {
            background: 'none',
            border: 'none',
            p: 0
          })
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold' }}>{field.name}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: justContent && 1 }} onClick={(e) => e.stopPropagation()}>
          {actions}
          {!compareXml && fieldType === 'repeat' && (
            <Button
              onClick={() =>
                contextApiRef.current.setFieldViewState(field.id, {
                  compareMode: !compareMode
                })
              }
              startIcon={<CompareArrowsIcon />}
              disabled={compareModeDisabled}
            >
              <FormattedMessage defaultMessage="Compare" />
            </Button>
          )}
          {(compareXml || typesDiffMap[fieldType] === MonacoWrapper) && (
            <>
              {isDiff && (
                <>
                  <Button
                    onClick={() => {
                      contextApiRef.current.setFieldViewEditorOptionsState(field.id, {
                        ignoreTrimWhitespace: !xmlEditorOptions.ignoreTrimWhitespace
                      });
                    }}
                  >
                    {viewState?.xmlEditorOptions.ignoreTrimWhitespace ? (
                      <FormattedMessage defaultMessage="Show whitespace" />
                    ) : (
                      <FormattedMessage defaultMessage="Hide whitespace" />
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      contextApiRef.current.setFieldViewEditorOptionsState(field.id, {
                        renderSideBySide: !xmlEditorOptions.renderSideBySide
                      });
                    }}
                  >
                    {xmlEditorOptions.renderSideBySide ? (
                      <FormattedMessage defaultMessage="Unified view" />
                    ) : (
                      <FormattedMessage defaultMessage="Split view" />
                    )}
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  contextApiRef.current.setFieldViewEditorOptionsState(field.id, {
                    diffWordWrap: xmlEditorOptions.diffWordWrap === 'on' ? 'off' : 'on'
                  });
                }}
              >
                {xmlEditorOptions.diffWordWrap === 'on' ? (
                  <FormattedMessage defaultMessage="No Wrap" />
                ) : (
                  <FormattedMessage defaultMessage="Wrap" />
                )}
              </Button>
            </>
          )}
          {showDivider && (
            <Divider orientation="vertical" sx={{ display: 'inline-flex', height: '25px', ml: 2, mr: 2 }} />
          )}
          {fieldType === 'html' && (
            <Tooltip title={<FormattedMessage defaultMessage="Show clean text" />}>
              <IconButton
                size="small"
                onClick={() =>
                  contextApiRef.current.setFieldViewState?.(field.id, { cleanText: true, compareXml: false })
                }
                color={cleanText && !compareXml ? 'primary' : 'default'}
              >
                <NotesRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={<FormattedMessage defaultMessage="Compare" />}>
            <IconButton
              size="small"
              onClick={() =>
                contextApiRef.current.setFieldViewState?.(field.id, { cleanText: false, compareXml: false })
              }
              color={!cleanText && !compareXml ? 'primary' : 'default'}
            >
              <TextSnippetOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={<FormattedMessage defaultMessage="Compare XML" />}>
            <IconButton
              size="small"
              onClick={() => contextApiRef.current.setFieldViewState?.(field.id, { compareXml: true })}
              color={compareXml ? 'primary' : 'default'}
            >
              <CodeOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      {showFieldsNavigation && contentTypeFields.length > 1 && (
        <Button
          sx={{ mx: 1 }}
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
