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
import { FormattedMessage } from 'react-intl';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import React, { useCallback, useRef, useState } from 'react';
import { Resource } from '../../../models/Resource';
import { useMount } from '../../../utils/hooks';
import * as monaco from 'monaco-editor';
import clsx from 'clsx';
import Chip from '@material-ui/core/Chip';

const CompareVersionsStyles = makeStyles(() =>
  createStyles({
    monacoWrapper: {
      width: '100%',
      height: '150px',
      '&.unChanged': {
        height: 'auto'
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
      '&.Mui-expanded': {
        margin: 0,
        borderBottom: `1px solid rgba(0,0,0,0.12)`
      }
    },
    bold: {
      fontWeight: 600
    },
    unchangedChip: {
      marginLeft: 'auto',
      height: '26px',
      backgroundColor: palette.gray.light1
    }
  })
);

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
  const [testeo, setUnChanged] = useState(null);
  const unChanged = useRef([]);

  const onUnChanged = useCallback((fieldId: string) => {
    setUnChanged(fieldId);
    unChanged.current = [...unChanged.current, fieldId];
  }, []);

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
        {
          contentTypes &&
          values.filter(value => !systemProps.includes(value.id)).map((field) => (
            <ExpansionPanel key={field.id} classes={{ root: classes.root }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <span className={classes.bold}>{field.id} </span>({field.name})
                </Typography>
                {
                  unChanged.current.includes(field.id) &&
                  <Chip label="Unchanged" className={classes.unchangedChip} />
                }
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <MonacoWrapper
                  a={a}
                  b={b}
                  field={field}
                  onUnChanged={onUnChanged}
                  unChanged={unChanged.current.includes(field.id)}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))
        }
      </section>
    </>
  );
}

interface MonacoWrapperProps {
  a: ContentInstance;
  b: ContentInstance;
  field: ContentTypeField;
  unChanged: boolean;
  onUnChanged(fieldId: string): void;
}

function MonacoWrapper(props: MonacoWrapperProps) {
  const classes = CompareVersionsStyles({});
  const { a, b, field, onUnChanged, unChanged } = props;
  const ref = useRef();

  useMount(() => {
    let contentA;
    let contentB;

    switch (field.type) {
      case 'text':
      case 'html':
        contentA = a[field.id];
        contentB = b[field.id];
        break;
      default:
        contentA = null;
        contentB = null;
    }

    if (contentA !== contentB) {
      const originalModel = monaco.editor.createModel(contentA, 'text/plain');
      const modifiedModel = monaco.editor.createModel(contentB, 'text/plain');

      const diffEditor = monaco.editor.createDiffEditor(ref.current);

      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel
      });
    } else {
      onUnChanged(field.id);
    }
  });

  return (
    <div ref={ref} className={clsx(classes.monacoWrapper, unChanged && 'unChanged')}>
      {
        unChanged && 'Hasn\'t changed'
      }
    </div>
  );
}

