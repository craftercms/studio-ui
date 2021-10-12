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

import { useSpreadState } from './useSpreadState';
import { useMemo } from 'react';
import { nnou } from '../object';

export interface EnhancedDialogState {
  open: boolean;
  isMinimized: boolean;
  hasPendingChanges: boolean;
  isSubmitting: boolean;
}

export interface onSubmittingAndOrPendingChangeProps {
  hasPendingChanges?: boolean;
  isSubmitting?: boolean;
}

export function useEnhancedDialogState(initialState?: Partial<EnhancedDialogState>) {
  const [state, setState] = useSpreadState<EnhancedDialogState>({
    open: false,
    isMinimized: false,
    hasPendingChanges: false,
    isSubmitting: false,
    ...initialState
  });
  return useMemo(() => {
    const onOpen = () => setState({ open: true });
    const onClose = () => setState({ open: false });
    const onMaximize = () => setState({ isMinimized: false });
    const onMinimize = () => setState({ isMinimized: true });
    const onSubmittingAndOrPendingChange = ({
      isSubmitting,
      hasPendingChanges
    }: onSubmittingAndOrPendingChangeProps) => {
      if (
        (nnou(isSubmitting) && state.isSubmitting !== isSubmitting) ||
        (nnou(hasPendingChanges) && state.hasPendingChanges !== hasPendingChanges)
      ) {
        setState({
          isSubmitting: isSubmitting ?? state.isSubmitting,
          hasPendingChanges: hasPendingChanges ?? state.hasPendingChanges
        });
      }
    };
    return {
      ...state,
      onOpen,
      onClose,
      onMaximize,
      onMinimize,
      onSubmittingAndOrPendingChange
    };
  }, [setState, state]);
}
