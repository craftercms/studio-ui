import StandardAction from '../../models/StandardAction';
import { DetailedItem } from '../../models/Item';
import React from 'react';
import { Resource } from '../../models/Resource';
import { DeleteDependencies } from '../../modules/Content/Dependencies/DependencySelection';
import LookupTable from '../../models/LookupTable';
import { InputProps } from '@material-ui/core/Input';
import { SelectionListProps } from '../../modules/Content/Dependencies/SelectionList';
import { DialogProps } from '../Dialog';

export interface DeleteDialogBaseProps {
  items: DetailedItem[];
  isFetching: boolean;
  childItems: string[];
  dependentItems: string[];
}

export interface DeleteDialogProps extends DeleteDialogBaseProps, DialogProps {
  onSuccess?(response?: any): any;
}

export interface DeleteDialogStateProps
  extends DeleteDialogBaseProps,
    Pick<DialogProps, 'open' | 'isSubmitting' | 'hasPendingChanges'> {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onSuccess?: StandardAction;
}

export interface DeleteDialogContainerProps
  extends DeleteDialogBaseProps,
    Pick<DeleteDialogProps, 'isSubmitting' | 'onClose' | 'onSuccess' | 'onClosed'> {}

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
