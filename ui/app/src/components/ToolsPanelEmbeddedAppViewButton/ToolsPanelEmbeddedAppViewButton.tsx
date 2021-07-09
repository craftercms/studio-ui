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

import React, { useState } from 'react';
import ToolsPanelListItemButton, { ToolsPanelListItemButtonProps } from '../ToolsPanelListItemButton';
import { maximizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { useDispatch } from 'react-redux';
import WidgetDialog from '../WidgetDialog';
import { useMinimizeDialog } from '../../utils/hooks/useMinimizeDialog';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import { WidgetDescriptor } from '../Widget';

interface ToolsPanelEmbeddedAppViewButtonProps extends Omit<ToolsPanelListItemButtonProps, 'onClick'> {
  widget: WidgetDescriptor;
}

export default function ToolsPanelEmbeddedAppViewButton(props: ToolsPanelEmbeddedAppViewButtonProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const id = props.widget.uiKey as string;
  const title = usePossibleTranslation(props.title);

  const minimized = useMinimizeDialog({
    id,
    title,
    minimized: false
  });

  const openEmbeddedApp = () => {
    if (minimized) {
      dispatch(maximizeDialog({ id }));
    }
    setOpen(true);
  };

  return (
    <>
      <ToolsPanelListItemButton {...props} onClick={openEmbeddedApp} />
      <WidgetDialog title={title} id={id} open={open} onClose={() => setOpen(false)} widget={props.widget} />
    </>
  );
}
