/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import Typography, { TypographyProps } from '@mui/material/Typography';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import MuiDialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import MinimizeIconRounded from '@mui/icons-material/RemoveRounded';
import ArrowBack from '@mui/icons-material/ArrowBackIosRounded';
import React, { ElementType, PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';
import Tooltip from '@mui/material/Tooltip';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Action, { ActionIcon } from '../Dialogs/DialogHeaderAction';

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
      padding: `0 ${theme.spacing(1)}`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    subtitle: {
      fontSize: '14px',
      lineHeight: '18px'
    },
    subtitleWrapper: {
      padding: theme.spacing(1),
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
  },
  minimize: {
    id: 'words.minimize',
    defaultMessage: 'Minimize'
  }
});

export type DialogHeaderProps<
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
  minimizeIcon?: ElementType;
  backIcon?: ElementType;
  classes?: {
    root?: string;
    titleWrapper?: string;
    subtitleWrapper?: string;
  };
  className?: string;
  disableDismiss?: boolean;
  disableMinimize?: boolean;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onMinimizeButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onBack?(): void;
}>;

export function DialogHeader(props: DialogHeaderProps) {
  // region
  const classes = dialogTitleStyles({});
  const { formatMessage } = useIntl();
  const {
    id,
    onCloseButtonClick,
    onMinimizeButtonClick,
    disableDismiss = false,
    disableMinimize = false,
    onBack,
    title,
    children,
    subtitle,
    leftActions,
    rightActions,
    closeIcon: CloseIcon = CloseIconRounded,
    minimizeIcon: MinimizeIcon = MinimizeIconRounded,
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
    <MuiDialogTitle id={id} className={className} classes={{ root: clsx(classes.root, props.classes?.root) }}>
      <section className={clsx(classes.titleWrapper, props.classes?.titleWrapper)}>
        {(leftActions || onBack) && (
          <div className={classes.leftActions}>
            {onBack && (
              <Tooltip title={formatMessage(translations.back)}>
                <IconButton aria-label="close" onClick={onBack} className={classes.backIcon} size="large">
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
        {(rightActions || onCloseButtonClick || onMinimizeButtonClick) && (
          <div className={classes.rightActions}>
            {rightActions?.map(({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderAction, i: number) => (
              <Action key={i} icon={icon} tooltip={tooltip} {...rest} />
            ))}
            {onMinimizeButtonClick && (
              <Tooltip title={formatMessage(translations.minimize)}>
                <IconButton aria-label="close" onClick={onMinimizeButtonClick} disabled={disableMinimize}>
                  <MinimizeIcon />
                </IconButton>
              </Tooltip>
            )}
            {onCloseButtonClick && (
              <Tooltip title={formatMessage(translations.dismiss)}>
                <IconButton aria-label="close" onClick={onCloseButtonClick} disabled={disableDismiss} size="large">
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

export default DialogHeader;
