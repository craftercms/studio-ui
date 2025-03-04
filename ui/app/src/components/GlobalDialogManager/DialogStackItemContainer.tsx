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
import React, { ElementType, useMemo } from 'react';
import { components } from '../../utils/constants';
import AlertDialog from '../AlertDialog';
import infoImgUrl from '../../assets/information.svg';
import PrimaryButton from '../PrimaryButton';
import { FormattedMessage } from 'react-intl';
import { popDialog, updateDialogState } from '../../state/actions/dialogStack';
import { displayWithPendingChangesConfirm } from '../../utils/ui';

export function DialogStackItemContainer(props: DialogStackItem<EnhancedDialogProps>) {
	const { id, component, allowMinimize = false, allowFullScreen = false } = props;
	const dispatch = useDispatch();
	const Dialog = useMemo(() => {
		if (typeof component === 'string') {
			if (components.has(component)) {
				return components.get(component) as ElementType<EnhancedDialogProps>;
			} else {
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
		} else {
			return component as ElementType<EnhancedDialogProps>;
		}
	}, [component]);
	const onClose: EnhancedDialogProps['onClose'] = () => {
		dispatch(updateDialogState({ id, props: { open: false } }));
	};
	const onMaximize: EnhancedDialogProps['onMaximize'] = allowMinimize
		? () => {
				dispatch(updateDialogState({ id, props: { isMinimized: false } }));
			}
		: undefined;
	const onMinimize: EnhancedDialogProps['onMinimize'] = allowMinimize
		? () => {
				dispatch(updateDialogState({ id, props: { isMinimized: true } }));
			}
		: undefined;
	const onFullScreen: EnhancedDialogProps['onFullScreen'] = allowFullScreen
		? () => {
				dispatch(updateDialogState({ id, props: { isFullScreen: true } }));
			}
		: undefined;
	const onCancelFullScreen: EnhancedDialogProps['onCancelFullScreen'] = allowFullScreen
		? () => {
				dispatch(updateDialogState({ id, props: { isFullScreen: false } }));
			}
		: undefined;
	// TODO: Review type discrepancy
	// @ts-expect-error: Discrepancy in types (EnhancedDialogProps['onTransitionExited'] !== props.props.onTransitionEnd).
	const onTransitionExited: EnhancedDialogProps['onTransitionExited'] = (e) => {
		props.props.onTransitionEnd?.(e);
		if (!props.props.open && !props.props.keepMounted) {
			dispatch(popDialog({ id }));
		}
	};
	const onWithPendingChangesCloseRequest: EnhancedDialogProps['onWithPendingChangesCloseRequest'] = (e, reason) => {
		displayWithPendingChangesConfirm(dispatch, () => onClose(e, reason));
	};
	const updateSubmittingOrHasPendingChanges = (changes: { isSubmitting?: boolean; hasPendingChanges?: boolean }) => {
		dispatch(
			updateDialogState({
				id,
				props: {
					isSubmitting: changes.isSubmitting ?? props.props.isSubmitting,
					hasPendingChanges: changes.hasPendingChanges ?? props.props.hasPendingChanges
				} as Partial<EnhancedDialogProps>
			})
		);
	};
	return (
		<Dialog
			{...props.props}
			onClose={onClose}
			onMaximize={onMaximize}
			onMinimize={onMinimize}
			onFullScreen={onFullScreen}
			onCancelFullScreen={onCancelFullScreen}
			onTransitionExited={onTransitionExited}
			updateSubmittingOrHasPendingChanges={updateSubmittingOrHasPendingChanges}
			onWithPendingChangesCloseRequest={onWithPendingChangesCloseRequest}
		/>
	);
}

export default DialogStackItemContainer;
