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

import React from 'react';
import ToolsPanelListItemButton from '../ToolsPanelListItemButton';
import { useDispatch } from 'react-redux';
import { pushIcePanelPage, pushToolsPanelPage } from '../../state/actions/preview';
import { createWidgetDescriptor } from '../../utils/state';
import { SystemIconDescriptor } from '../SystemIcon';
import ToolsPanelTarget from '../../models/ToolsPanelTarget';

export interface ToolsPanelPageButtonProps {
  title: string;
  subtitle: string;
  target?: ToolsPanelTarget;
  icon: SystemIconDescriptor;
}

export function ToolsPanelPageButton(props: ToolsPanelPageButtonProps) {
  const { target = 'toolsPanel' } = props;
  const dispatch = useDispatch();
  const pushPage = target === 'toolsPanel' ? pushToolsPanelPage : pushIcePanelPage;
  const turnPage = () => {
    dispatch(
      pushPage(
        createWidgetDescriptor({
          id: 'craftercms.components.ToolsPanelPage',
          permittedRoles: [],
          configuration: props
        })
      )
    );
  };
  return <ToolsPanelListItemButton {...props} onClick={turnPage} />;
}

export default ToolsPanelPageButton;
