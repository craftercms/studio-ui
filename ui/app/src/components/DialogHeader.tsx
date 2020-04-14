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

import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from '@material-ui/core';
import { palette } from '../styles/theme';
import MuiDialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import ArrowBack from '@material-ui/icons/ArrowBackIosRounded';
import React, { PropsWithChildren } from 'react';
import createStyles from '@material-ui/styles/createStyles/createStyles';

const dialogTitleStyles = makeStyles((theme: Theme) => createStyles({
  titleRoot: {
    margin: 0,
    padding: '13px 20px 11px',
    background: palette.white,
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  title: {
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '14px',
    lineHeight: '18px',
    paddingRight: '35px'
  },
  closeIcon: {
    marginLeft: 'auto'
  },
  backIcon: {}
}));

export type DialogTitleProps = PropsWithChildren<{
  id?: string;
  title: string | JSX.Element;
  titleTypographyProps?: {
    variant?: any;
    component?: string;
    classes?: any;
  };
  subtitleTypographyProps?: {
    variant?: any;
    component?: string;
    classes?: any;
  };
  subtitle?: string;
  closeIcon?: any;
  backIcon?: any;

  onClose?(): void;
  onBack?(): void;
}>;

export default function DialogHeader(props: DialogTitleProps) {
  const classes = dialogTitleStyles({});
  const {
    id,
    onClose,
    onBack,
    title,
    children,
    subtitle,
    closeIcon: CloseIcon = CloseIconRounded,
    backIcon: BackIcon = ArrowBack,
    titleTypographyProps = {
      variant: 'h6',
      component: 'span',
      classes: {}
    },
    subtitleTypographyProps = {
      variant: 'subtitle1',
      component: 'span',
      classes: {}
    }
  } = props;
  return (
    <MuiDialogTitle id={id} disableTypography className={classes.titleRoot}>
      <div className={classes.title}>
        {onBack ? (
          <IconButton aria-label="close" onClick={onBack} className={classes.backIcon}>
            <BackIcon />
          </IconButton>
        ) : null}
        <Typography
          variant={titleTypographyProps.variant}
          // @ts-ignore
          component={titleTypographyProps.component}
          classes={titleTypographyProps.classes}
        >
          {title}
        </Typography>
        {onClose && (
          <IconButton aria-label="close" onClick={onClose} className={classes.closeIcon}>
            <CloseIcon />
          </IconButton>
        )}
      </div>
      {(subtitle || children) && (
        <Typography
          variant={subtitleTypographyProps.variant}
          // @ts-ignore
          component={subtitleTypographyProps.component}
          classes={subtitleTypographyProps.classes}
          className={classes.subtitle}
        >
          {subtitle}
          {children}
        </Typography>
      )}
    </MuiDialogTitle>
  );
}
