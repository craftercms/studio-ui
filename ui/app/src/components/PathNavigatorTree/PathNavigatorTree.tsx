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

import React from 'react';
import PathNavigatorTreeUI from './PathNavigatorTreeUI';
import { useLogicResource, useMount, useSelection } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { pathNavigatorTreeInit } from '../../state/actions/pathNavigatorTree';
import { StateStylingProps } from '../../models/UiConfig';

interface PathNavigatorTreeProps {
  id: string;
  label: string;
  rootPath: string;
  excludes?: string[];
  limit?: number;
  icon?: Partial<StateStylingProps>;
  container?: Partial<StateStylingProps>;
}

export interface PathNavigatorTreeStateProps {
  rootPath: string;
  hasClipboard: boolean;
  levelDescriptor: string;
  collapsed: boolean;
  limit: number;
  data: any;
  isFetching: null;
}

export default function PathNavigatorTree(props: PathNavigatorTreeProps) {
  const { label, id = props.label.replace(/\s/g, ''), rootPath: path, excludes, limit, icon, container } = props;
  const state = useSelection((state) => state.pathNavigatorTree)[id];
  const dispatch = useDispatch();
  useMount(() => {
    dispatch(
      pathNavigatorTreeInit({
        id,
        path,
        excludes,
        limit
      })
    );
  });

  const resource = useLogicResource<any, PathNavigatorTreeStateProps>(state, {
    shouldResolve: (source) => source && source.isFetching === false,
    shouldReject: (source) => false,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => null
  });

  return <PathNavigatorTreeUI title={label} icon={icon} container={container} resource={resource} />;
}
