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

import React, { PropsWithChildren, useCallback, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useLogicResource, useSpreadState, useUnmount } from '../../../utils/hooks';
import ContextMenu, { SectionItem } from '../../../components/ContextMenu';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { LookupTable } from '../../../models/LookupTable';
import StandardAction from '../../../models/StandardAction';
import { useDispatch } from 'react-redux';
import { VersionList } from './VersionList';
import TablePagination from '@material-ui/core/TablePagination';
import { fetchContentTypes } from '../../../state/actions/preview';
import DialogHeader from '../../../components/Dialogs/DialogHeader';
import DialogFooter from '../../../components/Dialogs/DialogFooter';
import DialogBody from '../../../components/Dialogs/DialogBody';
import { LegacyVersion, VersionsStateProps } from '../../../models/Version';
import {
  compareBothVersions,
  compareToPreviousVersion,
  compareVersion,
  revertContent,
  revertToPreviousVersion,
  versionsChangeItem,
  versionsChangePage
} from '../../../state/reducers/versions';
import {
  closeConfirmDialog,
  fetchContentVersion,
  showCompareVersionsDialog,
  showConfirmDialog,
  showHistoryDialog,
  showViewVersionDialog
} from '../../../state/actions/dialogs';
import SingleItemSelector from '../Authoring/SingleItemSelector';
import Dialog from '@material-ui/core/Dialog';
import { batchActions } from '../../../state/actions/misc';
import { fetchUserPermissions } from '../../../state/actions/content';
import { asDayMonthDateTime } from '../../../utils/datetime';

const translations = defineMessages({
  previousPage: {
    id: 'pagination.PreviousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  },
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  },
  compareTo: {
    id: 'historyDialog.options.compareTo',
    defaultMessage: 'Compare to...'
  },
  compareToCurrent: {
    id: 'historyDialog.options.compareToCurrent',
    defaultMessage: 'Compare to current'
  },
  compareToPrevious: {
    id: 'historyDialog.options.compareToPrevious',
    defaultMessage: 'Compare to previous'
  },
  revertToPrevious: {
    id: 'historyDialog.options.revertToPrevious',
    defaultMessage: 'Revert to <b>previous</b>'
  },
  revertToThisVersion: {
    id: 'historyDialog.options.revertToThisVersion',
    defaultMessage: 'Revert to <b>this version</b>'
  },
  backToHistoryList: {
    id: 'historyDialog.back.selectRevision',
    defaultMessage: 'Back to history list'
  },
  confirmRevertTitle: {
    id: 'historyDialog.confirmRevertTitle',
    defaultMessage: 'Revert confirmation'
  },
  confirmRevertBody: {
    id: 'historyDialog.confirmRevertBody',
    defaultMessage: 'Are you sure you want to revert to {versionTitle}?'
  }
});

const historyStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      overflow: 'auto',
      minHeight: '50vh'
    },
    dialogFooter: {
      padding: 0
    },
    menuList: {
      padding: 0
    },
    singleItemSelector: {
      marginBottom: '10px'
    }
  })
);

const paginationStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      marginLeft: 'auto',
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    toolbar: {
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '20px',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      }
    }
  })
);

const menuOptions: LookupTable<SectionItem> = {
  view: {
    id: 'view',
    label: translations.view
  },
  compareTo: {
    id: 'compareTo',
    label: translations.compareTo
  },
  compareToCurrent: {
    id: 'compareToCurrent',
    label: translations.compareToCurrent
  },
  compareToPrevious: {
    id: 'compareToPrevious',
    label: translations.compareToPrevious
  },
  revertToPrevious: {
    id: 'revertToPrevious',
    label: translations.revertToPrevious,
    values: { b: (msg) => <b key={'bold'}>&nbsp;{msg}</b> }
  },
  revertToThisVersion: {
    id: 'revertToThisVersion',
    label: translations.revertToThisVersion,
    values: { b: (msg) => <b key={'bold'}>&nbsp;{msg}</b> }
  }
};

const menuInitialState = {
  sections: [],
  anchorEl: null,
  activeItem: null
};

interface Menu {
  sections: SectionItem[][];
  anchorEl: Element;
  activeItem: LegacyVersion;
}

interface HistoryDialogBaseProps {
  open: boolean;
}

export type HistoryDialogProps = PropsWithChildren<
  HistoryDialogBaseProps & {
    versionsBranch: VersionsStateProps;
    permissions: LookupTable<boolean>;
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface HistoryDialogStateProps extends HistoryDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

export default function HistoryDialog(props: HistoryDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <HistoryDialogBody {...props} />
    </Dialog>
  );
}

function HistoryDialogBody(props: HistoryDialogProps) {
  const { onDismiss, versionsBranch, permissions } = props;
  const { count, page, limit, current, item, rootPath, isConfig } = versionsBranch;
  const path = item ? item.path : '';
  const [openSelector, setOpenSelector] = useState(false);
  const { formatMessage } = useIntl();
  const classes = historyStyles({});
  const dispatch = useDispatch();

  useUnmount(props.onClosed);

  const [menu, setMenu] = useSpreadState<Menu>(menuInitialState);

  const versionsResource = useLogicResource<LegacyVersion[], VersionsStateProps>(versionsBranch, {
    shouldResolve: (versionsBranch) => Boolean(versionsBranch.versions) && !versionsBranch.isFetching,
    shouldReject: (versionsBranch) => Boolean(versionsBranch.error),
    shouldRenew: (versionsBranch, resource) => resource.complete,
    resultSelector: (versionsBranch) => versionsBranch.versions,
    errorSelector: (versionsBranch) => versionsBranch.error
  });

  const permissionsResource = useLogicResource<LookupTable<boolean>, LookupTable<boolean>>(permissions, {
    shouldResolve: (permissions) => Boolean(permissions),
    shouldReject: () => false,
    shouldRenew: (permissions, resource) => resource.complete,
    resultSelector: (permissions) => permissions,
    errorSelector: () => null
  });

  const handleOpenMenu = useCallback(
    (anchorEl, version, isCurrent = false, permissions, initialCommit) => {
      const write = permissions?.write;
      const hasOptions = ['page', 'component', 'taxonomy'].includes(item.systemType);
      let sections = [];
      sections.push([menuOptions.view]);

      if (count > 1) {
        if (hasOptions) {
          if (initialCommit) {
            sections.push([menuOptions.compareTo, menuOptions.compareToCurrent]);
          } else if (isCurrent) {
            sections.push([menuOptions.compareTo, menuOptions.compareToPrevious]);
          } else {
            sections.push([menuOptions.compareTo, menuOptions.compareToCurrent, menuOptions.compareToPrevious]);
          }
        }

        if (write) {
          if (isCurrent) {
            sections.push([menuOptions.revertToPrevious]);
          } else {
            sections.push([menuOptions.revertToThisVersion]);
          }
        }
      }

      setMenu({
        sections,
        anchorEl,
        activeItem: version
      });
    },
    [count, item.systemType, setMenu]
  );

  const compareVersionDialogWithActions = () =>
    showCompareVersionsDialog({
      disableItemSwitching: true,
      rightActions: [
        {
          icon: 'HistoryIcon',
          onClick: showHistoryDialog({}),
          'aria-label': formatMessage(translations.backToHistoryList)
        }
      ]
    });

  const handleViewItem = (version: LegacyVersion) => {
    dispatch(
      batchActions([
        fetchContentTypes(),
        fetchContentVersion({ path, versionNumber: version.versionNumber }),
        showViewVersionDialog({
          rightActions: [
            {
              icon: 'HistoryIcon',
              onClick: showHistoryDialog({}),
              'aria-label': formatMessage(translations.backToHistoryList)
            }
          ]
        })
      ])
    );
  };

  const compareTo = (versionNumber: string) => {
    dispatch(
      batchActions([fetchContentTypes(), compareVersion({ id: versionNumber }), compareVersionDialogWithActions()])
    );
  };

  const compareBoth = (selected: string[]) => {
    dispatch(
      batchActions([
        fetchContentTypes(),
        compareBothVersions({ versions: selected }),
        compareVersionDialogWithActions()
      ])
    );
  };

  const compareToPrevious = (versionNumber: string) => {
    dispatch(
      batchActions([
        fetchContentTypes(),
        compareToPreviousVersion({ id: versionNumber }),
        compareVersionDialogWithActions()
      ])
    );
  };

  const revertToPrevious = (activeItem: LegacyVersion) => {
    dispatch(
      showConfirmDialog({
        title: formatMessage(translations.confirmRevertTitle),
        body: formatMessage(translations.confirmRevertBody, {
          versionTitle: asDayMonthDateTime(activeItem.lastModifiedDate)
        }),
        onCancel: closeConfirmDialog(),
        onOk: batchActions([closeConfirmDialog(), revertToPreviousVersion({ id: activeItem.versionNumber })])
      })
    );
  };

  const revertTo = (activeItem: LegacyVersion) => {
    dispatch(
      showConfirmDialog({
        title: formatMessage(translations.confirmRevertTitle),
        body: formatMessage(translations.confirmRevertBody, {
          versionTitle: asDayMonthDateTime(activeItem.lastModifiedDate)
        }),
        onCancel: closeConfirmDialog(),
        onOk: batchActions([closeConfirmDialog(), revertContent({ path, versionNumber: activeItem.versionNumber })])
      })
    );
  };

  const handleContextMenuClose = () => {
    setMenu({
      anchorEl: null,
      activeItem: null
    });
  };

  const handleContextMenuItemClicked = (section: SectionItem) => {
    const activeItem = menu.activeItem;
    setMenu(menuInitialState);
    switch (section.id) {
      case 'view': {
        handleViewItem(activeItem);
        break;
      }
      case 'compareTo': {
        compareTo(activeItem.versionNumber);
        break;
      }
      case 'compareToCurrent': {
        compareBoth([activeItem.versionNumber, current]);
        break;
      }
      case 'compareToPrevious': {
        compareToPrevious(activeItem.versionNumber);
        break;
      }
      case 'revertToPrevious': {
        revertToPrevious(activeItem);
        break;
      }
      case 'revertToThisVersion': {
        revertTo(activeItem);
        break;
      }
      default:
        break;
    }
  };

  const onPageChanged = (nextPage: number) => {
    dispatch(versionsChangePage({ page: nextPage }));
  };

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="historyDialog.headerTitle" defaultMessage="Item History" />}
        onDismiss={onDismiss}
      />
      <DialogBody className={classes.dialogBody}>
        <SingleItemSelector
          classes={{ root: classes.singleItemSelector }}
          label="Item"
          open={openSelector}
          disabled={isConfig}
          onClose={() => setOpenSelector(false)}
          onDropdownClick={() => setOpenSelector(!openSelector)}
          rootPath={rootPath}
          selectedItem={item}
          onItemClicked={(item) => {
            setOpenSelector(false);
            dispatch(batchActions([versionsChangeItem({ item }), fetchUserPermissions({ path: item.path })]));
          }}
        />
        <SuspenseWithEmptyState resource={versionsResource}>
          <VersionList
            versions={versionsResource}
            permissions={permissionsResource}
            onOpenMenu={handleOpenMenu}
            onItemClick={handleViewItem}
            current={current}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter classes={{ root: classes.dialogFooter }}>
        {count > 0 && <Pagination count={count} page={page} rowsPerPage={limit} onPageChanged={onPageChanged} />}
      </DialogFooter>
      {Boolean(menu.anchorEl) && (
        <ContextMenu
          open={true}
          anchorEl={menu.anchorEl}
          onClose={handleContextMenuClose}
          sections={menu.sections}
          onMenuItemClicked={handleContextMenuItemClicked}
          classes={{ menuList: classes.menuList }}
        />
      )}
    </>
  );
}

interface PaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChanged(nextPage: number): void;
}

export function Pagination(props: PaginationProps) {
  const classes = paginationStyles({});
  const { formatMessage } = useIntl();
  const { count, page, rowsPerPage } = props;
  return (
    <TablePagination
      className={classes.pagination}
      classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
      component="div"
      labelRowsPerPage=""
      rowsPerPageOptions={[10, 20, 30]}
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      backIconButtonProps={{
        'aria-label': formatMessage(translations.previousPage)
      }}
      nextIconButtonProps={{
        'aria-label': formatMessage(translations.nextPage)
      }}
      onChangePage={(e: React.MouseEvent<HTMLButtonElement>, nextPage: number) => props.onPageChanged(nextPage)}
    />
  );
}
