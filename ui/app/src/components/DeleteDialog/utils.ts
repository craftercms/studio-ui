import StandardAction from '../../models/StandardAction';
import { DetailedItem } from '../../models/Item';

export interface DeleteDialogBaseProps {
  items: DetailedItem[];
  isFetching: boolean;
  childItems: string[];
  dependentItems: string[];
  disableQuickDismiss: boolean;
}

export interface DeleteDialogStateProps extends DeleteDialogBaseProps {
  open: boolean;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onSuccess?: StandardAction;
}
