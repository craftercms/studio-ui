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

import React, { PropsWithChildren, useState } from 'react';
import { CommonDashletProps, parseDashletContentHeight } from '../SiteDashboard/utils';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import Box, { BoxProps } from '@mui/material/Box';
import { UNDEFINED } from '../../utils/constants';
import CardActions from '@mui/material/CardActions';
import OpenInFullOutlinedIcon from '@mui/icons-material/OpenInFullOutlined';
import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import IconButton from '@mui/material/IconButton';
import useSiteDashboardContext from '../SiteDashboard/useSiteDashboardContext';

export type DashletCardProps = PropsWithChildren<
  CommonDashletProps & {
    title?: React.ReactNode;
    actionsBar?: React.ReactNode;
    actionsBarHeight?: number;
    footerHeight?: number;
    headerAction?: React.ReactNode;
    footer?: React.ReactNode;
    sxs?: Partial<{
      card: BoxProps['sx'];
      content: BoxProps['sx'];
      header: BoxProps['sx'];
      actionsBar: BoxProps['sx'];
      footer: BoxProps['sx'];
    }>;
    cardContentProps?: CardContentProps;
    maximizable?: boolean;
  }
>;

export function DashletCard(props: DashletCardProps) {
  // region Props
  const {
    sxs,
    children,
    actionsBar,
    title = '',
    borderLeftColor,
    contentHeight: contentHeightProp,
    actionsBarHeight = 35,
    footerHeight = 51,
    headerAction,
    cardContentProps,
    footer,
    maximizable = false
  } = props;
  // endregion
  const cardHeaderHeight = 62;
  const renderCardHeader = Boolean(title) || Boolean(headerAction);
  const [isMaximized, setIsMaximized] = useState(false);
  const dashboardState = useSiteDashboardContext();

  const updateMaximized = () => {
    setIsMaximized(!isMaximized);
    if (isMaximized) {
      dashboardState.onDashletMinimize();
    } else {
      dashboardState.onDashletMaximize();
    }
  };

  const contentHeight = contentHeightProp
    ? // Subtract toolbar and footer height to avoid misalignment with other widgets, also, if CardHeader won't be rendered,
      // increase its size
      parseDashletContentHeight(contentHeightProp) -
      (actionsBar ? actionsBarHeight : 0) -
      (footer ? footerHeight : 0) +
      (!renderCardHeader ? cardHeaderHeight : 0)
    : UNDEFINED;
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 5,
        borderLeftColor,
        ...sxs?.card,
        ...(isMaximized && {
          position: 'absolute',
          zIndex: 5,
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        })
      }}
    >
      {/* region Header */}
      {renderCardHeader && (
        <CardHeader
          title={title}
          titleTypographyProps={{ variant: 'h6', component: 'h2' }}
          action={
            <>
              {maximizable && (
                <IconButton onClick={() => updateMaximized()}>
                  {isMaximized ? <CloseFullscreenOutlinedIcon /> : <OpenInFullOutlinedIcon />}
                </IconButton>
              )}
              {headerAction}
            </>
          }
          sx={sxs?.header}
        />
      )}
      {/* endregion */}
      <Divider />
      {actionsBar && (
        <Box
          sx={{
            display: 'flex',
            position: 'relative',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            pr: 1,
            pl: 1,
            ...sxs?.actionsBar
          }}
        >
          {actionsBar}
        </Box>
      )}
      {/* region Body */}
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          height: parseDashletContentHeight(contentHeight),
          pt: 0,
          ...sxs?.content
        }}
        {...cardContentProps}
      >
        {children}
      </CardContent>
      {/* endregion */}
      {/* region Actions */}
      {footer && (
        <CardActions
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            paddingTop: '4px',
            paddingBottom: '4px',
            ...sxs?.footer
          }}
        >
          {footer}
        </CardActions>
      )}
      {/* endregion */}
    </Card>
  );
}

export default DashletCard;
