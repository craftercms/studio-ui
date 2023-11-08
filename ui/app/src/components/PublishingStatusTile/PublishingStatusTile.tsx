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

import { useIntl } from 'react-intl';
import { makeStyles } from 'tss-react/mui';
import { CSSObject as CSSProperties } from 'tss-react';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { ElementType } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { PublishingStatus } from '../../models/Publishing';
import PublishingStatusAvatar from '../PublishingStatusAvatar/PublishingStatusAvatar';
import { getPublishingStatusText } from '../PublishingStatusDisplay';

type PublishingStatusTileClassKey = 'root' | 'avatar' | 'text';

type PublishingStatusTileStyles = Partial<Record<PublishingStatusTileClassKey, CSSProperties>>;

export interface PublishingStatusTileProps
  extends React.HTMLAttributes<HTMLDivElement | HTMLButtonElement>,
    Pick<PublishingStatus, 'status' | 'enabled'> {
  isFetching?: boolean;
  styles?: PublishingStatusTileStyles;
  classes?: Partial<Record<PublishingStatusTileClassKey, string>>;
}

const usePublishingStatusTileStyles = makeStyles<PublishingStatusTileStyles, PublishingStatusTileClassKey>()(
  (theme, { root, avatar, text } = {} as PublishingStatusTileStyles) => ({
    root: {
      width: '120px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: 'center',
      border: 'none',
      borderRadius: theme.shape.borderRadius,
      borderTop: 'none',
      background: theme.palette.background.paper,
      margin: 5,
      'button&': {
        cursor: 'pointer',
        '&:hover, &:focus': {
          background: theme.palette.action.hover,
          boxShadow: theme.shadows[2]
        }
      },
      ...root
    },
    avatar: {
      margin: 5,
      ...avatar
    },
    text: {
      width: '100%',
      ...text
    }
  })
);

const PublishingStatusTile = React.forwardRef<HTMLDivElement | HTMLButtonElement, PublishingStatusTileProps>(
  function (props, ref) {
    const { classes, cx } = usePublishingStatusTileStyles(props.styles);
    const { formatMessage } = useIntl();
    const { enabled, status, onClick, isFetching, classes: propClasses, ...rest } = props;
    const Component = onClick ? ('button' as ElementType) : ('div' as ElementType);
    const statusText = getPublishingStatusText(props, formatMessage);
    return (
      <Component
        ref={ref}
        {...rest}
        onClick={onClick}
        className={cx(classes.root, propClasses?.root, !isFetching && status)}
      >
        <PublishingStatusAvatar
          enabled={enabled}
          status={isFetching ? null : status}
          className={cx(classes.avatar, propClasses?.avatar)}
        />
        <Typography className={cx(classes.text, propClasses?.text)} noWrap title={statusText} color="textPrimary">
          {isFetching ? <Skeleton /> : statusText}
        </Typography>
      </Component>
    );
  }
);

export default PublishingStatusTile;
