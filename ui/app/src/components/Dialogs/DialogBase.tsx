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

import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import React, { PropsWithChildren } from 'react';
import { useOnMount } from '../../utils/hooks';
import { reversePluckProps } from '../../utils/object';

type WrapperProps = PropsWithChildren<{
  onClosed(): void;
}>;

function Wrapper(props: WrapperProps) {
  useOnMount(() => {
    return () => {
      props.onClosed();
    };
  });
  return <>{props.children}</>;
}

interface DialogBase extends DialogProps {
  onClosed(): void;
}

export function DialogBase(props: DialogBase) {
  return (
    <Dialog open={props.open} {...reversePluckProps(props, 'onClosed')}>
      <Wrapper onClosed={props.onClosed}>{props.children}</Wrapper>
    </Dialog>
  );
}
