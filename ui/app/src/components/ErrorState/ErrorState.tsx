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
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Fab from '@mui/material/Fab';
import crack from '../../assets/full-crack.svg';
import clsx from 'clsx';
import { nnou } from '../../utils/object';

type ErrorStateClassKey = 'root' | 'image' | 'title' | 'message' | 'button';

type ErrorStateStyles = Partial<Record<ErrorStateClassKey, CSSProperties>>;

export type ErrorStateProps = React.PropsWithChildren<{
  title?: string;
  message?: string;
  imageUrl?: string;
  buttonIcon?: ReactNode;
  buttonText?: string;
  onButtonClick?(event: React.MouseEvent): any;
  classes?: Partial<Record<ErrorStateClassKey, string>>;
  styles?: ErrorStateStyles;
}>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles<ErrorStateClassKey, ErrorStateStyles>({
    root: (styles) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(1),
      paddingBottom: '0',
      ...styles.root
    }),
    image: (styles) => ({
      maxWidth: '100%',
      marginBottom: theme.spacing(1),
      ...styles.image
    }),
    title: (styles) => ({
      marginBottom: theme.spacing(1),
      ...styles.title
    }),
    message: (styles) => ({
      textAlign: 'center',
      marginBottom: theme.spacing(1),
      wordBreak: 'break-all',
      ...styles.message
    }),
    button: (styles) => ({
      color: theme.palette.text.secondary,
      background: theme.palette.background.default,
      marginBottom: theme.spacing(1),
      ...styles.button
    })
  })
);

export function ErrorState(props: ErrorStateProps) {
  const classes = useStyles(props.styles);
  const {
    title,
    message,
    buttonText = 'Back',
    buttonIcon = <ArrowBackIcon />,
    onButtonClick,
    imageUrl = crack,
    children
  } = props;
  return (
    <section className={clsx(classes.root, props.classes?.root)}>
      <img className={clsx(classes.image, props.classes?.image)} src={imageUrl} alt="" />
      {nnou(title) && (
        <Typography
          variant="body1"
          component="h3"
          className={clsx(classes.title, props.classes?.title)}
          children={title}
        />
      )}
      {nnou(message) && (
        <Typography
          variant="body2"
          component="p"
          className={clsx(classes.message, props.classes?.message)}
          children={message}
        />
      )}
      {children}
      {onButtonClick && (
        <Fab
          onClick={onButtonClick}
          aria-label={buttonText}
          className={clsx(classes.button, props.classes?.button)}
          children={buttonIcon}
        />
      )}
    </section>
  );
}

export default ErrorState;
