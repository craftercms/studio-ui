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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import makeStyles from '@material-ui/styles/makeStyles';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from '../../../components/DialogHeader';
import DialogBody from '../../../components/DialogBody';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { useStateResource } from '../../../utils/hooks';
import { FancyFormattedDate } from './VersionList';
import { palette } from '../../../styles/theme';
import HistoryRoundedIcon from '@material-ui/icons/HistoryRounded';
import { useDispatch } from 'react-redux';
import { revealHistoryDialog } from '../../../state/reducers/dialogs/history';
import { closeViewVersionDialog } from '../../../state/reducers/dialogs/viewVersion';

const translations = defineMessages({
  backToHistoryList: {
    id: 'viewVersionDialog.back',
    defaultMessage: 'Back to history list'
  }
});

const useStyles = makeStyles(() => ({
  viewVersionBox: {
    flexBasis: '50%',
    '& .blackText': {
      color: palette.black
    }
  }
}));

interface ViewVersionProps {
  resource: any;
}

function ViewVersion(props: ViewVersionProps) {
  const version = props.resource.read();
  const classes = useStyles({});
  return (
    <div className={classes.viewVersionBox}>
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
    </div>
  );
}

export default function ViewVersionDialog(props: any) {
  const { formatMessage } = useIntl();
  const classes = useStyles({});
  const dispatch = useDispatch();

  const { open, onClose, onDismiss, historyDialog } = props;

  const resource = useStateResource<any, any>(props, {
    shouldResolve: (source) => Boolean(source.version) && !source.isFetching,
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => source.isFetching && resource.complete,
    resultSelector: (source) => source.version,
    errorSelector: (source) => source.error
  });

  const backToHistoryList = () => {
    // TODO: Is this the best approach?
    dispatch(closeViewVersionDialog())
    dispatch(revealHistoryDialog())
  }

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
        rightActions={historyDialog ? [
          {
            icon: HistoryRoundedIcon,
            onClick: backToHistoryList,
            'aria-label': formatMessage(translations.backToHistoryList)
          }
        ] : []}
        onDismiss={onDismiss}
      />
      <DialogBody>
        <SuspenseWithEmptyState resource={resource}>
          <ViewVersion resource={resource} />
        </SuspenseWithEmptyState>
      </DialogBody>
    </Dialog>
  );
}
