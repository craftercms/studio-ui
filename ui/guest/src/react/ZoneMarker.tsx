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

import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { getZoneMarkerStyle } from '../utils/dom';
import { Box, Paper, Popper, Theme, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import { FullSxRecord, PartialClassRecord, PartialSxRecord } from '@craftercms/studio-ui/models/CustomRecord';
import LevelDescriptorIcon from '@craftercms/studio-ui/icons/LevelDescriptor';
import FieldIcon from '@craftercms/studio-ui/icons/ContentTypeField';

export type ZoneMarkerClassKey = 'box' | 'paper' | 'icon' | 'tooltip' | 'menuItemsContainer';

export type ZoneMarkerFullSx = FullSxRecord<ZoneMarkerClassKey>;

export type ZoneMarkerPartialSx = PartialSxRecord<ZoneMarkerClassKey>;

export interface ZoneMarkerProps {
  rect: DOMRect;
  label: string;
  inherited: boolean;
  showZoneTooltip?: boolean;
  menuItems?: ReactNode;
  onPopperClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
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
      overflow: 'hidden',
      fontWeight: 700,
      pointerEvents: 'none',
      zIndex: 'tooltip',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      ...sx?.paper
    },
    icon: {
      marginRight: 1,
      ...sx?.icon
    },
    tooltip: {
      transition: 'none',
      zIndex: 'tooltip',
      ...sx?.tooltip
    },
    menuItemsContainer: {
      pointerEvents: 'all',
      alignItems: 'center',
      display: 'flex'
    }
  } as Record<ZoneMarkerClassKey, SxProps<Theme>>;
}

export function ZoneMarker(props: ZoneMarkerProps) {
  const { rect, label, classes, inherited, menuItems, showZoneTooltip = true, onPopperClick } = props;
  const [zoneStyle, setZoneStyle] = useState<CSSProperties>();
  const sx = getStyles(props.sx);
  const elRef = useRef();
  useEffect(() => {
    setZoneStyle(getZoneMarkerStyle(rect));
  }, [rect]);
  return (
    <>
      <Box
        ref={elRef}
        style={zoneStyle}
        sx={sx.box}
        className={['craftercms-zone-marker', classes?.box].filter(Boolean).join(' ')}
      />
      {showZoneTooltip && elRef.current && (
        <Popper
          open
          anchorEl={elRef.current}
          placement="top-start"
          onClick={onPopperClick}
          sx={sx.tooltip}
          className="craftercms-zone-marker-tooltip"
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
            <div style={{ display: 'flex' }}>
              {inherited ? <LevelDescriptorIcon sx={sx.icon} /> : <FieldIcon sx={sx.icon} />}
              <Typography title={label} noWrap sx={{ pointerEvents: 'all' }}>
                {label}
              </Typography>
            </div>
            <div>{menuItems && <Box sx={sx.menuItemsContainer}>{menuItems}</Box>}</div>
          </Paper>
        </Popper>
      )}
    </>
  );
}

export default ZoneMarker;
