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

import { EnhancedDialog, EnhancedDialogProps } from '../../EnhancedDialog';
import { applyTranslations, PartialContentType } from '../utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { DialogBody } from '../../DialogBody';
import { useEffect, useState } from 'react';
import controlDescriptors from '../descriptors/controls';
import { SelectField } from './PickFieldDialog';
import { DialogFooter } from '../../DialogFooter';
import SecondaryButton from '../../SecondaryButton';
import PrimaryButton from '../../PrimaryButton';
import { basicFieldsIds } from './PickControlDialog';

export interface SwapFieldDialogProps extends EnhancedDialogProps {
	currentFieldId: string;
	onSwapField(newField: PartialContentType): void;
}

const types = Object.values(controlDescriptors).sort((a, b) => (a?.name > b?.name ? 1 : -1));

// TODO: Right now we are displaying all the types even when swapping 'file-name' field. This needs to be addressed.
export function SwapFieldDialogBody(props: SwapFieldDialogProps) {
	const { currentFieldId, onSwapField, onClose } = props;
	const [selectedField, setSelectedField] = useState<PartialContentType>(undefined);
	const { formatMessage } = useIntl();

	useEffect(() => {
		if (currentFieldId) {
			const newSelectedField = applyTranslations(
				types.find((type) => type.id === currentFieldId),
				formatMessage
			);
			setSelectedField(newSelectedField);
		}
	}, [currentFieldId, formatMessage]);

	return (
		<>
			<DialogBody sx={{ transition: 'height 0.3s ease-in-out', minHeight: '40vh' }}>
				<SelectField
					typesFullList={types}
					selectedField={selectedField}
					setSelectedField={setSelectedField}
					basicFieldsIds={basicFieldsIds}
				/>
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={(e) => onClose?.(e, null)}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton onClick={() => onSwapField?.(selectedField)}>
					<FormattedMessage defaultMessage="Select" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function SwapFieldDialog(props: SwapFieldDialogProps) {
	const { currentFieldId, onSwapField, ...dialogProps } = props;
	return (
		<EnhancedDialog title={<FormattedMessage defaultMessage="Swap Field" />} maxWidth="sm" {...dialogProps}>
			<SwapFieldDialogBody {...dialogProps} currentFieldId={currentFieldId} onSwapField={onSwapField} />
		</EnhancedDialog>
	);
}

export default SwapFieldDialog;
