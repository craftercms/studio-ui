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

import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { DependenciesDialogContainerProps, dialogInitialState } from './utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiResponse } from '../../models/ApiResponse';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSelection } from '../../utils/hooks/useSelection';
import { useDispatch } from 'react-redux';
import { DetailedItem } from '../../models/Item';
import { showCodeEditorDialog, showEditDialog, showHistoryDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { fetchItemVersions } from '../../state/reducers/versions';
import { getRootPath } from '../../utils/path';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { fetchDependant, fetchSimpleDependencies } from '../../services/dependencies';
import { isEditableAsset, parseLegacyItemToSandBoxItem } from '../../utils/content';
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
    let type = 'controller';

    if (item.systemType === 'component' || item.systemType === 'page') {
      type = 'form';
    } else if (item.contentTypeId === 'renderingTemplate') {
      type = 'template';
    }

    if (type === 'form') {
      dispatch(showEditDialog({ path: item.path, authoringBase, site: siteId }));
    } else {
      dispatch(showCodeEditorDialog({ site: siteId, authoringBase, path: item.path, type }));
    }
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

  const depsSource = useMemo(() => {
    return { deps, error };
  }, [deps, error]);

  const resource = useLogicResource<DetailedItem[], { deps: DetailedItem[]; error: ApiResponse }>(depsSource, {
    shouldResolve: (source) => Boolean(source.deps),
    shouldReject: (source) => Boolean(source.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source.deps,
    errorSelector: (source) => source.error
  });

  const getDepsItems = useCallback(
    (siteId: string, path: string, newItem?: boolean) => {
      if (dialog.dependenciesShown === 'depends-on') {
        if (dialog.dependantItems === null || newItem) {
          fetchDependant(siteId, path).subscribe(
            (response) => {
              const dependantItems = parseLegacyItemToSandBoxItem(response);
              setDialog({
                dependantItems,
                ...(newItem ? { dependencies: null } : {})
              });
              setDeps(dependantItems);
            },
            (error) => setError(error)
          );
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
      resource={resource}
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
    />
  );
}

export default DependenciesDialogContainer;
