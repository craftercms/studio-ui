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
import { CSSProperties } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import emptyImage from '../../assets/desert.svg';
import clsx from 'clsx';
import { MessageDescriptor, useIntl } from 'react-intl';
import { nou } from '../../utils/object';

type EmptyStateClassKey = 'root' | 'title' | 'subtitle' | 'image';

type EmptyStateStyles = Partial<Record<EmptyStateClassKey, CSSProperties>>;

const useStyles = makeStyles((theme) =>
  createStyles<EmptyStateClassKey, EmptyStateStyles>({
    root: (styles) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      margin: theme.spacing(2),
      ...styles.root
    }),
    title: (styles) => ({
      margin: `${theme.spacing(1)} 0`,
      ...styles.title
    }),
    subtitle: (styles) => ({
      textAlign: 'center',
      ...styles.subtitle
    }),
    image: (styles) => ({
      width: 100,
      maxWidth: '80%',
      ...styles.image
    })
  })
);

export type EmptyStateProps = React.PropsWithChildren<{
  image?: string;
  title: ReactNode | MessageDescriptor;
  subtitle?: ReactNode | MessageDescriptor;
  classes?: Partial<Record<EmptyStateClassKey, string>>;
  styles?: EmptyStateStyles;
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
  const classes = useStyles(props.styles);
  const { formatMessage } = useIntl();
  const { image = emptyImage, classes: propClasses, children } = props;
  const title = isValidElement(props.title) ? props.title : formatMessage(props.title as MessageDescriptor);
  const subtitle = isValidElement(props.subtitle) ? props.subtitle : formatMessage(props.subtitle as MessageDescriptor);
  return (
    <div className={clsx(classes.root, propClasses?.root)}>
      {image && <img className={clsx(classes.image, propClasses?.image)} src={image} alt="" />}
      {title && (
        <Typography
          variant="body1"
          component="h3"
          className={clsx(classes.title, propClasses?.title)}
          color="textSecondary"
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant="body2"
          component="p"
          className={clsx(classes.subtitle, propClasses?.subtitle)}
          color="textSecondary"
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
