/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import ContentInstance from '../../models/ContentInstance';
import { LookupTable } from '../../models/LookupTable';
import ContentType, { ContentTypeField } from '../../models/ContentType';
import React, { useEffect, useRef, useState } from 'react';
import palette from '../../styles/palette';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import ListItemText from '@mui/material/ListItemText';
import { AsDayMonthDateTime } from '../VersionList';
import Paper from '@mui/material/Paper';
import useMount from '../../hooks/useMount';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import { EmptyState } from '../EmptyState';
import { withMonaco } from '../../utils/system';
import Box from '@mui/material/Box';
import { systemPropsList } from '../../utils/content';
import useMediaQuery from '@mui/material/useMediaQuery';
import useItemsByPath from '../../hooks/useItemsByPath';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { batchActions } from '../../state/actions/misc';
import { compareVersion } from '../../state/actions/versions';
import { showCompareVersionsDialog, showHistoryDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';

const translations = defineMessages({
  changed: {
    id: 'words.changed',
    defaultMessage: 'Changed'
  },
  unchanged: {
    id: 'words.unchanged',
    defaultMessage: 'Unchanged'
  },
  deleted: {
    id: 'words.deleted',
    defaultMessage: 'Deleted'
  },
  empty: {
    id: 'words.empty',
    defaultMessage: 'Empty'
  },
  noItemsStatus: {
    id: 'compareVersionsDialog.noItemsStatus',
    defaultMessage: 'No items'
  }
});

interface CompareVersionsProps {
  a: ContentInstance; // TODO: check, this doesn't seem like a content instance!
  b: any;
  contentTypeId: string;
  contentTypes: LookupTable<ContentType>;
}

export function CompareVersions(props: CompareVersionsProps) {
  const { a, b, contentTypes, contentTypeId } = props;
  const values = Object.values(contentTypes[contentTypeId].fields) as ContentTypeField[];
  const dispatch = useDispatch();

  const compareVersionDialogWithActions = () =>
    showCompareVersionsDialog({
      disableItemSwitching: true,
      rightActions: [
        {
          icon: { id: '@mui/icons-material/HistoryRounded' },
          onClick: showHistoryDialog({}),
          'aria-label': <FormattedMessage defaultMessage="Back to history list" />
        }
      ]
    });

  const compareTo = (versionNumber: string) => {
    dispatch(batchActions([compareVersion({ id: versionNumber }), compareVersionDialogWithActions()]));
  };

  return (
    <Box
      sx={{
        p: 1,
        background: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default
      }}
    >
      <Box
        component="section"
        sx={{
          display: 'flex',
          justifyContent: 'space-around'
        }}
      >
        <Box
          sx={{
            flexBasis: '50%',
            margin: '0 10px 10px 10px',
            '& .primaryText': {
              color: (theme) => theme.palette.text.primary
            }
          }}
        >
          <ListItemText
            primary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AsDayMonthDateTime date={a.dateModified} />
                <Tooltip title={<FormattedMessage defaultMessage="Edit" />}>
                  <IconButton onClick={() => compareTo(a.versionNumber)} sx={{ ml: 1 }}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: a.versionNumber,
                  span: (msg) => <span className="primaryText">{msg}</span>
                }}
              />
            }
          />
        </Box>
        <Box
          sx={{
            flexBasis: '50%',
            margin: '0 10px 10px 10px',
            '& .primaryText': {
              color: (theme) => theme.palette.text.primary
            }
          }}
        >
          <ListItemText
            primary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <AsDayMonthDateTime date={b.dateModified} />
                <Tooltip title={<FormattedMessage defaultMessage="Edit" />}>
                  <IconButton onClick={() => compareTo(b.versionNumber)} sx={{ ml: 1 }}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: b.versionNumber,
                  span: (msg) => <span className="primaryText">{msg}</span>
                }}
              />
            }
          />
        </Box>
      </Box>
      <Box
        component="section"
        sx={{
          background: (theme) => theme.palette.background.paper
        }}
      >
        <Paper>
          {contentTypes &&
            values
              .filter((value) => !systemPropsList.includes(value.id))
              .map((field) => <CompareFieldPanel a={a.content} b={b.content} field={field} key={field.id} />)}
        </Paper>
      </Box>
    </Box>
  );
}

interface CompareFieldPanelProps {
  a: ContentInstance;
  b: ContentInstance;
  field: ContentTypeField;
}

function CompareFieldPanel(props: CompareFieldPanelProps) {
  const { a, b, field } = props;
  const [unChanged, setUnChanged] = useState(false);
  const [open, setOpen] = useState(false);
  const { formatMessage } = useIntl();

  let contentA = a[field.id];
  let contentB = b[field.id];

  useEffect(() => {
    setOpen(!unChanged);
  }, [unChanged, setOpen]);

  useMount(() => {
    switch (field.type) {
      case 'text':
      case 'html':
      case 'image':
        setUnChanged(contentA === contentB);
        break;
      case 'node-selector': {
        setUnChanged(JSON.stringify(contentA) === JSON.stringify(contentB));
        break;
      }
      default:
        setUnChanged(contentA === contentB);
        break;
    }
  });

  return (
    <Accordion
      key={field.id}
      expanded={open}
      onChange={() => setOpen(!open)}
      sx={{
        margin: 0,
        border: 0,
        boxShadow: 'none',
        '&.Mui-expanded': {
          margin: 0,
          borderBottom: '1px solid rgba(0,0,0,0.12)'
        }
      }}
      TransitionProps={{ mountOnEnter: true }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {field.name}{' '}
          </Box>
          ({field.id})
        </Typography>
        {unChanged && (
          <Chip
            label={formatMessage(translations.unchanged)}
            sx={{
              marginLeft: 'auto',
              height: '26px',
              color: (theme) => (theme.palette.mode === 'dark' ? palette.gray.dark7 : palette.gray.medium4),
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1)
            }}
          />
        )}
      </AccordionSummary>
      <AccordionDetails>
        {(field.type === 'text' || field.type === 'html') &&
          (!unChanged ? (
            <MonacoWrapper contentA={contentA} contentB={contentB} />
          ) : (
            <Typography>{contentA}</Typography>
          ))}
        {field.type === 'image' &&
          (!unChanged ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                '& img': {
                  maxHeight: '200px',
                  padding: '20px'
                }
              }}
            >
              <img src={contentA} alt="" />
              <img src={contentB} alt="" />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                '& img': { maxHeight: '200px' }
              }}
            >
              <img src={contentA} alt="" />
            </Box>
          ))}
        {field.type === 'node-selector' && <ContentInstanceComponents contentA={contentA} contentB={contentB} />}
      </AccordionDetails>
    </Accordion>
  );
}

interface ContentInstanceComponentsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
}

function ContentInstanceComponents(props: ContentInstanceComponentsProps) {
  const { contentA, contentB } = props;
  const [mergeContent, setMergeContent] = useState([]);
  const [status, setStatus] = useState<any>({});
  const { formatMessage } = useIntl();
  const itemsByPath = useItemsByPath();

  const getItemLabel = (item) => {
    return item.craftercms.label ?? itemsByPath?.[item.craftercms.path]?.label ?? item.craftercms.id;
  };

  useEffect(() => {
    let itemStatus = {};
    let merged = {};
    contentA.forEach((itemA, index: number) => {
      const itemB = contentB[index];
      if (!itemB || itemA.craftercms.id !== itemB.craftercms.id) {
        itemStatus[index] = 'deleted';
      } else {
        itemStatus[index] = itemA.craftercms.dateModified !== itemB.craftercms.dateModified ? 'changed' : 'unchanged';
      }
      merged[index] = itemA;
    });
    contentB.forEach((itemB, index: number) => {
      const itemA = contentA[index];
      if (!itemA || itemB.craftercms.id !== itemA.craftercms.id) {
        itemStatus[index] = 'new';
      }
      merged[index] = itemB;
    });
    setMergeContent(Object.values(merged));
    setStatus(itemStatus);
  }, [contentA, contentB]);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}
    >
      {mergeContent.length ? (
        mergeContent.map((item, index) => (
          <Box
            sx={{
              padding: '4px 15px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              borderRadius: '10px',
              alignItems: 'center',
              '&.unchanged': {
                color: palette.gray.medium4,
                backgroundColor: palette.gray.light1
              },
              '&.new': {
                color: palette.green.shade,
                backgroundColor: palette.green.highlight,
                width: '50%',
                marginLeft: 'auto'
              },
              '&.changed': {
                color: palette.yellow.shade,
                backgroundColor: palette.yellow.highlight
              },
              '&.deleted': {
                color: palette.red.shade,
                backgroundColor: palette.red.highlight,
                width: '50%',
                marginRight: 'auto'
              },
              '&:last-child': {
                marginBottom: 0
              }
            }}
            className={status[index] ?? ''}
            key={item.craftercms.id}
          >
            <Typography sx={{ fontSize: '14px' }}> {getItemLabel(item)}</Typography>
            {status[index] && status[index] !== 'new' && (
              <Typography sx={{ fontSize: '14px', color: palette.gray.medium4 }}>
                {formatMessage(translations[status[index]])}
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <EmptyState title={formatMessage(translations.noItemsStatus)} />
      )}
    </Box>
  );
}

interface MonacoWrapperProps {
  contentA: string;
  contentB: string;
}

function MonacoWrapper(props: MonacoWrapperProps) {
  const { contentA, contentB } = props;
  const ref = useRef();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    if (ref.current) {
      withMonaco((monaco) => {
        const originalModel = monaco.editor.createModel(contentA, 'text/plain');
        const modifiedModel = monaco.editor.createModel(contentB, 'text/plain');
        const diffEditor = monaco.editor.createDiffEditor(ref.current, {
          scrollbar: {
            alwaysConsumeMouseWheel: false
          }
        });
        monaco.editor.setTheme(prefersDarkMode ? 'vs-dark' : 'vs');
        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      });
    }
  }, [contentA, contentB, prefersDarkMode]);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '150px',
        '&.unChanged': {
          height: 'auto'
        }
      }}
    />
  );
}
