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

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { ViewVersionDialogProps } from './utils';
import ViewVersionDialogContainer from './ViewVersionDialogContainer';
import EnhancedDialog from '../EnhancedDialog/EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import Slide from '@mui/material/Slide';

/*const versionViewStyles = makeStyles(() => ({
  viewVersionBox: {
    margin: '0 10px 10px 10px',
    '& .blackText': {
      color: palette.black
    }
  },
  viewVersionContent: {
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
  singleItemSelector: {
    marginBottom: '10px'
  }
})); */

export const getLegacyDialogStyles = makeStyles()(() => ({
  iframe: {
    border: 'none',
    height: '80vh'
  }
}));

/*function VersionView(props: VersionViewProps) {
  const { version, contentTypes } = props.resource.read();
  const classes = versionViewStyles({});
  const values = Object.values(contentTypes[version.contentTypeId].fields) as ContentTypeField[];
  return (
    <>
      <section className={classes.viewVersionBox}>
        <ListItemText
          primary={<AsDayMonthDateTime date={version.lastModifiedDate} />}
          secondary={
            <FormattedMessage
              id="historyDialog.versionNumber"
              defaultMessage="Version: <span>{versionNumber}</span>"
              values={{
                versionNumber: version.versionNumber,
                span: (msg) => <span className="blackText">{msg}</span>
              }}
            />
          }
        />
      </section>
      <section className={classes.viewVersionContent}>
        {contentTypes &&
          values.map((field) => (
            <Accordion key={field.id} classes={{ root: classes.root }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <span className={classes.bold}>{field.name}</span> ({field.id})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {field.type === 'html' ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: unescapeHTML(version.content[version.id][field.id])
                      }}
                    />
                  ) : typeof version.content[version.id][field.id] === 'object' ? (
                    JSON.stringify(version.content[version.id][field.id])
                  ) : (
                    version.content[version.id][field.id]
                  )}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
      </section>
    </>
  );
} */

export function ViewVersionDialog(props: ViewVersionDialogProps) {
  const { rightActions, leftActions, contentTypesBranch, error, isFetching, version, ...rest } = props;

  return (
    <EnhancedDialog
      title={<FormattedMessage id="viewVersionDialog.headerTitle" defaultMessage="Viewing item version" />}
      dialogHeaderProps={{
        leftActions,
        rightActions
      }}
      TransitionComponent={Slide}
      {...rest}
    >
      <ViewVersionDialogContainer
        version={version}
        contentTypesBranch={contentTypesBranch}
        error={error}
        isFetching={isFetching}
      />
    </EnhancedDialog>
  );
}

export default ViewVersionDialog;
