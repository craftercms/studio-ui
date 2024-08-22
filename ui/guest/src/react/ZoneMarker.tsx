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
import { Box, Paper, Popper, Theme, Typography, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import { FullSxRecord, PartialClassRecord, PartialSxRecord } from '@craftercms/studio-ui/models/CustomRecord';
import LevelDescriptorIcon from '@craftercms/studio-ui/icons/LevelDescriptor';
import FieldIcon from '@craftercms/studio-ui/icons/ContentTypeField';
import LockedStateIcon from '@craftercms/studio-ui/icons/Lock';
import Person from '@craftercms/studio-ui/models/Person';
import { darken, styled } from '@mui/material/styles';
import LookupTable from '@craftercms/studio-ui/src/models/LookupTable';
import AllowedContentTypesData from '@craftercms/studio-ui/models/AllowedContentTypesData';
import { ContentType, ContentTypeField } from '@craftercms/studio-ui/models/ContentType';
import { getCachedContentTypes } from '../contentController';
import { getAvatarWithIconColors } from '@craftercms/studio-ui/utils/contentType';
import UltraStyledTypography from './UltraStyledTypography';
import UltraStyledTooltip from './UltraStyledTooltip';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';

const AllowedTypeCircle = styled('div')({
  width: 20,
  height: 20,
  borderStyle: `solid`,
  borderWidth: `1px`,
  borderRadius: '20px',
  display: 'inline-block',
  marginRight: '2px'
});

export type ZoneMarkerClassKey = 'box' | 'paper' | 'icon' | 'tooltip' | 'menuItemsContainer';

export type ZoneMarkerFullSx = FullSxRecord<ZoneMarkerClassKey>;

export type ZoneMarkerPartialSx = PartialSxRecord<ZoneMarkerClassKey>;

export interface ZoneMarkerProps {
  rect: DOMRect;
  label: string;
  inherited: boolean;
  showZoneTooltip?: boolean;
  menuItems?: ReactNode;
  lockInfo?: Person;
  isStale?: boolean;
  onPopperClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  // TODO: Receive zoneType and abstract icon display here?
  // zoneType: 'component' | 'page' | 'field';
  sx?: ZoneMarkerPartialSx;
  classes?: PartialClassRecord<ZoneMarkerClassKey>;
  field?: ContentTypeField;
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
      fontSize: 21,
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
  const {
    rect,
    label,
    classes,
    inherited,
    menuItems,
    showZoneTooltip = true,
    onPopperClick,
    lockInfo = null,
    isStale = false,
    field
  } = props;
  const isLockedItem = Boolean(lockInfo);
  const [zoneStyle, setZoneStyle] = useState<CSSProperties>();
  const sx = getStyles(props.sx);
  const elRef = useRef();
  const theme = useTheme();
  let allowedTypesMeta: LookupTable<Partial<AllowedContentTypesData<boolean>>>;
  let contentTypes: LookupTable<ContentType>;
  if (field?.type === 'node-selector' && field.validations.allowedContentTypes) {
    allowedTypesMeta = field.validations.allowedContentTypes.value;
    contentTypes = getCachedContentTypes();
  }
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isLockedItem || isStale ? (
                <LockedStateIcon sx={sx.icon} />
              ) : inherited ? (
                <LevelDescriptorIcon sx={sx.icon} />
              ) : (
                <FieldIcon sx={sx.icon} />
              )}
              <UltraStyledTypography title={label} noWrap sx={{ color: (sx?.paper as SystemCssProperties).color }}>
                {label}
              </UltraStyledTypography>
              {allowedTypesMeta && (
                <Box
                  sx={{ ml: 1, pointerEvents: 'all', display: 'flex', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.entries(allowedTypesMeta).map(([id, modes]) => {
                    const type = contentTypes[id];
                    const { backgroundColor, textColor } = getAvatarWithIconColors(
                      type?.id ?? type?.name,
                      theme,
                      darken
                    );
                    return (
                      <UltraStyledTooltip
                        arrow
                        // TODO: i18n
                        title={`Drop target compatible with "${type?.name}" as ${Object.keys(modes)
                          .map((mode) => (mode === 'sharedExisting' ? 'existing shared' : mode))
                          .join(', ')}`}
                      >
                        <AllowedTypeCircle
                          sx={{
                            backgroundColor,
                            // TODO: The border colour is meant to contrast background colour of
                            //  the *Paper*, which is not set here and can be customized by app developers.
                            //  At the moment, is being set to the known colour set on guest/src/styles/styles.ts.
                            borderColor: textColor
                          }}
                        />
                      </UltraStyledTooltip>
                    );
                  })}
                </Box>
              )}
            </div>
            {isLockedItem && (
              <Typography noWrap variant="body2" component="div">
                {/* TODO: i18n */}
                Locked by {lockInfo.username}
              </Typography>
            )}
            {isStale && (
              <Typography noWrap variant="body2" component="div">
                {/* TODO: i18n */}
                Item was modified. Refresh to enable editing.
              </Typography>
            )}
            {menuItems && <Box sx={sx.menuItemsContainer}>{menuItems}</Box>}
          </Paper>
        </Popper>
      )}
    </>
  );
}

export default ZoneMarker;
