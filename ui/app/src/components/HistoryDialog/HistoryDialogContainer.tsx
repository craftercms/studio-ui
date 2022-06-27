/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useSpreadState } from '../../hooks/useSpreadState';
import { HistoryDialogContainerProps, Menu, menuInitialState, menuOptions } from './utils';
import { useLogicResource } from '../../hooks/useLogicResource';
import { LegacyVersion, VersionsStateProps } from '../../models/Version';
import ContextMenu, { ContextMenuOption } from '../ContextMenu';
import {
  closeConfirmDialog,
  fetchContentVersion,
  historyDialogUpdate,
  showCompareVersionsDialog,
  showConfirmDialog,
  showHistoryDialog,
  showPreviewDialog,
  showViewVersionDialog
} from '../../state/actions/dialogs';
import translations from './translations';
import { batchActions } from '../../state/actions/misc';
import { fetchContentTypes } from '../../state/actions/preview';
import { fetchContentByCommitId } from '../../services/content';
import { getEditorMode, isImage, isPreviewable } from '../PathNavigator/utils';
import {
  compareBothVersions,
  compareToPreviousVersion,
  compareVersion,
  revertContent,
  revertToPreviousVersion,
  versionsChangeItem,
  versionsChangeLimit,
  versionsChangePage
} from '../../state/actions/versions';
import { asDayMonthDateTime } from '../../utils/datetime';
import DialogBody from '../DialogBody/DialogBody';
import SingleItemSelector from '../SingleItemSelector';
import { SuspenseWithEmptyState } from '../Suspencified/Suspencified';
import VersionList from '../VersionList';
import DialogFooter from '../DialogFooter/DialogFooter';
import { HistoryDialogPagination } from './HistoryDialogPagination';
import { historyStyles } from './HistoryDialog';
import useSelection from '../../hooks/useSelection';
import useFetchSandboxItems from '../../hooks/useFetchSandboxItems';

export function HistoryDialogContainer(props: HistoryDialogContainerProps) {
  const { versionsBranch } = props;
  const { count, page, limit, current, rootPath, isConfig } = versionsBranch;
  useFetchSandboxItems([versionsBranch.item.path]);
  // TODO: It'd be best for the dialog to directly receive a live item. Must change versions branch to only hold the path.
  const item = useSelection((state) => state.content.itemsByPath[versionsBranch.item.path]);
  const path = item?.path ?? '';
  const [openSelector, setOpenSelector] = useState(false);
  const { formatMessage } = useIntl();
  const { classes } = historyStyles();
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const timeoutRef = useRef(null);

  const [menu, setMenu] = useSpreadState<Menu>(menuInitialState);

  const versionsResource = useLogicResource<LegacyVersion[], VersionsStateProps>(versionsBranch, {
    shouldResolve: (versionsBranch) => Boolean(versionsBranch.versions) && !versionsBranch.isFetching,
    shouldReject: (versionsBranch) => Boolean(versionsBranch.error),
    shouldRenew: (versionsBranch, resource) => resource.complete,
    resultSelector: (versionsBranch) => versionsBranch.versions,
    errorSelector: (versionsBranch) => versionsBranch.error
  });

  const handleOpenMenu = useCallback(
    (anchorEl, version, isCurrent = false, initialCommit) => {
      const hasOptions = ['page', 'component', 'taxonomy'].includes(item.systemType);
      const contextMenuOptions: { [prop in keyof typeof menuOptions]: ContextMenuOption } = {};
      Object.entries(menuOptions).forEach(([key, value]) => {
        contextMenuOptions[key] = {
          id: value.id,
          label: formatMessage(value.label, value.values)
        };
      });
      const sections: ContextMenuOption[][] = [];
      if (isPreviewable(item)) {
        sections.push([contextMenuOptions.view]);
      }
      if (count > 1) {
        if (hasOptions) {
          if (initialCommit) {
            sections.push([contextMenuOptions.compareTo, contextMenuOptions.compareToCurrent]);
          } else if (isCurrent) {
            sections.push([contextMenuOptions.compareTo, contextMenuOptions.compareToPrevious]);
          } else {
            sections.push([
              contextMenuOptions.compareTo,
              contextMenuOptions.compareToCurrent,
              contextMenuOptions.compareToPrevious
            ]);
          }
        }
        if (!item.stateMap.locked && (item.availableActionsMap.revert || isConfig)) {
          sections.push([isCurrent ? contextMenuOptions.revertToPrevious : contextMenuOptions.revertToThisVersion]);
        }
      }
      setMenu({
        sections,
        anchorEl,
        activeItem: version
      });
    },
    [item, count, setMenu, formatMessage, isConfig]
  );

  const compareVersionDialogWithActions = () =>
    showCompareVersionsDialog({
      disableItemSwitching: true,
      rightActions: [
        {
          icon: { id: '@mui/icons-material/HistoryRounded' },
          onClick: showHistoryDialog({}),
          'aria-label': formatMessage(translations.backToHistoryList)
        }
      ]
    });

  const handleViewItem = (version: LegacyVersion) => {
    const supportsDiff = ['page', 'component', 'taxonomy'].includes(item.systemType);

    if (supportsDiff) {
      dispatch(
        batchActions([
          fetchContentTypes(),
          fetchContentVersion({ path, versionNumber: version.versionNumber }),
          showViewVersionDialog({
            rightActions: [
              {
                icon: { id: '@mui/icons-material/HistoryRounded' },
                onClick: showHistoryDialog({}),
                'aria-label': formatMessage(translations.backToHistoryList)
              }
            ]
          })
        ])
      );
    } else if (isPreviewable(item)) {
      fetchContentByCommitId(site, item.path, version.versionNumber).subscribe((content) => {
        const image = isImage(item);
        dispatch(
          showPreviewDialog({
            type: image ? 'image' : 'editor',
            title: item.label,
            [image ? 'url' : 'content']: content,
            mode: image ? void 0 : getEditorMode(item),
            subtitle: `v.${version.versionNumber}`
          })
        );
      });
    }
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
    const previousBranch = getPreviousBranch(activeItem);

    dispatch(
      showConfirmDialog({
        title: formatMessage(translations.confirmRevertTitle),
        body: formatMessage(translations.confirmRevertBody, {
          versionTitle: asDayMonthDateTime(previousBranch.lastModifiedDate)
        }),
        onCancel: closeConfirmDialog(),
        onOk: batchActions([closeConfirmDialog(), revertToPreviousVersion({ id: activeItem.versionNumber })])
      })
    );
  };

  const getPreviousBranch = (currentBranch: LegacyVersion) => {
    const versions = versionsBranch.versions;
    const currentIndex = versions.findIndex((branch) => branch.versionNumber === currentBranch.versionNumber);
    return versions[currentIndex + 1] ?? null;
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

  const handleContextMenuItemClicked = (option: string) => {
    const activeItem = menu.activeItem;
    setMenu(menuInitialState);
    switch (option) {
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

  // A user clicking too eagerly to jump to a much later page may end up clicking
  // the backdrop by mistake when the number of versions goes from pushing the height
  // of the dialog away from its minimum and then on the next page back to the minimum.
  // The timeout gives the user a chance to catch up with the change in the position of
  // the pagination button and/or realise he's reached the last page without closing the
  // dialog unintentionally.
  const temporaryBackdropClickDisable = () => {
    clearTimeout(timeoutRef.current);
    dispatch(historyDialogUpdate({ hasPendingChanges: true }));
    timeoutRef.current = setTimeout(() => dispatch(historyDialogUpdate({ hasPendingChanges: false })), 700);
  };

  const onPageChanged = (nextPage: number) => {
    temporaryBackdropClickDisable();
    dispatch(versionsChangePage({ page: nextPage }));
  };

  const onRowsPerPageChange = (limit: number) => {
    temporaryBackdropClickDisable();
    dispatch(versionsChangeLimit({ limit }));
  };

  return (
    <>
      <DialogBody className={classes.dialogBody} minHeight>
        <SingleItemSelector
          classes={{ root: classes.singleItemSelector }}
          label={<FormattedMessage id="words.item" defaultMessage="Item" />}
          open={openSelector}
          disabled={isConfig}
          onClose={() => setOpenSelector(false)}
          onDropdownClick={() => setOpenSelector(!openSelector)}
          rootPath={rootPath}
          selectedItem={item}
          onItemClicked={(item) => {
            setOpenSelector(false);
            dispatch(versionsChangeItem({ item }));
          }}
        />
        <SuspenseWithEmptyState resource={versionsResource}>
          <VersionList
            versions={versionsResource}
            onOpenMenu={handleOpenMenu}
            onItemClick={handleViewItem}
            current={current}
          />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter classes={{ root: classes.dialogFooter }}>
        {count > 0 && (
          <HistoryDialogPagination
            count={count}
            page={page}
            rowsPerPage={limit}
            onPageChanged={onPageChanged}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        )}
      </DialogFooter>
      {Boolean(menu.anchorEl) && (
        <ContextMenu
          open
          anchorEl={menu.anchorEl}
          onClose={handleContextMenuClose}
          options={menu.sections}
          onMenuItemClicked={handleContextMenuItemClicked}
        />
      )}
    </>
  );
}
