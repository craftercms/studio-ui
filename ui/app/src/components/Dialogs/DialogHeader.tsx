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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import MuiDialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import CloseIconRounded from '@material-ui/icons/CloseRounded';
import ArrowBack from '@material-ui/icons/ArrowBackIosRounded';
import React, { ElementType, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Action, { ActionIcon } from './DialogHeaderAction';

const dialogTitleStyles = makeStyles((theme) =>
  createStyles({
    root: {
      margin: 0,
      display: 'flex',
      flexWrap: 'wrap',
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      padding: theme.spacing(1),
      background: theme.palette.background.paper,
      ...theme.mixins.toolbar
    },
    titleWrapper: {
      display: 'flex',
      width: '100%',
      alignItems: 'center'
    },
    title: {
      padding: `0 ${theme.spacing(1)}px`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    subtitle: {
      fontSize: '14px',
      lineHeight: '18px'
    },
    subtitleWrapper: {
      padding: `${theme.spacing(1)}px`,
      paddingTop: 0
    },
    leftActions: {
      whiteSpace: 'nowrap'
    },
    rightActions: {
      marginLeft: 'auto',
      whiteSpace: 'nowrap'
    },
    backIcon: {}
  })
);

export interface DialogHeaderAction extends IconButtonProps {
  icon: ActionIcon | ElementType;
  tooltip?: string;
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
  PrimaryTypographyComponent extends ElementType = 'h2',
  SecondaryTypographyComponent extends ElementType = 'p'
> = PropsWithChildren<{
  id?: string;
  title: ReactNode;
  titleTypographyProps?: TypographyProps<PrimaryTypographyComponent, { component?: PrimaryTypographyComponent }>;
  subtitleTypographyProps?: TypographyProps<SecondaryTypographyComponent, { component?: SecondaryTypographyComponent }>;
  subtitle?: ReactNode;
  leftActions?: DialogHeaderAction[];
  rightActions?: DialogHeaderAction[];
  closeIcon?: ElementType;
  backIcon?: ElementType;
  classes?: {
    root?: string;
    titleWrapper?: string;
    subtitleWrapper?: string;
  };
  className?: string;
  onDismiss?(): void;
  onBack?(): void;
}>;

export default function DialogHeader(props: DialogTitleProps) {
  // region
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
    },
    className
  } = props;
  // endregion
  return (
    <MuiDialogTitle
      id={id}
      disableTypography
      className={className}
      classes={{ root: clsx(classes.root, props.classes?.root) }}
    >
      <section className={clsx(classes.titleWrapper, props.classes?.titleWrapper)}>
        {(leftActions || onBack) && (
          <div className={classes.leftActions}>
            {onBack && (
              <Tooltip title={formatMessage(translations.back)}>
                <IconButton aria-label="close" onClick={onBack} className={classes.backIcon}>
                  <BackIcon />
                </IconButton>
              </Tooltip>
            )}
            {leftActions?.map(({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderAction, i: number) => (
              <Action key={i} icon={icon} tooltip={tooltip} {...rest} />
            ))}
          </div>
        )}
        <Typography className={classes.title} {...titleTypographyProps}>
          {title}
        </Typography>
        {(rightActions || onDismiss) && (
          <div className={classes.rightActions}>
            {rightActions?.map(({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderAction, i: number) => (
              <Action key={i} icon={icon} tooltip={tooltip} {...rest} />
            ))}
            {onDismiss && (
              <Tooltip title={formatMessage(translations.dismiss)}>
                <IconButton aria-label="close" onClick={onDismiss}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </section>
      {(subtitle || children) && (
        <section className={clsx(classes.subtitleWrapper, props.classes?.subtitleWrapper)}>
          {subtitle && (
            <Typography className={classes.subtitle} {...subtitleTypographyProps}>
              {subtitle}
            </Typography>
          )}
          {children}
        </section>
      )}
    </MuiDialogTitle>
  );
}
