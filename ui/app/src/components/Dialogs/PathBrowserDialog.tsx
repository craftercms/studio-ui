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

import DialogHeader from './DialogHeader';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import Button from '@material-ui/core/Button';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import { useActiveSiteId, useUnmount } from '../../utils/hooks';
import FolderBrowserTreeView, {
  legacyItemsToTreeNodes,
  TreeNode
} from '../Navigation/FolderBrowserTreeView';
import makeStyles from '@material-ui/styles/makeStyles';
import createStyles from '@material-ui/styles/createStyles';
import CreateNewFolderDialog from './CreateNewFolderDialog';
import { get } from '../../utils/ajax';
import LookupTable from '../../models/LookupTable';

const messages = defineMessages({
  ok: {
    id: 'words.accept',
    defaultMessage: 'Accept'
  },
  cancel: {
    id: 'words.cancel',
    defaultMessage: 'Cancel'
  },
  create: {
    id: 'path.browser.create',
    defaultMessage: 'Create Folder'
  }
});

const useStyles = makeStyles(() => createStyles({
  createFolderBtn: {
    marginRight: 'auto'
  },
  treeViewRoot: {
    marginTop: '15px'
  }
}));

interface PathBrowserDialogProps {
  open: boolean;
  rootPath: string;
  defaultExpanded: string[];
  onClose(): void;
  onClosed?(): void;
  onOk(selectedPath: string): void;
}

export default function PathBrowserDialog(props: PathBrowserDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      maxWidth='sm'
    >
      <PathBrowserDialogWrapper {...props} />
    </Dialog>
  );
}

function PathBrowserDialogWrapper(props: PathBrowserDialogProps) {
  const { onClosed, onClose, onOk, defaultExpanded, rootPath } = props;
  const classes = useStyles({});
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();
  const [currentPath, setCurrentPath] = useState(rootPath);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [treeNodes, setTreeNodes] = useState(null);
  const [createFolder, setCreateFolder] = useState(false);
  const nodesLookupRef = useRef<LookupTable<TreeNode>>({});
  useUnmount(onClosed);

  useEffect(() => {
    let nodesLookup = nodesLookupRef.current;
    if (currentPath && !nodesLookup[currentPath]?.fetched) {
      get(
        `/studio/api/1/services/api/1/content/get-items-tree.json?site=${site}&path=${currentPath}&depth=1&order=default`
      ).subscribe(({ response: { item } }) => {
        let rootNode;
        let parent;

        if (!nodesLookup['root']) {
          parent = {
            id: item.path,
            name: item.name,
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

        setTreeNodes({ ...rootNode });
      });
    }
  }, [currentPath, site]);

  const onCreateFolder = () => {
    setCreateFolder(true);
  };

  const onCloseCreateFolder = () => {
    setCreateFolder(false);
  };

  const onFolderCreated = (path: string, name: string, rename: boolean) => {
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

  return (
    <>
      <DialogHeader title="Select Path" onDismiss={onClose} />
      <DialogBody>
        <FolderBrowserTreeView
          classes={{
            treeViewRoot: classes.treeViewRoot
          }}
          onNodeToggle={onNodeToggle}
          onNodeSelected={onNodeSelected}
          rootPath={rootPath}
          currentPath={currentPath}
          expanded={expanded}
          selected={currentPath}
          treeNodes={treeNodes}
          defaultExpanded={defaultExpanded}
        />
      </DialogBody>
      <DialogFooter>
        <Button onClick={onCreateFolder} variant="outlined" className={classes.createFolderBtn}>
          {formatMessage(messages.create)}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {formatMessage(messages.cancel)}
        </Button>
        <Button onClick={() => onOk(currentPath)} variant="contained" color="primary">
          {formatMessage(messages.ok)}
        </Button>
      </DialogFooter>
      <CreateNewFolderDialog
        path={currentPath}
        open={createFolder}
        onClose={onCloseCreateFolder}
        onCreated={onFolderCreated}
      />
    </>
  );
}

