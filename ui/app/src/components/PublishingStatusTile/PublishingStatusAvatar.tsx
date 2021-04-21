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

import Avatar from '@material-ui/core/Avatar';
import clsx from 'clsx';
import CloudUploadOutlined from '@material-ui/icons/CloudUploadOutlined';
import * as React from 'react';
import { PublishingStatus } from '../../models/Publishing';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { getBackgroundColourByStatusCode } from './PublishingStatusTile';

interface PublishingStatusAvatarProps {
  status: PublishingStatus['status'];
  isFetching?: boolean;
  classes?: Partial<Record<'avatar', string>>;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    avatar: {
      '&.ready': {
        background: getBackgroundColourByStatusCode('ready', theme)
      },
      '&.publishing': {
        background: getBackgroundColourByStatusCode('publishing', theme)
      },
      '&.queued': {
        background: getBackgroundColourByStatusCode('queued', theme)
      },
      '&.stopped': {
        background: getBackgroundColourByStatusCode('stopped', theme)
      },
      '&.error': {
        background: getBackgroundColourByStatusCode('error', theme)
      }
    }
  })
);

export function PublishingStatusAvatar(props: PublishingStatusAvatarProps) {
  const { status, isFetching } = props;
  const classes = useStyles();
  return (
    <Avatar variant="circular" className={clsx(classes.avatar, props.classes?.avatar, !isFetching && status)}>
      <CloudUploadOutlined />
    </Avatar>
  );
}
