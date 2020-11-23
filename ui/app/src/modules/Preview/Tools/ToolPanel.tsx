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

import { MessageDescriptor, useIntl } from 'react-intl';
import React, { ElementType, FunctionComponent, PropsWithChildren, ReactElement } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ChevronLeftRounded from '@material-ui/icons/ChevronLeftRounded';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { popToolsPanelPage } from '../../../state/actions/preview';
import { useDispatch } from 'react-redux';
import Close from '@material-ui/icons/Close';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';

type ToolPanelProps = PropsWithChildren<{
  title: string | MessageDescriptor;
  BackIcon?: ElementType;
  onBack?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
  classes?: {
    body?: any;
  };
}>;

interface PanelHeaderProps {
  title: string;
  BackIcon?: ElementType;
  CloseIcon?: ElementType;
  MinimizeIcon?: ElementType;
  onBack: () => void;
  onClose: () => void;
  onMinimize: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    panelHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start'
    },
    alignRight: {
      marginLeft: 'auto'
    }
  })
);

export const PanelHeader: FunctionComponent<PanelHeaderProps> = (props) => {
  const classes = useStyles();
  const {
    title,
    BackIcon = ChevronLeftRounded,
    CloseIcon = Close,
    MinimizeIcon = RemoveRoundedIcon,
    onBack,
    onClose,
    onMinimize
  } = props;
  return (
    <>
      <header className={classes.panelHeader}>
        <IconButton onClick={onBack}>
          <BackIcon />
        </IconButton>
        <Typography component="h2" noWrap>
          {title}
        </Typography>
        {onMinimize && (
          <IconButton onClick={onMinimize} className={classes.alignRight}>
            <MinimizeIcon />
          </IconButton>
        )}
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </header>
      <Divider />
    </>
  );
};

export function ToolPanel(props: ToolPanelProps): ReactElement | null {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { title, BackIcon, onBack = () => dispatch(popToolsPanelPage()), onMinimize, onClose, classes } = props;

  return (
    <>
      <PanelHeader
        title={typeof title === 'object' ? formatMessage(title) : title}
        BackIcon={BackIcon}
        onBack={onBack}
        onClose={onClose}
        onMinimize={onMinimize}
      />
      <section className={classes?.body}>{props.children}</section>
    </>
  );
}

export default ToolPanel;
