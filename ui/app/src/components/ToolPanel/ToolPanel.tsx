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
import Typography from '@mui/material/Typography';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { popToolsPanelPage } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import TranslationOrText from '../../models/TranslationOrText';
import { ErrorBoundary } from '../ErrorBoundary';
import { PartialSxRecord } from '../../models';
import Box from '@mui/material/Box';

export type ToolPanelClassKey = 'body';

type ToolPanelProps = PropsWithChildren<{
  title: TranslationOrText;
  BackIcon?: ElementType;
  onBack?: () => void;
  classes?: Partial<Record<ToolPanelClassKey, string>>;
  sxs?: PartialSxRecord<ToolPanelClassKey>;
}>;

interface PanelHeaderProps {
  title: string;
  BackIcon?: ElementType;
  onBack: () => void;
}

export const PanelHeader: FunctionComponent<PanelHeaderProps> = (props) => {
  const { title, BackIcon = ChevronLeftRounded, onBack } = props;
  return (
    <>
      <Box
        component="header"
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(0, 1),
          ...theme.mixins.toolbar,
          justifyContent: 'flex-start'
        })}
      >
        <IconButton onClick={onBack} size="large">
          <BackIcon />
        </IconButton>
        <Typography component="h2" noWrap title={title}>
          {title}
        </Typography>
      </Box>
      <Divider />
    </>
  );
};

export function ToolPanel(props: ToolPanelProps): ReactElement | null {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { title, BackIcon, onBack = () => dispatch(popToolsPanelPage()), classes, sxs } = props;
  return (
    <>
      <PanelHeader
        title={typeof title === 'object' ? formatMessage(title) : title}
        BackIcon={BackIcon}
        onBack={onBack}
      />
      <Suspense>
        <ErrorBoundary>
          <Box component="section" className={classes?.body} sx={sxs?.body}>
            {props.children}
          </Box>
        </ErrorBoundary>
      </Suspense>
    </>
  );
}

export default ToolPanel;
