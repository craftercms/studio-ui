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
import makeStyles from '@material-ui/styles/makeStyles';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { useStateResource } from '../../../utils/hooks';
import { FancyFormattedDate } from './VersionList';
import { palette } from '../../../styles/theme';
import StandardAction from '../../../models/StandardAction';
import ContentType, { ContentTypeField } from '../../../models/ContentType';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { LookupTable } from '../../../models/LookupTable';
import { ApiResponse } from '../../../models/ApiResponse';
import { EntityState } from '../../../models/EntityState';
import DialogHeader, {
  DialogHeaderAction,
  DialogHeaderStateAction
} from '../../../components/Dialogs/DialogHeader';
import DialogBody from '../../../components/Dialogs/DialogBody';

const useStyles = makeStyles(() => ({
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
  }
}));

interface VersionViewProps {
  resource: any;
}

function VersionView(props: VersionViewProps) {
  const { version, contentTypes } = props.resource.read();
  const classes = useStyles({});
  const values = Object.values(contentTypes[version.contentType].fields) as ContentTypeField[];
  return (
    <>
      <section className={classes.viewVersionBox}>
        <ListItemText
          primary={<FancyFormattedDate date={version.lastModifiedDate} />}
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
        {
          contentTypes &&
          values.map((field) =>
            <ExpansionPanel key={field.id} classes={{ root: classes.root }}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography><span
                  className={classes.bold}
                >{field.id} </span>({field.name})</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                  sit amet blandit leo lobortis eget.
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        }
      </section>
    </>
  );
}

interface ViewVersionDialogBaseProps {
  open: boolean;
  error: ApiResponse;
  isFetching: boolean;
  version: string;
}

interface ViewVersionDialogProps extends ViewVersionDialogBaseProps {
  contentTypesBranch: EntityState<ContentType>;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  onClose(): void;
  onDismiss(): void;
}

export interface ViewVersionDialogStateProps extends ViewVersionDialogBaseProps {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

interface Resource {
  version: string;
  contentTypes: LookupTable<ContentType>;
}

export default function ViewVersionDialog(props: ViewVersionDialogProps) {
  const { open, onClose, onDismiss, rightActions } = props;

  const resource = useStateResource<Resource, ViewVersionDialogProps>(props, {
    shouldResolve: (source) => Boolean(source.version) && (!source.isFetching && !source.contentTypesBranch.isFetching),
    shouldReject: (source) => Boolean(source.error) || Boolean(source.contentTypesBranch.error),
    shouldRenew: (source, resource) => (source.isFetching || source.contentTypesBranch.isFetching) && resource.complete,
    resultSelector: (source) => ({
      version: source.version,
      contentTypes: source.contentTypesBranch.byId
    }),
    errorSelector: (source) => source.error || source.contentTypesBranch.error
  });

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
      onEscapeKeyDown={onDismiss}
    >
      <DialogHeader
        title={
          <FormattedMessage
            id="viewVersionDialog.headerTitle"
            defaultMessage="Viewing {name}"
            values={{ name: 'Home' }}
          />
        }
        rightActions={rightActions}
        onDismiss={onDismiss}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={resource}>
          <VersionView resource={resource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </Dialog>
  );
}
