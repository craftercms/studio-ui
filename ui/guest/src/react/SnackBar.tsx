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

import React, { PropsWithChildren, useEffect, useRef } from 'react';

export type Snack = PropsWithChildren<{
  open: boolean;
  duration?: number;
  message?: string;
  onClose: () => void;
}>;

function SnackBar(props: Snack) {
  const { open, duration, message, children, onClose } = props;
  const onCloseRef = useRef(onClose);
  const timeoutRef = useRef<any>();
  onCloseRef.current = onClose;
  useEffect(() => () => clearTimeout(timeoutRef.current), []);
  useEffect(() => {
    if (open) {
      timeoutRef.current = setTimeout(onCloseRef.current, duration);
    }
  }, [open, duration]);
  return open ? <craftercms-snackbar>{message || children}</craftercms-snackbar> : null;
}

export default SnackBar;
