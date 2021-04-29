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
import { useActiveSiteId, useSelection } from '../../utils/hooks';
import PublishingStatusWidget from '../PublishingStatusWidget';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { start, stop } from '../../services/publishing';
import { fetchPublishingStatus } from '../../state/actions/publishingStatus';
import { useDispatch } from 'react-redux';
import BulkPublishWidget from '../BulkPublishWidget';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: '50px'
    }
  })
);

export default function PublishingDashboard() {
  const state = useSelection((state) => state.dialogs.publishingStatus);
  const classes = useStyles();
  const site = useActiveSiteId();
  const dispatch = useDispatch();

  const onStartStop = () => {
    const action = state.status === 'ready' ? stop : start;

    action(site).subscribe(() => {
      dispatch(fetchPublishingStatus());
    });
  };

  const onRefresh = () => {
    dispatch(fetchPublishingStatus());
  };

  return (
    <section className={classes.root}>
      <PublishingStatusWidget state={state} onStartStop={onStartStop} onRefresh={onRefresh} />

      <BulkPublishWidget />
    </section>
  );
}
