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
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import emptyImage from '../../assets/desert.svg';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'flexDirection': 'column',
    'margin': `${theme.spacing(2)}px auto`,
    '& .title': {
      marginTop: '20px',
      marginBottom: '10px'
    },
    '& .paragraph': {
      marginTop: '10px'
    }
  },
  graphic: {
    width: 150
  },
  subtitle: {
    textAlign: 'center'
  }
}));

export interface EmptyStateProps {
  image?: string;
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  classes?: {
    root?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    link?: string;
  };
}

export default function EmptyState(props: EmptyStateProps) {
  const classes = useStyles({});
  const { image, title, subtitle, classes: propClasses } = props;

  return (
    <div className={clsx(classes.root, propClasses?.root)}>
      <img
        className={clsx(classes.graphic, propClasses?.image)} src={image ? image : emptyImage} alt=""
      />
      {title && (
        <Typography
          variant="h6"
          component="h3"
          className={propClasses?.title}
          color="textSecondary"
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant="subtitle1"
          component="p"
          className={clsx(classes.subtitle, propClasses?.subtitle)}
          color="textSecondary"
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
}
