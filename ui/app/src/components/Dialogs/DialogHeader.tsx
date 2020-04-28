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

import { makeStyles } from '@material-ui/core/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { palette } from '../../styles/theme';
import MuiDialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import ArrowBack from '@material-ui/icons/ArrowBackIosRounded';
import React, { PropsWithChildren, ReactNode } from 'react';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import clsx from 'clsx';
import { Tooltip } from '@material-ui/core';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Action, { ActionIcon } from './DialogHeaderAction';

const dialogTitleStyles = makeStyles(() =>
  createStyles({
    titleRoot: {
      margin: 0,
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      padding: '10px',
      background: palette.white
    },
    title: {
      display: 'flex',
      alignItems: 'center'
    },
    typography: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    subtitle: {
      fontSize: '14px',
      lineHeight: '18px',
      paddingRight: '35px'
    },
    leftActions: {
      marginRight: '5px',
      whiteSpace: 'nowrap'
    },
    rightActions: {
      paddingLeft: '5px',
      marginLeft: 'auto',
      whiteSpace: 'nowrap'
    },
    backIcon: {}
  })
);

export interface DialogHeaderAction extends IconButtonProps {
  icon: ActionIcon | React.ElementType;
}

export interface DialogHeaderStateAction {
  icon: ActionIcon;
  'aria-label': string;
  onClick: StandardAction;
  [prop: string]: any;
}

const translations = defineMessages({
  back: {
    id: 'words.back',
    defaultMessage: 'Back'
  },
  dismiss: {
    id: 'words.dismiss',
    defaultMessage: 'Dismiss'
  }
});

export type DialogTitleProps<
  PrimaryTypographyComponent extends React.ElementType = 'h2',
  SecondaryTypographyComponent extends React.ElementType = 'p'
> = PropsWithChildren<{
  id?: string;
  title: ReactNode;
  titleTypographyProps?: TypographyProps<
    PrimaryTypographyComponent,
    { component?: PrimaryTypographyComponent }
  >;
  subtitleTypographyProps?: TypographyProps<
    SecondaryTypographyComponent,
    { component?: SecondaryTypographyComponent }
  >;
  subtitle?: ReactNode;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  closeIcon?: React.ElementType;
  backIcon?: React.ElementType;
  classes?: {
    root?: string;
  };
  onDismiss?(): void;
  onBack?(): void;
}>;

export default function DialogHeader(props: DialogTitleProps) {
  const classes = dialogTitleStyles({});
  const { formatMessage } = useIntl();
  const {
    id,
    onDismiss,
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
      component: 'h2'
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
        {(leftActions || onBack) && (
          <div className={classes.leftActions}>
            {onBack && (
              <Tooltip title={formatMessage(translations.back)}>
                <IconButton aria-label="close" onClick={onBack} className={classes.backIcon}>
                  <BackIcon />
                </IconButton>
              </Tooltip>
            )}
            {leftActions?.map(
              ({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderAction, i: number) => (
                <Action key={i} icon={icon} tooltip={tooltip} {...rest} />
              )
            )}
          </div>
        )}
        <Typography className={classes.typography} {...titleTypographyProps}>
          {title}
        </Typography>
        {(rightActions || onDismiss) && (
          <div className={classes.rightActions}>
            {rightActions?.map(
              ({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderAction, i: number) => (
                <Action key={i} icon={icon} tooltip={tooltip} {...rest} />
              )
            )}
            {onDismiss && (
              <Tooltip title={formatMessage(translations.dismiss)}>
                <IconButton aria-label="close" onClick={onDismiss}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </div>
      {subtitle && (
        <Typography className={classes.subtitle} {...subtitleTypographyProps}>
          {subtitle}
        </Typography>
      )}
      {children}
    </MuiDialogTitle>
  );
}
