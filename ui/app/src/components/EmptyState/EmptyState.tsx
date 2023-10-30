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

import React, { ReactNode } from 'react';
import { CSSObject as CSSProperties } from 'tss-react';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import emptyImage from '../../assets/desert.svg';
import { MessageDescriptor, useIntl } from 'react-intl';
import { nou } from '../../utils/object';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';

type EmptyStateClassKey = 'root' | 'title' | 'subtitle' | 'image';

type EmptyStateStyles = Partial<Record<EmptyStateClassKey, CSSProperties>>;

const useStyles = makeStyles<EmptyStateStyles, EmptyStateClassKey>()(
  (theme, { root, title, subtitle, image } = {} as EmptyStateStyles) => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      margin: theme.spacing(2),
      ...root
    },
    title: {
      margin: `${theme.spacing(1)} 0`,
      ...title
    },
    subtitle: {
      textAlign: 'center',
      ...subtitle
    },
    image: {
      width: 100,
      maxWidth: '80%',
      ...image
    }
  })
);

export type EmptyStateProps = React.PropsWithChildren<{
  image?: string;
  title: ReactNode | MessageDescriptor;
  subtitle?: ReactNode | MessageDescriptor;
  classes?: Partial<Record<EmptyStateClassKey, string>>;
  styles?: EmptyStateStyles;
  sxs?: Partial<Record<EmptyStateClassKey, SxProps<Theme>>>;
}>;

function isValidElement(target: any): boolean {
  return React.isValidElement(target) || nou(target) || ['string', 'number'].includes(typeof target);
}

export function getEmptyStateStyleSet(setName: 'horizontal' | 'image-sm'): EmptyStateStyles {
  switch (setName) {
    case 'horizontal': {
      return {
        root: {
          flexDirection: 'row'
        }
      };
    }
    case 'image-sm': {
      return {
        image: {
          marginRight: 10,
          width: 50
        }
      };
    }
    default: {
      return {};
    }
  }
}

export function EmptyState(props: EmptyStateProps) {
  const { sxs } = props;
  const { classes, cx } = useStyles(props.styles);
  const { formatMessage } = useIntl();
  const { image = emptyImage, classes: propClasses, children } = props;
  const title = isValidElement(props.title) ? (props.title as string) : formatMessage(props.title as MessageDescriptor);
  const subtitle = isValidElement(props.subtitle)
    ? (props.subtitle as string)
    : formatMessage(props.subtitle as MessageDescriptor);
  return (
    <Box className={cx(classes.root, propClasses?.root)} sx={sxs?.root}>
      {image && (
        <Box component="img" className={cx(classes.image, propClasses?.image)} src={image} alt="" sx={sxs?.image} />
      )}
      {title && (
        <Typography
          variant="body1"
          component="h3"
          className={cx(classes.title, propClasses?.title)}
          color="textSecondary"
          sx={sxs?.title}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant="body2"
          component="p"
          className={cx(classes.subtitle, propClasses?.subtitle)}
          color="textSecondary"
          sx={sxs?.subtitle}
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  );
}

export default EmptyState;
