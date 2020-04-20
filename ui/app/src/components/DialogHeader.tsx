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

import { makeStyles, Theme } from '@material-ui/styles';
import TypographyProps from '@material-ui/core/TypographyProps';
import IconButtonProps from '@material-ui/core/IconButtonProps';
import { palette } from '../styles/theme';
import MuiDialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import ArrowBack from '@material-ui/icons/ArrowBackIosRounded';
import React, { PropsWithChildren } from 'react';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import clsx from 'clsx';

const dialogTitleStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

export interface DialogHeaderAction extends IconButtonProps {
  icon: React.ElementType;
}

export type DialogTitleProps<
  PrimaryTypographyComponent extends React.ElementType = 'h2',
  SecondaryTypographyComponent extends React.ElementType = 'p'
> = PropsWithChildren<{
  id?: string;
  title: string | JSX.Element;
  titleTypographyProps?: TypographyProps<
    PrimaryTypographyComponent,
    { component?: PrimaryTypographyComponent }
  >;
  subtitleTypographyProps?: TypographyProps<
    SecondaryTypographyComponent,
    { component?: SecondaryTypographyComponent }
  >;
  subtitle?: string;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  closeIcon?: React.ElementType;
  backIcon?: React.ElementType;
  classes?: {
    root?: string;
  };
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
    leftActions,
    rightActions,
    closeIcon: CloseIcon = CloseIconRounded,
    backIcon: BackIcon = ArrowBack,
    titleTypographyProps = {
      variant: 'h6',
      component: 'h2',
      color: 'textSecondary'
    },
    subtitleTypographyProps = {
      variant: 'subtitle1',
      component: 'p'
    }
  } = props;
  return (
    <MuiDialogTitle
      id={id}
      disableTypography
      classes={{ root: clsx(classes.titleRoot, props.classes?.root) }}
    >
      <div className={classes.title}>
        {onBack && (
          <IconButton aria-label="close" onClick={onBack} className={classes.backIcon}>
            <BackIcon />
          </IconButton>
        )}
        {
          leftActions?.map(({ icon: Icon, ...rest }: DialogHeaderAction) =>
            <IconButton {...rest}>
              <Icon />
            </IconButton>
          )
        }
        <Typography {...titleTypographyProps}>{title}</Typography>
        {
          rightActions?.map(({ icon: Icon, ...rest }: DialogHeaderAction) =>
            <IconButton {...rest}>
              <Icon />
            </IconButton>
          )
        }
        {onClose && (
          <IconButton aria-label="close" onClick={onClose} className={classes.closeIcon}>
            <CloseIcon />
          </IconButton>
        )}
      </div>
      {(subtitle || children) && (
        <>
          <Typography className={classes.subtitle} {...subtitleTypographyProps}>
            {subtitle}
          </Typography>
          {children}
        </>
      )}
    </MuiDialogTitle>
  );
}
