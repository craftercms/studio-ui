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

import React from 'react';
import DialogHeader from '../Dialogs/DialogHeader';
import { Widget, WidgetDescriptor } from '../Widget';
import useStyles from './styles';

interface WidgetDialogUIProps {
  title: string;
  onMinimize(): void;
  onClose(): void;
  widget: WidgetDescriptor;
}

export function WidgetDialogUI(props: WidgetDialogUIProps) {
  const { title, onMinimize, onClose, widget } = props;
  const classes = useStyles();
  return (
    <>
      <DialogHeader
        title={title}
        rightActions={[
          {
            icon: 'MinimizeIcon',
            onClick: onMinimize
          },
          {
            icon: 'CloseIcon',
            onClick: onClose
          }
        ]}
      />
      <section className={classes.toolPanelBody}>
        <Widget {...widget} />
      </section>
    </>
  );
}
