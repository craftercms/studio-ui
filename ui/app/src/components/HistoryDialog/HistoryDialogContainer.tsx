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

import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { HistoryDialogContainerProps, Menu, menuInitialState, menuOptions } from './utils';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { LegacyVersion, VersionsStateProps } from '../../models/Version';
import ContextMenu, { ContextMenuOption } from '../ContextMenu';
import { hasRevertAction } from '../../utils/content';
import {
  closeConfirmDialog,
  fetchContentVersion,
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
import { getEditorMode, isImage } from '../PathNavigator/utils';
import {
  compareBothVersions,
  compareToPreviousVersion,
  compareVersion,
  revertContent,
  revertToPreviousVersion,
  versionsChangeItem,
  versionsChangePage
} from '../../state/reducers/versions';
import { asDayMonthDateTime } from '../../utils/datetime';
import DialogBody from '../Dialogs/DialogBody';
import SingleItemSelector from '../SingleItemSelector';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import VersionList from '../VersionList';
import DialogFooter from '../Dialogs/DialogFooter';
import { Pagination } from './Pagination';
import { historyStyles } from './HistoryDialog';

export function HistoryDialogContainer(props: HistoryDialogContainerProps) {
  const { versionsBranch } = props;
  const { count, page, limit, current, item, rootPath, isConfig } = versionsBranch;
  const path = item ? item.path : '';
  const [openSelector, setOpenSelector] = useState(false);
  const { formatMessage } = useIntl();
  const classes = historyStyles({});
  const dispatch = useDispatch();
  const site = useActiveSiteId();

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
      const sections: ContextMenuOption[][] = [[contextMenuOptions.view]];
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
        if (hasRevertAction(item.availableActions) || isConfig) {
          sections.push([isCurrent ? contextMenuOptions.revertToPrevious : contextMenuOptions.revertToThisVersion]);
        }
      }
      setMenu({
        sections,
        anchorEl,
        activeItem: version
      });
    },
    [item.systemType, item.availableActions, count, setMenu, formatMessage, isConfig]
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
    const supportsDiff = ['page', 'component', 'taxonomy'].includes(item.systemType);

    if (supportsDiff) {
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
    } else {
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

  const onPageChanged = (nextPage: number) => {
    dispatch(versionsChangePage({ page: nextPage }));
  };

  return (
    <>
      <DialogBody className={classes.dialogBody}>
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
        {count > 0 && <Pagination count={count} page={page} rowsPerPage={limit} onPageChanged={onPageChanged} />}
      </DialogFooter>
      {Boolean(menu.anchorEl) && (
        <ContextMenu
          open={true}
          anchorEl={menu.anchorEl}
          onClose={handleContextMenuClose}
          options={menu.sections}
          onMenuItemClicked={handleContextMenuItemClicked}
        />
      )}
    </>
  );
}
