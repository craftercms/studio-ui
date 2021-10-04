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

import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { getZoneMarkerStyle } from '../utils/dom';
import { Box, Paper, Popper, Theme, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { FullSxRecord, PartialClassRecord, PartialSxRecord } from '@craftercms/studio-ui/models/CustomRecord';
import LevelDescriptorIcon from '@craftercms/studio-ui/build_tsc/components/Icons/LevelDescriptor';
import FieldIcon from '@craftercms/studio-ui/build_tsc/components/Icons/ContentTypeField';

export type ZoneMarkerClassKey = 'box' | 'paper' | 'icon';

export type ZoneMarkerFullSx = FullSxRecord<ZoneMarkerClassKey>;

export type ZoneMarkerPartialSx = PartialSxRecord<ZoneMarkerClassKey>;

export interface ZoneMarkerProps {
  rect: DOMRect;
  label: string;
  inherited: boolean;
  showZoneTooltip?: boolean;
  menuItems?: ReactNode;
  // TODO: Receive zoneType and abstract icon display here?
  // zoneType: 'component' | 'page' | 'field';
  sx?: ZoneMarkerPartialSx;
  classes?: PartialClassRecord<ZoneMarkerClassKey>;
}

function getStyles(sx: ZoneMarkerPartialSx): ZoneMarkerFullSx {
  return {
    box: {
      boxSizing: 'border-box',
      outline: (theme) => `2px solid ${theme.palette.success.main}`,
      outlineOffset: '-2px',
      textAlign: 'center',
      position: 'absolute',
      zIndex: 'tooltip',
      pointerEvents: 'none',
      ...sx?.box
    },
    paper: {
      padding: [0.5, 1],
      fontSize: '14px',
      maxWidth: '300px',
      overflow: 'hidden',
      fontWeight: 700,
      pointerEvents: 'none',
      zIndex: 'tooltip',
      display: 'flex',
      alignItems: 'center',
      ...sx?.paper
    },
    icon: {
      marginRight: 1,
      ...sx?.icon
    }
  } as Record<ZoneMarkerClassKey, SxProps<Theme>>;
}

export function ZoneMarker(props: ZoneMarkerProps) {
  const { rect, label, classes, inherited, menuItems, showZoneTooltip = true } = props;
  const [zoneStyle, setZoneStyle] = useState<CSSProperties>();
  const sx = getStyles(props.sx);
  const elRef = useRef();
  useEffect(() => {
    setZoneStyle(getZoneMarkerStyle(rect));
  }, [rect]);
  return (
    <>
      <Box ref={elRef} style={zoneStyle} sx={sx.box} className={classes?.box} />
      {showZoneTooltip && (
        <Popper
          open
          anchorEl={elRef.current}
          placement="top-start"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 5]
              }
            }
          ]}
        >
          <Paper className={classes?.paper} sx={sx.paper}>
            {inherited ? <LevelDescriptorIcon sx={sx.icon} /> : <FieldIcon sx={sx.icon} />}
            <Typography noWrap>{label}</Typography>
            {menuItems && (
              <Box sx={{ ml: 1, pointerEvents: 'all', alignItems: 'center', display: 'flex' }}>{menuItems}</Box>
            )}
          </Paper>
        </Popper>
      )}
    </>
  );
}

export default ZoneMarker;
