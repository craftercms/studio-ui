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
import useStyles from './styles';
import { WidgetDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import Suspencified from '../Suspencified/Suspencified';
import { Widget } from '../Widget/Widget';

export function WidgetDialog(props: WidgetDialogProps) {
  const { title, widget, onSubmittingAndOrPendingChange, isSubmitting, extraProps, ...rest } = props;
  const classes = useStyles();

  return (
    <EnhancedDialog
      title={title}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <section className={classes.toolPanelBody}>
        <Suspencified>
          <Widget
            {...widget}
            extraProps={{ onSubmittingAndOrPendingChange, isSubmitting, mountMode: 'dialog', ...extraProps }}
          />
        </Suspencified>
      </section>
    </EnhancedDialog>
  );
}

export default WidgetDialog;
