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

import Typography, { TypographyProps } from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from 'tss-react/mui';
import CloseIconRounded from '@mui/icons-material/CloseRounded';
import MinimizeIconRounded from '@mui/icons-material/RemoveRounded';
import ArrowBack from '@mui/icons-material/ArrowBackIosRounded';
import React, { ElementType, PropsWithChildren, ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { defineMessages, useIntl } from 'react-intl';
import StandardAction from '../../models/StandardAction';
import Action, { DialogHeaderActionProps } from '../DialogHeaderAction/DialogHeaderAction';
import OpenInFullIcon from '@mui/icons-material/OpenInFullRounded';
import { SystemIconDescriptor } from '../SystemIcon';
import { CSSObject } from 'tss-react';
import Box from '@mui/material/Box';
import { PartialSxRecord } from '../../models';

const dialogTitleStyles = makeStyles()((theme) => ({
  root: {
    margin: 0,
    display: 'flex',
    flex: '0 0 auto',
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1),
    background: theme.palette.background.paper,
    ...(theme.mixins.toolbar as CSSObject)
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
}));

export interface DialogHeaderStateAction {
  icon: SystemIconDescriptor;
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
    id: 'words.close',
    defaultMessage: 'Close'
  },
  minimize: {
    id: 'words.minimize',
    defaultMessage: 'Minimize'
  },
  fullScreen: {
    id: 'dialogHeader.toggleFullScreen',
    defaultMessage: 'Toggle full screen'
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
  leftActions?: DialogHeaderActionProps[];
  rightActions?: DialogHeaderActionProps[];
  closeIcon?: ElementType;
  minimizeIcon?: ElementType;
  fullScreenIcon?: ElementType;
  backIcon?: ElementType;
  classes?: Partial<Record<'root' | 'titleWrapper' | 'subtitleWrapper', string>>;
  className?: string;
  sxs?: PartialSxRecord<
    'root' | 'titleWrapper' | 'title' | 'subtitle' | 'subtitleWrapper' | 'leftActions' | 'rightActions' | 'backIcon'
  >;
  disabled?: boolean;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, reason: string): void;
  onMinimizeButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onFullScreenButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onBack?(): void;
}>;

export function DialogHeader(props: DialogHeaderProps) {
  // region
  const { classes, cx } = dialogTitleStyles();
  const { formatMessage } = useIntl();
  const {
    id,
    onCloseButtonClick,
    onMinimizeButtonClick,
    onFullScreenButtonClick,
    disabled = false,
    onBack,
    title,
    children,
    subtitle,
    leftActions,
    rightActions,
    closeIcon: CloseIcon = CloseIconRounded,
    minimizeIcon: MinimizeIcon = MinimizeIconRounded,
    fullScreenIcon: FullScreenIcon = OpenInFullIcon,
    backIcon: BackIcon = ArrowBack,
    titleTypographyProps = {
      variant: 'h6',
      component: 'h2'
    },
    subtitleTypographyProps = {
      variant: 'subtitle1',
      component: 'p'
    },
    className,
    sxs
  } = props;
  // endregion
  return (
    <Box id={id} className={cx(className, classes.root, props.classes?.root)} sx={sxs?.root}>
      <Box component="section" className={cx(classes.titleWrapper, props.classes?.titleWrapper)} sx={sxs?.titleWrapper}>
        {(leftActions || onBack) && (
          <Box className={classes.leftActions} sx={sxs?.leftActions}>
            {onBack && (
              <Tooltip title={disabled ? '' : formatMessage(translations.back)}>
                <IconButton
                  aria-label="close"
                  onClick={onBack}
                  className={classes.backIcon}
                  sx={sxs?.backIcon}
                  size="large"
                  disabled={disabled}
                >
                  <BackIcon />
                </IconButton>
              </Tooltip>
            )}
            {leftActions?.map(({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderActionProps, i: number) => (
              <Action key={i} icon={icon} tooltip={tooltip} disabled={disabled} {...rest} />
            ))}
          </Box>
        )}
        <Typography className={classes.title} {...titleTypographyProps} sx={sxs?.title}>
          {title}
        </Typography>
        {(rightActions || onCloseButtonClick || onMinimizeButtonClick || onFullScreenButtonClick) && (
          <Box className={classes.rightActions} sx={sxs?.rightActions}>
            {rightActions?.map(({ icon, 'aria-label': tooltip, ...rest }: DialogHeaderActionProps, i: number) => (
              <Action key={i} icon={icon} tooltip={tooltip} disabled={disabled} {...rest} />
            ))}
            {onMinimizeButtonClick && (
              <Tooltip title={disabled ? '' : formatMessage(translations.minimize)}>
                <IconButton aria-label="close" onClick={onMinimizeButtonClick} disabled={disabled}>
                  <MinimizeIcon />
                </IconButton>
              </Tooltip>
            )}
            {onFullScreenButtonClick && (
              <Tooltip title={disabled ? '' : formatMessage(translations.fullScreen)}>
                <IconButton aria-label="close" onClick={onFullScreenButtonClick} disabled={disabled}>
                  <FullScreenIcon />
                </IconButton>
              </Tooltip>
            )}
            {onCloseButtonClick && (
              <Tooltip title={disabled ? '' : formatMessage(translations.dismiss)}>
                <IconButton
                  aria-label="close"
                  onClick={(event) => onCloseButtonClick(event, 'closeButton')}
                  disabled={disabled}
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      {(subtitle || children) && (
        <Box
          component="section"
          className={cx(classes.subtitleWrapper, props.classes?.subtitleWrapper)}
          sx={sxs?.subtitleWrapper}
        >
          {subtitle && (
            <Typography className={classes.subtitle} {...subtitleTypographyProps} sx={sxs?.subtitle}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
      )}
    </Box>
  );
}

export default DialogHeader;
