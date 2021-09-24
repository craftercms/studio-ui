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
import PublishingQueue, { PublishingQueueProps } from '../../modules/System/Publishing/Queue/PublishingQueue';
import Paper from '@mui/material/Paper';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import DialogHeader from '../DialogHeader';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) =>
  createStyles({
    paperContent: {
      backgroundColor: theme.palette.background.default,
      padding: '16px'
    }
  })
);

export default function PublishingQueueWidget(props: PublishingQueueProps) {
  const { siteId } = props;
  const classes = useStyles();

  return (
    <Paper elevation={2}>
      <DialogHeader title={<FormattedMessage id="publishingQueue.title" defaultMessage="Publishing Queue" />} />
      <div className={classes.paperContent}>
        <PublishingQueue siteId={siteId} />
      </div>
    </Paper>
  );
}
