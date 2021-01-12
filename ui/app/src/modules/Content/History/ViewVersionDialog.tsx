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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { useLogicResource, useSelection, useUnmount } from '../../../utils/hooks';
import StandardAction from '../../../models/StandardAction';
import ContentType from '../../../models/ContentType';
import { LookupTable } from '../../../models/LookupTable';
import { ApiResponse } from '../../../models/ApiResponse';
import { EntityState } from '../../../models/EntityState';
import DialogHeader, { DialogHeaderAction, DialogHeaderStateAction } from '../../../components/Dialogs/DialogHeader';
import DialogBody from '../../../components/Dialogs/DialogBody';
import { Resource } from '../../../models/Resource';
import Dialog from '@material-ui/core/Dialog';

interface VersionViewProps {
  resource: Resource<VersionResource>;
}

interface ViewVersionDialogBaseProps {
  open: boolean;
  error: ApiResponse;
  isFetching: boolean;
  version: any;
}

interface ViewVersionDialogProps extends ViewVersionDialogBaseProps {
  contentTypesBranch: EntityState<ContentType>;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  onClose?(): void;
  onClosed?(): void;
  onDismiss?(): void;
}

interface VersionResource {
  version: any;
  contentTypes: LookupTable<ContentType>;
}

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

const getLegacyDialogStyles = makeStyles(() => ({
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
            <ExpansionPanel key={field.id} classes={{ root: classes.root }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <span className={classes.bold}>{field.name}</span> ({field.id})
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
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
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
      </section>
    </>
  );
} */

export interface ViewVersionDialogStateProps extends ViewVersionDialogBaseProps {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

export default function ViewVersionDialog(props: ViewVersionDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <ViewVersionDialogBody {...props} />
    </Dialog>
  );
}

function ViewVersionDialogBody(props: ViewVersionDialogProps) {
  const { onDismiss, rightActions } = props;
  useUnmount(props.onClosed);
  const resource = useLogicResource<VersionResource, ViewVersionDialogProps>(props, {
    shouldResolve: (source) =>
      source.version && source.contentTypesBranch.byId && !source.isFetching && !source.contentTypesBranch.isFetching,
    shouldReject: (source) => Boolean(source.error) || Boolean(source.contentTypesBranch.error),
    shouldRenew: (source, resource) => (source.isFetching || source.contentTypesBranch.isFetching) && resource.complete,
    resultSelector: (source) => ({
      version: source.version,
      contentTypes: source.contentTypesBranch.byId
    }),
    errorSelector: (source) => source.error || source.contentTypesBranch.error
  });
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="viewVersionDialog.headerTitle" defaultMessage="Viewing item version" />}
        rightActions={rightActions}
        onDismiss={onDismiss}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={resource}>
          <LegacyVersionDialog resource={resource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </>
  );
}

function LegacyVersionDialog(props: VersionViewProps) {
  const { version } = props.resource.read();
  const classes = getLegacyDialogStyles();
  const authoringUrl = useSelection<string>((state) => state.env.authoringBase);
  return (
    <iframe
      title="View version"
      className={classes.iframe}
      src={`${authoringUrl}/diff?site=${version.site}&path=${encodeURIComponent(version.path)}&version=${
        version.versionNumber
      }&versionTO=${version.versionNumber}&mode=iframe&ui=next`}
    />
  );
}
