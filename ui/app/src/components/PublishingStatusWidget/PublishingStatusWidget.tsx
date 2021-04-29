/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import { PublishingStatus } from '../../models/Publishing';
import PublishingStatusDisplay from '../PublishingStatusDisplay';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { FormattedMessage } from 'react-intl';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import Button from '@material-ui/core/Button';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import PauseCircleOutlineOutlinedIcon from '@material-ui/icons/PauseCircleOutlineOutlined';

type PublishingStatusWidgetProps = {
  state: PublishingStatus;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    statusBar: {
      borderBottom: 'none'
    },
    statusBarToolbar: {
      minHeight: 'unset'
    },
    statusBarTitle: {
      fontSize: '16px'
    },
    statusContent: {
      backgroundColor: palette.gray.light0
    },
    actionButton: {
      minWidth: '40px',
      color: theme.palette.action.active
    }
  })
);

export default function PublishingStatusWidget(props: PublishingStatusWidgetProps) {
  const { state } = props;
  const { enabled, status, message, lockOwner, lockTTL } = state;
  const classes = useStyles();

  return (
    <Card>
      <CardContent>
        <GlobalAppToolbar
          title={<FormattedMessage id="PublishingStatus.title" defaultMessage="Publishing Status" />}
          classes={{
            appBar: classes.statusBar,
            toolbar: classes.statusBarToolbar,
            title: classes.statusBarTitle
          }}
          rightContent={
            <>
              <Button size="small" classes={{ root: classes.actionButton }}>
                <PauseCircleOutlineOutlinedIcon />
              </Button>
              <Button size="small" classes={{ root: classes.actionButton }}>
                <RefreshRoundedIcon />
              </Button>
            </>
          }
        />
      </CardContent>
      <CardContent className={classes.statusContent}>
        <PublishingStatusDisplay
          enabled={enabled}
          status={status}
          message={message}
          lockOwner={lockOwner}
          lockTTL={lockTTL}
          isFetching={!state}
        />
      </CardContent>
    </Card>
  );
}
