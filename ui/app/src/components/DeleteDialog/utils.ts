import StandardAction from '../../models/StandardAction';
import { DetailedItem } from '../../models/Item';
import React from 'react';
import { Resource } from '../../models/Resource';
import { DeleteDependencies } from '../../modules/Content/Dependencies/DependencySelection';
import LookupTable from '../../models/LookupTable';
import { InputProps } from '@mui/material/Input';
import { SelectionListProps } from '../../modules/Content/Dependencies/SelectionList';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

export interface DeleteDialogBaseProps {
  items: DetailedItem[];
  isFetching: boolean;
  childItems: string[];
  dependentItems: string[];
}

export interface DeleteDialogProps extends DeleteDialogBaseProps, EnhancedDialogProps {
  onSuccess?(response?: any): any;
}

export interface DeleteDialogStateProps extends DeleteDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onSuccess?: StandardAction;
}

export interface DeleteDialogContainerProps
  extends DeleteDialogBaseProps,
    Pick<DeleteDialogProps, 'isSubmitting' | 'onClose' | 'onSuccess'> {}

export interface DeleteDialogContentUIProps {
  resource: Resource<DeleteDependencies>;
  items: DetailedItem[];
  comment: string;
  selectedItems: LookupTable<boolean>;
  isCommentRequired: boolean;
  isDisabled: boolean;
  isConfirmDeleteChecked: boolean;
  onCommentChange: InputProps['onChange'];
  onItemClicked: SelectionListProps['onItemClicked'];
  onSelectAllClicked: SelectionListProps['onSelectAllClicked'];
  onSelectAllDependantClicked: SelectionListProps['onSelectAllClicked'];
  onConfirmDeleteChange(event: React.ChangeEvent, checked: boolean): void;
  onEditDependantClick: SelectionListProps['onEditClick'];
}

export interface DeleteDialogUIProps extends DeleteDialogContentUIProps {
  isSubmitting: boolean;
  isSubmitButtonDisabled: boolean;
  onSubmit(): void;
  onCloseButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}
