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

import React, { createContext, useContext, useMemo } from 'react';
import useStyles from './styles';
import { WidgetDialogProps } from './utils';
import EnhancedDialog from '../EnhancedDialog';
import Suspencified from '../Suspencified/Suspencified';
import { Widget } from '../Widget/Widget';
import useRef from '../../hooks/useUpdateRefs';
import { DialogProps } from '@mui/material/Dialog';
import { UNDEFINED } from '../../utils/constants';

interface WidgetDialogContextType {
  onClose: DialogProps['onClose'];
}

const WidgetDialogContext = createContext<WidgetDialogContextType>(UNDEFINED);

export function useWidgetDialogContext(): WidgetDialogContextType {
  return useContext(WidgetDialogContext);
}

export function WidgetDialog(props: WidgetDialogProps) {
  const { title, fullHeight = true, widget, onSubmittingAndOrPendingChange, isSubmitting, extraProps, ...rest } = props;
  const { classes } = useStyles();
  const fnRefs = useRef({ onClose: rest.onClose });
  const context = useMemo<WidgetDialogContextType>(
    () => ({
      onClose(...args) {
        fnRefs.current.onClose?.apply(void 0, args);
      }
    }),
    []
  );
  return (
    <EnhancedDialog
      title={title}
      maxWidth="xl"
      classes={{ ...(fullHeight && { paper: classes.widgetDialogPaper }) }}
      isSubmitting={isSubmitting}
      {...rest}
    >
      <WidgetDialogContext.Provider value={context}>
        <section {...(fullHeight && { className: classes.widgetDialogBody })}>
          <Suspencified loadingStateProps={{ styles: { graphicRoot: { minWidth: '350px', minHeight: '150px' } } }}>
            <Widget
              {...widget}
              overrideProps={{ onSubmittingAndOrPendingChange, isSubmitting, mountMode: 'dialog', ...extraProps }}
            />
          </Suspencified>
        </section>
      </WidgetDialogContext.Provider>
    </EnhancedDialog>
  );
}

export default WidgetDialog;
