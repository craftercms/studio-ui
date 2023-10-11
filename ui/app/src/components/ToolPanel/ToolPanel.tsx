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

import { useIntl } from 'react-intl';
import React, { ElementType, FunctionComponent, PropsWithChildren, ReactElement, Suspense } from 'react';
import { Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { popToolsPanelPage } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import TranslationOrText from '../../models/TranslationOrText';
import { CSSObject } from 'tss-react';
import { ErrorBoundary } from '../ErrorBoundary';

type ToolPanelProps = PropsWithChildren<{
  title: TranslationOrText;
  BackIcon?: ElementType;
  onBack?: () => void;
  classes?: {
    body?: any;
  };
}>;

interface PanelHeaderProps {
  title: string;
  BackIcon?: ElementType;
  onBack: () => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...(theme.mixins.toolbar as CSSObject),
    justifyContent: 'flex-start'
  }
}));

export const PanelHeader: FunctionComponent<PanelHeaderProps> = (props) => {
  const { classes } = useStyles();
  const { title, BackIcon = ChevronLeftRounded, onBack } = props;
  return (
    <>
      <header className={classes.panelHeader}>
        <IconButton onClick={onBack} size="large">
          <BackIcon />
        </IconButton>
        <Typography component="h2" noWrap title={title}>
          {title}
        </Typography>
      </header>
      <Divider />
    </>
  );
};

export function ToolPanel(props: ToolPanelProps): ReactElement | null {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { title, BackIcon, onBack = () => dispatch(popToolsPanelPage()), classes } = props;
  return (
    <>
      <PanelHeader
        title={typeof title === 'object' ? formatMessage(title) : title}
        BackIcon={BackIcon}
        onBack={onBack}
      />
      <Suspense>
        <ErrorBoundary>
          <section className={classes?.body}>{props.children}</section>
        </ErrorBoundary>
      </Suspense>
    </>
  );
}

export default ToolPanel;
