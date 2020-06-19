/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import palette from '../../../styles/palette';
import ContentInstance from '../../../models/ContentInstance';
import { LookupTable } from '../../../models/LookupTable';
import ContentType, { ContentTypeField } from '../../../models/ContentType';
import ListItemText from '@material-ui/core/ListItemText';
import { FancyFormattedDate } from './VersionList';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import React, { useEffect, useRef, useState } from 'react';
import { Resource } from '../../../models/Resource';
import { useMount } from '../../../utils/hooks';
import * as monaco from 'monaco-editor';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';
import Paper from '@material-ui/core/Paper';
import EmptyState from '../../../components/SystemStatus/EmptyState';

const CompareVersionsStyles = makeStyles(() =>
  createStyles({
    monacoWrapper: {
      width: '100%',
      height: '150px',
      '&.unChanged': {
        height: 'auto'
      }
    },
    singleImage: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center'
    },
    imagesCompare: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        width: '50%',
        padding: '20px'
      }
    },
    compareBoxHeader: {
      display: 'flex',
      justifyContent: 'space-around'
    },
    compareBoxHeaderItem: {
      flexBasis: '50%',
      margin: '0 10px 10px 10px',
      '& .blackText': {
        color: palette.black
      }
    },
    compareVersionsContent: {
      background: palette.white
    },
    root: {
      margin: 0,
      border: 0,
      boxShadow: 'none',
      '&.Mui-expanded': {
        margin: 0,
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      }
    },
    bold: {
      fontWeight: 600
    },
    unchangedChip: {
      marginLeft: 'auto',
      height: '26px',
      color: palette.gray.medium4,
      backgroundColor: palette.gray.light1
    }
  })
);

const ContentInstanceComponentsStyles = makeStyles(() =>
  createStyles({
    componentsWrapper: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    },
    component: {
      padding: '10px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      borderRadius: '5px',
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
    },
    status: {
      fontSize: '0.8125rem',
      color: palette.gray.medium4
    }
  })
);

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
  noItems: {
    id: 'compare.component.status.noItems',
    defaultMessage: 'No items'
  }
});

export interface CompareVersionsResource {
  a: ContentInstance;
  b: any;
  contentTypes: LookupTable<ContentType>;
}

interface CompareVersionsProps {
  resource: Resource<CompareVersionsResource>;
}

const systemProps = ['fileName', 'internalName', 'disabled'];

export function CompareVersions(props: CompareVersionsProps) {
  const classes = CompareVersionsStyles({});
  const { a, b, contentTypes } = props.resource.read();
  const values = Object.values(contentTypes[a.craftercms.contentTypeId].fields) as ContentTypeField[];

  return (
    <>
      <section className={classes.compareBoxHeader}>
        <div className={classes.compareBoxHeaderItem}>
          <ListItemText
            primary={<FancyFormattedDate date={a.craftercms.dateModified} />}
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: a.craftercms.versionNumber,
                  span: (msg) => <span className="blackText">{msg}</span>
                }}
              />
            }
          />
        </div>
        <div className={classes.compareBoxHeaderItem}>
          <ListItemText
            primary={<FancyFormattedDate date={b.craftercms.dateModified} />}
            secondary={
              <FormattedMessage
                id="historyDialog.versionNumber"
                defaultMessage="Version: <span>{versionNumber}</span>"
                values={{
                  versionNumber: b.craftercms.versionNumber,
                  span: (msg) => <span className="blackText">{msg}</span>
                }}
              />
            }
          />
        </div>
      </section>
      <section className={classes.compareVersionsContent}>
        <Paper>
          {
            contentTypes &&
            values.filter(value => !systemProps.includes(value.id)).map((field) => (
              <CompareFieldPanel a={a} b={b} field={field} key={field.id} />
            ))
          }
        </Paper>
      </section>
    </>
  );
}

interface CompareFieldPanelProps {
  a: ContentInstance;
  b: ContentInstance;
  field: ContentTypeField;
}

function CompareFieldPanel(props: CompareFieldPanelProps) {
  const classes = CompareVersionsStyles({});
  const { a, b, field } = props;
  const [unChanged, setUnChanged] = useState(false);
  const { formatMessage } = useIntl();
  let contentA = a[field.id];
  let contentB = b[field.id];

  useMount(() => {
    switch (field.type) {
      case 'text':
      case 'html':
      case 'image':
        if (contentA === contentB) {
          setUnChanged(true);
        }
        break;
      case 'node-selector': {
        setUnChanged(false);
        break;
      }
      default:
        if (contentA === contentB) {
          setUnChanged(true);
        }
        break;
    }
  });

  return (
    <ExpansionPanel
      key={field.id} classes={{ root: classes.root }} TransitionProps={{ mountOnEnter: true }}
    >
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          <span className={classes.bold}>{field.id} </span>({field.name})
        </Typography>
        {
          unChanged &&
          <Chip label={formatMessage(translations.unchanged)} className={classes.unchangedChip} />
        }
        {
          field.type === 'node-selector' && !contentA.length && !contentB.length &&
          <Chip label={formatMessage(translations.empty)} className={classes.unchangedChip} />
        }
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {
          (field.type === 'text' || field.type === 'html') && (!unChanged ? (
              <MonacoWrapper
                contentA={contentA}
                contentB={contentB}
              />
            ) : (
              <Typography>
                {contentA}
              </Typography>
            )
          )
        }
        {
          (field.type === 'image') && (!unChanged ? (
              <div className={classes.imagesCompare}>
                <img src={contentA} />
                <img src={contentB} />
              </div>
            ) : (
              <div className={classes.singleImage}>
                <img src={contentA} />
              </div>
            )
          )
        }
        {
          (field.type === 'node-selector') &&
          <ContentInstanceComponents contentA={contentA} contentB={contentB} />
        }
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

interface ContentInstanceComponentsProps {
  contentA: ContentInstance[];
  contentB: ContentInstance[];
}

function ContentInstanceComponents(props: ContentInstanceComponentsProps) {
  const { contentA, contentB } = props;
  const classes = ContentInstanceComponentsStyles({});
  const [mergeContent, setMergeContent] = useState([]);
  const [status, setStatus] = useState<any>({});
  const { formatMessage } = useIntl();

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
      if (!itemA || (itemB.craftercms.id !== itemA.craftercms.id)) {
        itemStatus[index] = 'new';
      }
      merged[index] = itemB;
    });
    setMergeContent(Object.values(merged));
    setStatus(itemStatus);
  }, [contentA, contentB]);

  return (
    <section className={classes.componentsWrapper}>
      {
        mergeContent.length ? (
          mergeContent.map((item, index) =>
            <div
              className={clsx(classes.component, status[index] ?? '')}
              key={item.craftercms.id}
            >
              <Typography> {item.craftercms.label ?? item.craftercms.id}</Typography>
              {
                status[index] && status[index] !== 'new' &&
                <Typography className={classes.status}>
                  {formatMessage(translations[status[index]])}
                </Typography>
              }
            </div>
          )
        ) : (
          <EmptyState title={formatMessage(translations.noItems)} />
        )
      }
    </section>
  );
}

interface MonacoWrapperProps {
  contentA: string;
  contentB: string;
}

function MonacoWrapper(props: MonacoWrapperProps) {
  const classes = CompareVersionsStyles({});
  const { contentA, contentB } = props;
  const ref = useRef();

  useEffect(() => {
    const originalModel = monaco.editor.createModel(contentA, 'text/plain');
    const modifiedModel = monaco.editor.createModel(contentB, 'text/plain');
    const diffEditor = monaco.editor.createDiffEditor(ref.current, {
      scrollbar: {
        alwaysConsumeMouseWheel: false
      }
    });
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    });
  }, [contentA, contentB]);

  return (
    <div ref={ref} className={classes.monacoWrapper} />
  );
}
