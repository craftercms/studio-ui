/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import React, { ReactNode } from 'react';
import Alert, { AlertProps } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { CustomContentProps, SnackbarContent } from 'notistack';

type AdditionalVariantProps = Partial<{
  alertTitle: ReactNode;
  alertVariant: AlertProps['variant'];
  alertSx: AlertProps['sx'];
  variant: AlertProps['severity'];
}>;

declare module 'notistack' {
  interface VariantOverrides {
    warning: AdditionalVariantProps;
    error: AdditionalVariantProps;
    success: AdditionalVariantProps;
    info: AdditionalVariantProps;
  }
}

export const NotistackVariant = React.forwardRef<HTMLDivElement, CustomContentProps & AdditionalVariantProps>(function (
  props,
  ref
) {
  const { id, variant, alertTitle, alertVariant, alertSx } = props;
  return (
    <SnackbarContent ref={ref}>
      <Alert
        action={typeof props.action === 'function' ? props.action(id) : props.action}
        severity={variant}
        variant={alertVariant}
        sx={{ width: '100%', flexWrap: 'wrap', ...alertSx }}
      >
        {alertTitle && <AlertTitle children={alertTitle} />}
        {props.message}
      </Alert>
    </SnackbarContent>
  );
});

export default NotistackVariant;
