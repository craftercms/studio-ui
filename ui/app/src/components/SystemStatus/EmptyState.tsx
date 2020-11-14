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
import { CSSProperties } from '@material-ui/styles';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import emptyImage from '../../assets/desert.svg';
import clsx from 'clsx';

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
      margin: `${theme.spacing(1)}px 0`,
      ...styles.title
    }),
    subtitle: (styles) => ({
      textAlign: 'center',
      ...styles.subtitle
    }),
    image: (styles) => ({
      width: 150,
      maxWidth: '80%',
      ...styles.image
    })
  })
);

export type EmptyStateProps = React.PropsWithChildren<{
  image?: string;
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  classes?: Partial<Record<EmptyStateClassKey, string>>;
  styles?: EmptyStateStyles;
}>;

export default function EmptyState(props: EmptyStateProps) {
  const classes = useStyles(props.styles);
  const { image = emptyImage, title, subtitle, classes: propClasses, children } = props;
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
