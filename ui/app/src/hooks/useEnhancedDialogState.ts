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
import { nnou } from '../utils/object';

export interface EnhancedDialogState {
  open: boolean;
  isMinimized: boolean;
  isFullScreen?: boolean;
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
    isFullScreen: false,
    hasPendingChanges: false,
    isSubmitting: false,
    ...initialState
  });
  return useMemo(() => {
    const onOpen = () => setState({ open: true });
    const onClose = () => setState({ open: false });
    const onResetState = () =>
      setState({
        open: false,
        isMinimized: false,
        isFullScreen: false,
        hasPendingChanges: false,
        isSubmitting: false,
        ...initialState
      });
    const onFullScreen = () => setState({ isFullScreen: true });
    const onCancelFullScreen = () => setState({ isFullScreen: false });
    const onMaximize = () => setState({ isMinimized: false });
    const onMinimize = () => setState({ isMinimized: true });
    const onSubmittingChange = (isSubmitting: boolean) => setState({ isSubmitting });
    const onHasPendingChange = (hasPendingChanges: boolean) => setState({ hasPendingChanges });
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
      onResetState,
      onMaximize,
      onMinimize,
      onFullScreen,
      onCancelFullScreen,
      onSubmittingChange,
      onHasPendingChange,
      onSubmittingAndOrPendingChange
    };
    // Users of the effect most likely won’t memo the initial state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setState, state]);
}
