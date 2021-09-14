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
import { CSSProperties } from 'react';
import { PublishingStatus } from '../../models/Publishing';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { getPublishingStatusCodeColor } from './util';

type PublishingStatusAvatarClassKey = 'root' | 'icon';

type PublishingStatusAvatarStyles = Partial<Record<PublishingStatusAvatarClassKey, CSSProperties>>;

export interface PublishingStatusAvatarProps {
  status: PublishingStatus['status'];
  className?: string;
  classes?: Partial<Record<PublishingStatusAvatarClassKey, string>>;
  styles?: PublishingStatusAvatarStyles;
  variant?: 'background' | 'icon';
}

const useStyles = makeStyles((theme) =>
  createStyles<
    PublishingStatusAvatarClassKey,
    { styles: PublishingStatusAvatarStyles; stylingTarget: 'backgroundColor' | 'color' }
  >({
    root: ({ styles, stylingTarget }) => ({
      ...(stylingTarget === 'color' && {
        background: 'none',
        color: theme.palette.text.secondary
      }),
      '&.ready': {
        [stylingTarget]: getPublishingStatusCodeColor('ready', theme)
      },
      '&.processing': {
        [stylingTarget]: getPublishingStatusCodeColor('processing', theme)
      },
      '&.publishing': {
        [stylingTarget]: getPublishingStatusCodeColor('publishing', theme)
      },
      '&.queued': {
        [stylingTarget]: getPublishingStatusCodeColor('queued', theme)
      },
      '&.stopped': {
        [stylingTarget]: getPublishingStatusCodeColor('stopped', theme)
      },
      '&.error': {
        [stylingTarget]: getPublishingStatusCodeColor('error', theme)
      },
      ...styles?.root
    }),
    icon: ({ styles, stylingTarget }) => ({
      ...styles?.icon
    })
  })
);

const targets: { [prop in PublishingStatusAvatarProps['variant']]: 'backgroundColor' | 'color' } = {
  background: 'backgroundColor',
  icon: 'color'
};

export const PublishingStatusAvatar = React.forwardRef<HTMLDivElement, PublishingStatusAvatarProps>((props, ref) => {
  const { status, styles, variant = 'background' } = props;
  const classes = useStyles({ styles, stylingTarget: targets[variant] });
  return (
    <Avatar ref={ref} variant="circular" className={clsx(classes.root, props.className, props.classes?.root, status)}>
      <CloudUploadOutlined className={clsx(props.classes?.icon)} />
    </Avatar>
  );
});

export default PublishingStatusAvatar;
