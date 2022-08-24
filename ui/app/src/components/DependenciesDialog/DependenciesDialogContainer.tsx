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

import { useSpreadState } from '../../hooks/useSpreadState';
import { DependenciesDialogContainerProps, dialogInitialState } from './utils';
import React, { useCallback, useEffect, useState } from 'react';
import { ApiResponse } from '../../models/ApiResponse';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useSelection } from '../../hooks/useSelection';
import { useDispatch } from 'react-redux';
import { DetailedItem } from '../../models/Item';
import { showHistoryDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { fetchItemVersions } from '../../state/actions/versions';
import { getRootPath } from '../../utils/path';
import { fetchDependant, fetchSimpleDependencies } from '../../services/dependencies';
import { openItemEditor, isEditableAsset, parseLegacyItemToSandBoxItem } from '../../utils/content';
import DependenciesDialogUI from './DependenciesDialogUI';

export function DependenciesDialogContainer(props: DependenciesDialogContainerProps) {
  const { item, dependenciesShown = 'depends-on', rootPath } = props;
  const [dialog, setDialog] = useSpreadState({
    ...dialogInitialState,
    item,
    dependenciesShown
  });
  const [deps, setDeps] = useState(null);
  const [error, setError] = useState<ApiResponse>(null);
  const siteId = useActiveSiteId();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const [contextMenu, setContextMenu] = useSpreadState({
    el: null,
    dependency: null
  });
  const dispatch = useDispatch();

  const handleEditorDisplay = (item: DetailedItem) => {
    openItemEditor(item, authoringBase, siteId, dispatch);
  };

  const handleHistoryDisplay = (item: DetailedItem) => {
    dispatch(
      batchActions([
        fetchItemVersions({
          item,
          rootPath: getRootPath(item.path)
        }),
        showHistoryDialog({})
      ])
    );
  };

  const getDepsItems = useCallback(
    (siteId: string, path: string, newItem?: boolean) => {
      if (dialog.dependenciesShown === 'depends-on') {
        if (dialog.dependantItems === null || newItem) {
          fetchDependant(siteId, path).subscribe({
            next: (response) => {
              const dependantItems = parseLegacyItemToSandBoxItem(response);
              setDialog({
                dependantItems,
                ...(newItem ? { dependencies: null } : {})
              });
              setDeps(dependantItems);
            },
            error: (error) => setError(error)
          });
        } else {
          setDeps(dialog.dependantItems);
        }
      } else {
        if (dialog.dependencies === null || newItem) {
          fetchSimpleDependencies(siteId, path).subscribe(
            (response) => {
              const dependencies = parseLegacyItemToSandBoxItem(response);
              setDialog({
                dependencies,
                ...(newItem ? { dependantItems: null } : {})
              });
              setDeps(dependencies);
            },
            (error) => setError(error)
          );
        } else {
          setDeps(dialog.dependencies);
        }
      }
    },
    // eslint-disable-next-line
    [dialog.item, dialog.dependenciesShown, setDialog]
  );

  useEffect(() => {
    setDialog({ item });
  }, [item, setDialog]);

  useEffect(() => {
    setDialog({ dependenciesShown });
  }, [dependenciesShown, setDialog]);

  useEffect(() => {
    if (dialog.item) {
      getDepsItems(siteId, dialog.item.path, true);
    }
  }, [dialog.item, siteId, getDepsItems]);

  useEffect(() => {
    if (dialog.item) {
      getDepsItems(siteId, dialog.item.path);
    }
  }, [dialog.dependenciesShown, dialog.item, getDepsItems, siteId]);

  const setCompactView = (active: boolean) => {
    setDialog({ compactView: active });
  };

  const setShowTypes = (showTypes: string) => {
    setDialog({ showTypes });
  };

  const setItem = (item: DetailedItem) => {
    setDialog({ item });
  };

  const setDependenciesShow = (dependenciesShown: string) => {
    setDialog({ dependenciesShown });
  };

  const handleContextMenuClick = (event: React.MouseEvent<HTMLButtonElement>, dependency: DetailedItem) => {
    setContextMenu({
      el: event.currentTarget,
      dependency
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      el: null,
      dependency: null
    });
  };

  return (
    <DependenciesDialogUI
      dependencies={deps}
      item={dialog.item}
      rootPath={rootPath}
      setItem={setItem}
      compactView={dialog.compactView}
      setCompactView={setCompactView}
      showTypes={dialog.showTypes}
      setShowTypes={setShowTypes}
      dependenciesShown={dialog.dependenciesShown}
      setDependenciesShown={setDependenciesShow}
      isEditableItem={isEditableAsset}
      handleEditorDisplay={handleEditorDisplay}
      handleHistoryDisplay={handleHistoryDisplay}
      contextMenu={contextMenu}
      handleContextMenuClick={handleContextMenuClick}
      handleContextMenuClose={handleContextMenuClose}
      error={error}
    />
  );
}

export default DependenciesDialogContainer;
