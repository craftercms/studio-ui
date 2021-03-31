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

import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import { renderWidgets, WidgetDescriptor } from '../Widget';
import React from 'react';

export interface PageBuilderPanelUIProps {
  open: boolean;
  width: number;
  anchor?: 'right' | 'left';
  widgets: WidgetDescriptor[];
  userRolesInSite: string[];
  onWidthChange(width: number): void;
}

export function PageBuilderPanelUI(props: PageBuilderPanelUIProps) {
  const { width, open, anchor = 'right', onWidthChange, widgets, userRolesInSite } = props;
  return (
    <ResizeableDrawer open={open} anchor={anchor} width={width} onWidthChange={onWidthChange}>
      {renderWidgets(widgets, userRolesInSite)}
    </ResizeableDrawer>
  );
}

export default PageBuilderPanelUI;
