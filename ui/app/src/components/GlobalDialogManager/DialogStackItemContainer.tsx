/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import { DialogStackItem } from '../../models';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { useDispatch } from 'react-redux';
import React, { createElement, ElementType, useMemo } from 'react';
import { components } from '../../utils/constants';
import AlertDialog from '../AlertDialog';
import infoImgUrl from '../../assets/information.svg';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { popDialog, updateDialogState } from '../../state/actions/dialogStack';
import { displayWithPendingChangesConfirm } from '../../utils/ui';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { batchActions } from '../../state/actions/misc';

export function DialogStackItemContainer(props: DialogStackItem<EnhancedDialogProps>) {
	const { component } = props;
	const DialogComponent = useMemo(() => pickDialogComponent(component), [component]);
	const callbackProps = useCreateCallbackProps(props);
	return createElement(DialogComponent, { ...props.props, ...callbackProps });
}

function pickDialogComponent(component: string | ElementType) {
	if (typeof component === 'string') {
		if (components.has(component)) {
			return components.get(component) as ElementType<EnhancedDialogProps>;
		} else {
			return createUnknownComponent(component);
		}
	} else {
		return component as ElementType<EnhancedDialogProps>;
	}
}

function createUnknownComponent(component: string) {
	return (props: EnhancedDialogProps) => (
		<AlertDialog
			open={props.open}
			body={`Unknown component id "${component}". The component is not registered or the id is incorrect.`}
			imageUrl={infoImgUrl}
			buttons={
				<PrimaryButton fullWidth onClick={(e) => props.onClose(e, undefined)}>
					<FormattedMessage defaultMessage="Accept" />
				</PrimaryButton>
			}
		/>
	);
}

/* private */ function useCreateCallbackProps(props: DialogStackItem<EnhancedDialogProps>) {
	const { id, allowMinimize = false, allowFullScreen = false } = props;
	const dispatch = useDispatch();
	const propsRef = useUpdateRefs(props.props);
	return useMemo(() => {
		const onClose: EnhancedDialogProps['onClose'] = (e) =>
			propsRef.current?.onClose
				? props.props.onClose(e, null)
				: dispatch(batchActions([updateDialogState({ id, props: { open: false } }), popDialog({ id })]));

		const onMaximize: EnhancedDialogProps['onMaximize'] = allowMinimize
			? () => dispatch(updateDialogState({ id, props: { isMinimized: false } }))
			: undefined;

		const onMinimize: EnhancedDialogProps['onMinimize'] = allowMinimize
			? () => dispatch(updateDialogState({ id, props: { isMinimized: true } }))
			: undefined;

		const onFullScreen: EnhancedDialogProps['onFullScreen'] = allowFullScreen
			? () => dispatch(updateDialogState({ id, props: { isFullScreen: true } }))
			: undefined;

		const onCancelFullScreen: EnhancedDialogProps['onCancelFullScreen'] = allowFullScreen
			? () => dispatch(updateDialogState({ id, props: { isFullScreen: false } }))
			: undefined;

		// TODO: Review type discrepancy
		// @ts-expect-error: Discrepancy in types (EnhancedDialogProps['onTransitionExited'] !== propsRef.current.onTransitionEnd).
		const onTransitionExited: EnhancedDialogProps['onTransitionExited'] = (e) => {
			propsRef.current.onTransitionEnd?.(e);
			if (!propsRef.current.open && !propsRef.current.keepMounted) {
				dispatch(popDialog({ id }));
			}
		};

		const onWithPendingChangesCloseRequest: EnhancedDialogProps['onWithPendingChangesCloseRequest'] = (e, reason) =>
			displayWithPendingChangesConfirm(dispatch, () => onClose(e, reason));

		const updateSubmittingOrHasPendingChanges = (changes: { isSubmitting?: boolean; hasPendingChanges?: boolean }) =>
			dispatch(
				updateDialogState({
					id,
					props: {
						isSubmitting: changes.isSubmitting ?? propsRef.current.isSubmitting,
						hasPendingChanges: changes.hasPendingChanges ?? propsRef.current.hasPendingChanges
					} as Partial<EnhancedDialogProps>
				})
			);

		return {
			onClose,
			onMaximize,
			onMinimize,
			onFullScreen,
			onCancelFullScreen,
			onTransitionExited,
			onWithPendingChangesCloseRequest,
			updateSubmittingOrHasPendingChanges
		};
	}, [id, allowFullScreen, allowMinimize, dispatch, propsRef]);
}

export default DialogStackItemContainer;
