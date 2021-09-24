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

import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import FolderBrowserTreeViewUI, { TreeNode } from '../FolderBrowserTreeView/FolderBrowserTreeViewUI';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import LookupTable from '../../models/LookupTable';
import { getIndividualPaths } from '../../utils/path';
import { forkJoin, Observable } from 'rxjs';
import StandardAction from '../../models/StandardAction';
import { ApiResponse } from '../../models/ApiResponse';
import TranslationOrText from '../../models/TranslationOrText';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import { legacyItemsToTreeNodes } from '../FolderBrowserTreeView/utils';
import { useSelection } from '../../utils/hooks/useSelection';
import { useWithPendingChangesCloseRequest } from '../../utils/hooks/useWithPendingChangesCloseRequest';
import { fetchLegacyItemsTree } from '../../services/content';
import { LegacyItem } from '../../models/Item';
import { FormattedMessage } from 'react-intl';
import DialogBody from './DialogBody';
import Suspencified from '../SystemStatus/Suspencified';
import DialogFooter from './DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import CreateFolderDialog from '../CreateFolderDialog';
import DialogHeader from '../DialogHeader';

export interface PathSelectionDialogBaseProps {
  open: boolean;
  title?: TranslationOrText;
  rootPath: string;
  initialPath?: string;
  showCreateFolderOption?: boolean;
}

interface PathSelectionDialogCallbacks {
  onClose(): void;
  onClosed?(): void;
  onOk?(response: { path: string }): void;
}

export type PathSelectionDialogProps = PropsWithChildren<PathSelectionDialogBaseProps & PathSelectionDialogCallbacks>;

export interface PathSelectionDialogStateProps extends PathSelectionDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onOk?: StandardAction;
}

export type PathSelectionDialogBodyProps = PathSelectionDialogBaseProps &
  PathSelectionDialogCallbacks & { site: string };

export interface PathSelectionDialogBodyUIProps {
  title?: TranslationOrText;
  error?: ApiResponse;
  treeNodes: TreeNode;
  isInvalidPath: boolean;
  rootPath: string;
  currentPath: string;
  expandedItemPaths: string[];
  isFetchingPath: boolean;
  showCreateFolderOption?: boolean;
  uncheckedInputValue: boolean;
  createFolderDialogOpen: boolean;
  onOk: (args: { path: string }) => void;
  onClose?: () => void;
  onPathInputKeyPress: (event: React.KeyboardEvent) => void;
  onNodeToggle: (event: React.ChangeEvent, nodeIds: string[]) => void;
  onNodeSelected: (event: React.ChangeEvent, nodeId: string) => void;
  onPathChanged: (path: string) => void;
  onCreateFolder: () => void;
  onCloseCreateFolder: () => void;
  onFolderCreated: (args: { path: string; name: string }) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      minHeight: '60vh'
    },
    createFolderBtn: {
      marginRight: 'auto'
    },
    treeViewRoot: {
      marginTop: '15px'
    }
  })
);

export function PathSelectionDialog(props: PathSelectionDialogProps) {
  const site = useActiveSiteId();
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      {props.children ?? <PathSelectionDialogBody {...props} site={site} />}
    </Dialog>
  );
}

export function PathSelectionDialogBody(props: PathSelectionDialogBodyProps) {
  const { site, onClosed, onClose, onOk, rootPath, initialPath, title, showCreateFolderOption = true } = props;
  const [currentPath, setCurrentPath] = useState(initialPath ?? rootPath);
  const [expanded, setExpanded] = useState(initialPath ? getIndividualPaths(initialPath) : [rootPath]);
  const [invalidPath, setInvalidPath] = useState(false);
  const [dirtyInput, setDirtyInput] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [treeNodes, setTreeNodes] = useState<TreeNode>(null);
  const [createFolder, setCreateFolder] = useState(false);
  const nodesLookupRef = useRef<LookupTable<TreeNode>>({});
  const [error, setError] = useState<Partial<ApiResponse>>(null);

  useUnmount(onClosed);

  useEffect(() => {
    if (currentPath) {
      let nodesLookup = nodesLookupRef.current;
      if (nodesLookup[currentPath] && nodesLookup[currentPath]?.fetched) {
        setInvalidPath(false);
      } else {
        const allPaths = getIndividualPaths(currentPath, rootPath).filter(
          (path) => !nodesLookup[path] || !nodesLookup[path].fetched
        );
        const requests: Observable<LegacyItem>[] = [];
        allPaths.forEach((nextPath) => {
          requests.push(fetchLegacyItemsTree(site, nextPath, { depth: 1, order: 'default' }));
        });

        if (requests.length) {
          setIsFetching(true);
          forkJoin(requests).subscribe({
            next: (responses) => {
              let rootNode;
              setIsFetching(false);
              responses.forEach(({ response: { item } }, i) => {
                let parent;

                if (i === requests.length - 1) {
                  setInvalidPath(item.deleted);
                }

                if (item.deleted) {
                  return;
                }

                if (!nodesLookup['root']) {
                  parent = {
                    id: item.path,
                    name: item.name ? item.name : 'root',
                    fetched: true,
                    children: legacyItemsToTreeNodes(item.children)
                  };
                  rootNode = parent;
                  nodesLookup[item.path] = parent;
                  nodesLookup['root'] = parent;
                } else {
                  rootNode = nodesLookup['root'];
                  parent = nodesLookup[item.path];
                  parent.fetched = true;
                  parent.children = legacyItemsToTreeNodes(item.children);
                }

                parent.children.forEach((child) => {
                  nodesLookup[child.id] = child;
                });
              });
              rootNode && setTreeNodes({ ...rootNode });
            },
            error: (response) => {
              setError(response);
            }
          });
        }
      }
    }
  }, [currentPath, rootPath, site]);

  const onCreateFolder = () => {
    setCreateFolder(true);
  };

  const onCloseCreateFolder = () => {
    setCreateFolder(false);
  };

  const onFolderCreated = ({ path, name }: { path: string; name: string }) => {
    setCreateFolder(false);
    let id = `${path}/${name}`;
    nodesLookupRef.current[currentPath].children.push({
      id,
      name: name,
      children: []
    });
    nodesLookupRef.current[id] = {
      id,
      name: name,
      children: [],
      fetched: true
    };
    setCurrentPath(id);
    setTreeNodes({ ...treeNodes });
  };

  const onNodeToggle = (event: React.ChangeEvent<{}>, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const onNodeSelected = (event: React.ChangeEvent<{}>, nodeId: string) => {
    setCurrentPath(nodeId);
  };

  const onPathChanged = (path: string) => {
    setCurrentPath(path);
    setDirtyInput(false);
    setExpanded(rootPath === '/' ? ['/', ...getIndividualPaths(path)] : getIndividualPaths(path));
  };

  const onPathInputKeyPress = () => {
    setDirtyInput(true);
  };

  return (
    <PathSelectionDialogBodyUI
      title={title}
      showCreateFolderOption={showCreateFolderOption}
      onOk={onOk}
      error={error}
      onClose={onClose}
      expandedItemPaths={expanded}
      isInvalidPath={invalidPath}
      uncheckedInputValue={dirtyInput}
      isFetchingPath={isFetching}
      createFolderDialogOpen={createFolder}
      onCreateFolder={onCreateFolder}
      onCloseCreateFolder={onCloseCreateFolder}
      onFolderCreated={onFolderCreated}
      onNodeToggle={onNodeToggle}
      onNodeSelected={onNodeSelected}
      onPathChanged={onPathChanged}
      onPathInputKeyPress={onPathInputKeyPress}
      currentPath={currentPath}
      rootPath={rootPath}
      treeNodes={treeNodes}
    />
  );
}

export function PathSelectionDialogBodyUI(props: PathSelectionDialogBodyUIProps) {
  const {
    error,
    treeNodes,
    isInvalidPath,
    rootPath,
    currentPath = '',
    expandedItemPaths,
    isFetchingPath,
    showCreateFolderOption,
    uncheckedInputValue,
    createFolderDialogOpen,
    onOk,
    onClose,
    onPathInputKeyPress,
    onNodeToggle,
    onNodeSelected,
    onPathChanged,
    onCreateFolder,
    onCloseCreateFolder,
    onFolderCreated
  } = props;
  const classes = useStyles({});
  const title = usePossibleTranslation(props.title);
  const createFolderState = useSelection((state) => state.dialogs.createFolder);
  const resource = useLogicResource<TreeNode, { treeNodes: TreeNode; error?: ApiResponse }>(
    useMemo(() => ({ treeNodes, error }), [treeNodes, error]),
    {
      shouldResolve: ({ treeNodes }) => Boolean(treeNodes),
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: ({ treeNodes }, resource) => treeNodes === null && resource.complete,
      resultSelector: ({ treeNodes }) => treeNodes,
      errorSelector: ({ error }) => error
    }
  );
  const onWithPendingChangesCloseRequest = useWithPendingChangesCloseRequest(onCloseCreateFolder);

  return (
    <>
      <DialogHeader
        title={title ?? <FormattedMessage id="pathSelectionDialog.title" defaultMessage="Select Path" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody className={classes.dialogBody}>
        <Suspencified>
          <FolderBrowserTreeViewUI
            classes={{
              treeViewRoot: classes.treeViewRoot
            }}
            invalidPath={isInvalidPath}
            onNodeToggle={onNodeToggle}
            onNodeSelected={onNodeSelected}
            rootPath={rootPath}
            currentPath={currentPath}
            expanded={expandedItemPaths}
            selected={currentPath.replace(/\/$/, '')}
            resource={resource}
            onKeyPress={onPathInputKeyPress}
            onPathChanged={onPathChanged}
            isFetching={isFetchingPath}
          />
        </Suspencified>
      </DialogBody>
      <DialogFooter>
        {showCreateFolderOption && (
          <SecondaryButton
            disabled={isInvalidPath || isFetchingPath}
            onClick={onCreateFolder}
            className={classes.createFolderBtn}
          >
            <FormattedMessage id="pathSelectionDialog.createFolderButtonLabel" defaultMessage="Create Folder" />
          </SecondaryButton>
        )}
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton
          disabled={isInvalidPath || isFetchingPath || uncheckedInputValue}
          onClick={() => onOk({ path: currentPath })}
        >
          <FormattedMessage id="words.accept" defaultMessage="Accept" />
        </PrimaryButton>
      </DialogFooter>
      <CreateFolderDialog
        title={<FormattedMessage id="newFolder.title" defaultMessage="Create a New Folder" />}
        path={currentPath}
        isSubmitting={createFolderState.isSubmitting}
        hasPendingChanges={createFolderState.hasPendingChanges}
        isMinimized={createFolderState.isMinimized}
        onWithPendingChangesCloseRequest={onWithPendingChangesCloseRequest}
        open={createFolderDialogOpen}
        onClose={onCloseCreateFolder}
        onCreated={onFolderCreated}
      />
    </>
  );
}

export default PathSelectionDialog;
