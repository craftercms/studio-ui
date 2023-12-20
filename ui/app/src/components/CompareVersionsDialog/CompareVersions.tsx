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
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { diffArrays } from './utils';
import useLocale from '../../hooks/useLocale';
import { asLocalizedDateTime } from '../../utils/datetime';
import AsyncVideoPlayer from '../AsyncVideoPlayer';
import Button from '@mui/material/Button';

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
  a: ContentInstance;
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

interface CompareVersionsDetailsContainerProps {
  contentA: ContentInstance;
  contentB: ContentInstance;
  unChanged: boolean;
  renderContent: (content) => React.ReactNode;
  noContent?: React.ReactNode;
}
function CompareVersionsDetailsContainer(props: CompareVersionsDetailsContainerProps) {
  const { contentA, contentB, unChanged, renderContent, noContent = <Box>no content set</Box> } = props;

  return !unChanged ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        '& img': {
          maxHeight: '200px'
        }
      }}
    >
      {contentA ? renderContent(contentA) : noContent}
      {contentB ? renderContent(contentB) : noContent}
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        '& img': {
          maxHeight: '200px'
        }
      }}
    >
      {contentA ? renderContent(contentA) : noContent}
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
  const fieldType = field.type;
  const locale = useLocale();

  let contentA = a[field.id];
  let contentB = b[field.id];

  useEffect(() => {
    setOpen(!unChanged);
  }, [unChanged, setOpen]);

  useMount(() => {
    switch (fieldType) {
      case 'text':
      case 'html':
      case 'image':
        setUnChanged(contentA === contentB);
        break;
      case 'node-selector':
      case 'checkbox-group':
        setUnChanged(JSON.stringify(contentA ?? '') === JSON.stringify(contentB ?? ''));
        break;
      default:
        setUnChanged(contentA === contentB);
        break;
    }
  });

  return (
    <Accordion
      key={field.id}
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
        {fieldType === 'text' || fieldType === 'html' ? (
          !unChanged ? (
            <MonacoWrapper contentA={contentA} contentB={contentB} isHTML={fieldType === 'html'} />
          ) : (
            <Typography>{contentA}</Typography>
          )
        ) : fieldType === 'node-selector' ? (
          <ContentInstanceComponents contentA={contentA} contentB={contentB} />
        ) : fieldType === 'checkbox-group' ? (
          !unChanged ? (
            <MonacoWrapper
              contentA={(contentA ?? []).map((item) => item.key).join('\n')}
              contentB={(contentB ?? []).map((item) => item.key).join('\n')}
            />
          ) : (
            <Box>
              {contentA.map((item) => (
                <Typography key={item.key}>{item.key}</Typography>
              ))}
            </Box>
          )
        ) : (
          <CompareVersionsDetailsContainer
            contentA={contentA}
            contentB={contentB}
            unChanged={unChanged}
            renderContent={(content) =>
              fieldType === 'image' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img src={content} alt="" />
                  <Typography variant="subtitle2">{content}</Typography>
                </Box>
              ) : fieldType === 'video-picker' ? (
                <Box sx={{ textAlign: 'center' }}>
                  <AsyncVideoPlayer playerOptions={{ src: content, controls: true }} />
                  <Typography variant="subtitle2">{content}</Typography>
                </Box>
              ) : fieldType === 'time' ? (
                <Tooltip title={content}>
                  <Typography>{content}</Typography>
                </Tooltip>
              ) : fieldType === 'date-time' ? (
                <Tooltip title={content}>
                  <Typography>
                    {content
                      ? asLocalizedDateTime(
                          new Date(content).getTime(),
                          locale.localeCode,
                          locale.dateTimeFormatOptions
                        )
                      : ''}
                  </Typography>
                </Tooltip>
              ) : fieldType === 'boolean' ? (
                <Typography>
                  {content ? (
                    <FormattedMessage defaultMessage="Checked" />
                  ) : (
                    <FormattedMessage defaultMessage="Unchecked" />
                  )}
                </Typography>
              ) : fieldType === 'checkbox-group' ? (
                <Box>
                  {content.map((item) => (
                    <Typography>{item.key}</Typography>
                  ))}
                </Box>
              ) : (
                <Box>{JSON.stringify(content)}</Box>
              )
            }
          />
        )}
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
  const [diff, setDiff] = useState(null);
  const { formatMessage } = useIntl();
  const itemsByPath = useItemsByPath();
  const contentById = useMemo(() => {
    const byId = {};
    [...(contentA ?? []), ...(contentB ?? [])].forEach((item) => {
      byId[item.craftercms.id] = item;
    });
    return byId;
  }, [contentA, contentB]);

  const getItemLabel = (item) => {
    return item.craftercms.label ?? itemsByPath?.[item.craftercms.path]?.label ?? item.craftercms.id;
  };

  const getItemStatus = (diff): string => {
    if (diff.added) {
      return 'new';
    }
    if (diff.removed) {
      return 'deleted';
    }
    return 'unchanged';
  };

  useEffect(() => {
    setDiff(
      diffArrays(
        (contentA ?? []).map((item) => item.craftercms.id),
        (contentB ?? []).map((item) => item.craftercms.id)
      )
    );
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
      {diff?.length ? (
        diff.map((part) =>
          part.value.map((id, index) => (
            <Box
              sx={{
                padding: '4px 15px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                borderRadius: '10px',
                alignItems: 'center',
                '&.unchanged': {
                  color: (theme) => (theme.palette.mode === 'dark' ? palette.gray.dark7 : palette.gray.medium4),
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? palette.gray.medium4 : palette.gray.light1
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
              className={getItemStatus(part) ?? ''}
              key={`${id}-${index}`}
            >
              <Typography sx={{ fontSize: '14px' }}> {getItemLabel(contentById[id])}</Typography>
              {getItemStatus(part) === 'unchanged' && (
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: (theme) => (theme.palette.mode === 'dark' ? palette.gray.dark7 : palette.gray.medium4)
                  }}
                >
                  {formatMessage(translations.unchanged)}
                </Typography>
              )}
            </Box>
          ))
        )
      ) : (
        <EmptyState title={formatMessage(translations.noItemsStatus)} />
      )}
    </Box>
  );
}

interface MonacoWrapperProps {
  contentA: string;
  contentB: string;
  isHTML?: boolean;
}

function removeTags(content: string) {
  return content.replace(/<[^>]*>?/gm, '');
}

function MonacoWrapper(props: MonacoWrapperProps) {
  const { contentA, contentB, isHTML = false } = props;
  const ref = useRef();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [cleanText, setCleanText] = useState(false);
  const originalContent = useMemo(() => (cleanText ? removeTags(contentA ?? '') : contentA), [cleanText, contentA]);
  const modifiedContent = useMemo(() => (cleanText ? removeTags(contentB ?? '') : contentB), [cleanText, contentB]);
  const [diffEditor, setDiffEditor] = useState(null);

  useEffect(() => {
    if (ref.current) {
      withMonaco((monaco) => {
        setDiffEditor(
          monaco.editor.createDiffEditor(ref.current, {
            scrollbar: {
              alwaysConsumeMouseWheel: false
            },
            readOnly: true
          })
        );
      });
    }
  }, []);

  useEffect(() => {
    if (diffEditor) {
      withMonaco((monaco) => {
        const originalModel = monaco.editor.createModel(originalContent, 'html');
        const modifiedModel = monaco.editor.createModel(modifiedContent, 'html');
        monaco.editor.setTheme(prefersDarkMode ? 'vs-dark' : 'vs');
        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      });
    }
  }, [diffEditor, originalContent, modifiedContent, prefersDarkMode]);

  return (
    <Box>
      {isHTML && (
        <Button variant="outlined" onClick={() => setCleanText(!cleanText)}>
          {cleanText ? (
            <FormattedMessage defaultMessage="Show HTML" />
          ) : (
            <FormattedMessage defaultMessage="Show text" />
          )}
        </Button>
      )}
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
    </Box>
  );
}
