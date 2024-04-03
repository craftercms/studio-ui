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

import Avatar from '@mui/material/Avatar';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import * as React from 'react';
import { CSSProperties } from 'react';
import { PublishingStatus, PublishingStatusCodes } from '../../models/Publishing';
import { makeStyles } from 'tss-react/mui';
import { getPublishingStatusCodeColor } from './util';

type PublishingStatusAvatarClassKey = 'root' | 'icon';

type PublishingStatusAvatarStyles = Partial<Record<PublishingStatusAvatarClassKey, CSSProperties>>;

export interface PublishingStatusAvatarProps extends Pick<PublishingStatus, 'enabled' | 'status'> {
  className?: string;
  classes?: Partial<Record<PublishingStatusAvatarClassKey, string>>;
  styles?: PublishingStatusAvatarStyles;
  variant?: 'background' | 'icon';
}

const useStyles = makeStyles<{ styles: PublishingStatusAvatarStyles; stylingTarget: 'backgroundColor' | 'color' }>()((
  theme,
  { styles, stylingTarget } = {} as any
) => {
  return {
    root: {
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
      '&.readyWithErrors': {
        [stylingTarget]: getPublishingStatusCodeColor('readyWithErrors', theme)
      },
      ...styles?.root
    },
    icon: {
      ...styles?.icon
    }
  };
  // region Compiler hints
  // Var below is for typescript to complain if we ever add/remove codes.
  // eslint-disable-next-line no-unreachable,@typescript-eslint/no-unused-vars
  const control: Record<PublishingStatusCodes, any> = {
    error: undefined,
    processing: undefined,
    publishing: undefined,
    queued: undefined,
    ready: undefined,
    readyWithErrors: undefined,
    stopped: undefined
  };
  // endregion
});

const targets: { [prop in PublishingStatusAvatarProps['variant']]: 'backgroundColor' | 'color' } = {
  background: 'backgroundColor',
  icon: 'color'
};

export const PublishingStatusAvatar = React.forwardRef<HTMLDivElement, PublishingStatusAvatarProps>((props, ref) => {
  const { status, enabled, styles, variant = 'icon' } = props;
  const { classes, cx } = useStyles({ styles, stylingTarget: targets[variant] });
  return (
    <Avatar
      ref={ref}
      variant="circular"
      className={cx(
        classes.root,
        props.className,
        props.classes?.root,
        enabled ? status : enabled === false ? 'error' : null
      )}
    >
      <CloudUploadOutlined className={cx(props.classes?.icon)} />
    </Avatar>
  );
});

export default PublishingStatusAvatar;
