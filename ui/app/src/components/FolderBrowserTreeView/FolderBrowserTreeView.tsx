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

// @ts-ignore - React typings haven't been updated to include react 18 hooks
import React, { useEffect, useId } from 'react';
import useActiveSite from '../../hooks/useActiveSite';
import { PathNavigatorTree } from '../PathNavigatorTree';
import { makeStyles } from 'tss-react/mui';
import { removeStoredPathNavigatorTree } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';
import { useDispatch } from 'react-redux';
import { pathNavigatorTreeFetchPathChildren } from '../../state/actions/pathNavigatorTree';
import { getIndividualPaths, withIndex } from '../../utils/path';
import { checkPathExistence } from '../../services/content';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { batchActions } from '../../state/actions/misc';

export interface FolderBrowserTreeViewProps {
  rootPath: string;
  selectedPath: string;
  onPathSelected(path: string): void;
}

const useStyles = makeStyles()(() => ({
  pathNavTreeHeader: {
    display: 'none'
  }
}));

export function FolderBrowserTreeView(props: FolderBrowserTreeViewProps) {
  const { rootPath, selectedPath, onPathSelected } = props;
  const { classes } = useStyles();
  const id = useId();
  const { uuid, id: siteId } = useActiveSite();
  const { username } = useActiveUser();
  const dispatch = useDispatch();
  useEffect(() => {
    const path = selectedPath || rootPath;
    // If it's `/site/website/*`, there's possibility of `index.xml` behaviours
    if (path.startsWith('/site/website')) {
      const paths = getIndividualPaths(path, rootPath);
      forkJoin(
        paths.map((p) => {
          const withIndexXml = withIndex(p);
          return checkPathExistence(siteId, withIndexXml).pipe(
            map((exists) =>
              exists
                ? pathNavigatorTreeFetchPathChildren({ id, path: withIndexXml, expand: true })
                : pathNavigatorTreeFetchPathChildren({ id, path: p, expand: true })
            )
          );
        })
      ).subscribe((actions) => {
        dispatch(actions.length === 1 ? actions[0] : batchActions(actions));
      });
    } else {
      const actions = getIndividualPaths(path, rootPath).map((p) =>
        pathNavigatorTreeFetchPathChildren({ id, path: p, expand: true })
      );
      dispatch(actions.length === 1 ? actions[0] : batchActions(actions));
    }
  }, [dispatch, id, rootPath, selectedPath, siteId]);
  useEffect(() => {
    return () => {
      removeStoredPathNavigatorTree(uuid, username, id);
    };
  }, [id, uuid, username]);
  return (
    <PathNavigatorTree
      id={id}
      label=""
      rootPath={rootPath}
      initialCollapsed={false}
      initialSystemTypes={['folder', 'page']}
      active={{ [selectedPath]: true }}
      onNodeClick={(e, path) => onPathSelected?.(path)}
      classes={{ header: classes.pathNavTreeHeader }}
      showNavigableAsLinks={false}
      showPublishingTarget={false}
      showWorkflowState={false}
      showItemMenu={false}
    />
  );
}

export default FolderBrowserTreeView;
