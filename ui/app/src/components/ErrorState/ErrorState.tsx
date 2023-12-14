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
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Fab from '@mui/material/Fab';
import crack from '../../assets/warning.svg';
import { nnou } from '../../utils/object';

type ErrorStateClassKey = 'root' | 'image' | 'title' | 'message' | 'button';

type ErrorStateStyles = Partial<Record<ErrorStateClassKey, CSSProperties>>;

export type ErrorStateProps = React.PropsWithChildren<{
  title?: ReactNode;
  message?: string;
  imageUrl?: string;
  buttonIcon?: ReactNode;
  buttonText?: string;
  onButtonClick?(event: React.MouseEvent): any;
  classes?: Partial<Record<ErrorStateClassKey, string>>;
  styles?: ErrorStateStyles;
}>;

const useStyles = makeStyles<ErrorStateStyles, ErrorStateClassKey>()(
  (theme: Theme, { root, image, title, message, button } = {} as ErrorStateStyles) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(1),
      paddingBottom: '0',
      ...root
    },
    image: {
      maxWidth: '100%',
      marginBottom: theme.spacing(1),
      ...image
    },
    title: {
      marginBottom: theme.spacing(1),
      ...title
    },
    message: {
      textAlign: 'center',
      marginBottom: theme.spacing(1),
      wordBreak: 'break-all',
      ...message
    },
    button: {
      color: theme.palette.text.secondary,
      background: theme.palette.background.default,
      marginBottom: theme.spacing(1),
      ...button
    }
  })
);

export function ErrorState(props: ErrorStateProps) {
  const { classes, cx } = useStyles(props.styles);
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
    <section className={cx(classes.root, props.classes?.root)}>
      <img className={cx(classes.image, props.classes?.image)} src={imageUrl} alt="" />
      {nnou(title) && (
        <Typography
          variant="body1"
          component="h3"
          className={cx(classes.title, props.classes?.title)}
          children={title}
        />
      )}
      {nnou(message) && (
        <Typography
          variant="body2"
          component="p"
          className={cx(classes.message, props.classes?.message)}
          children={message}
        />
      )}
      {children}
      {onButtonClick && (
        <Fab
          onClick={onButtonClick}
          aria-label={buttonText}
          className={cx(classes.button, props.classes?.button)}
          children={buttonIcon}
        />
      )}
    </section>
  );
}

export default ErrorState;
