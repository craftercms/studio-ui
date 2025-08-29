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

import { EnhancedDialog, type EnhancedDialogProps } from '../../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import React, { useMemo, useState } from 'react';
import { isTouchDevice } from '../../FormsEngine/lib/sortableListUtil';
import { DialogBody } from '../../DialogBody';
import TouchSortableList from '../../FormsEngine/components/TouchSortableList';
import SortableList from '../../FormsEngine/components/SortableList';
import { EmptyState } from '../../EmptyState';
import { DialogFooter } from '../../DialogFooter';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';

export interface ReorderFieldsDialogProps extends EnhancedDialogProps {
	fields: { key: string; value: string }[];
	onReorderFields?: (fields: { key: string; value: string }[]) => void;
}

export function ReorderFieldsDialogBody(props: ReorderFieldsDialogProps) {
	const { fields: fieldsProp, onReorderFields: onReorderFieldsProp, onClose } = props;
	const [fields, setFields] = useState(fieldsProp);
	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const hasContent = Boolean(fields?.length);

	const onReorderFields = () => {
		onReorderFieldsProp?.(fields);
	};

	return (
		<>
			<DialogBody>
				{hasContent ? (
					useTouchSorting ? (
						<TouchSortableList items={fields} onChange={setFields} />
					) : (
						<SortableList items={fields} onChange={setFields} />
					)
				) : (
					<EmptyState key="emptyState" title={<FormattedMessage defaultMessage="No fields set in this section" />} />
				)}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => onClose(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton onClick={onReorderFields}>
					<FormattedMessage defaultMessage="Reorder" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function ReorderFieldsDialog(props: ReorderFieldsDialogProps) {
	const { fields, onClose, onReorderFields, ...dialogProps } = props;
	return (
		<EnhancedDialog
			{...dialogProps}
			onClose={onClose}
			maxWidth="md"
			title={<FormattedMessage defaultMessage="Reorder fields" />}
		>
			<ReorderFieldsDialogBody {...dialogProps} onClose={onClose} fields={fields} onReorderFields={onReorderFields} />
		</EnhancedDialog>
	);
}
