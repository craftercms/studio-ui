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

import React from 'react';
import ToolPanel from './ToolPanel';
import { defineMessages } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { usePreviewGuest, useSelection } from '../../../utils/hooks';
import { ContentType } from '../../../models/ContentType';
import Page from '../../../components/Icons/Page';
import Union from '../../../components/Icons/Union';
import Component from '../../../components/Icons/Component';
import NodeSelector from '../../../components/Icons/NodeSelector';
import { LookupTable } from '../../../models/LookupTable';
import ContentInstance from '../../../models/ContentInstance';

const translations = defineMessages({
  contentTree: {
    id: 'craftercms.ice.contentTree.title',
    defaultMessage: 'Content Tree'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  root: {}
}));

interface RenderTree {
  id: string;
  name: string;
  children?: RenderTree[];
  type: string;
}

export default function ContentTree() {
  const classes = useStyles({});
  const guest = usePreviewGuest();
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const contentTypes = contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null;
  const [expanded, setExpanded] = React.useState<string[]>(['root']);
  var data = {
    id: null,
    name: null,
    children: [],
    type: null
  };

  if (guest?.modelId && guest?.models && contentTypes) {

    let parent = guest.models[guest.modelId];
    let contentType = contentTypes.find((contentType) => contentType.id === parent.craftercms.contentType);
    data.id = 'root';
    data.name = parent.craftercms.label;
    data.children = getChildren(parent, contentType, guest.models);
    data.type = contentType.type;
  }

  function getNodeSelectorChildren(array: ContentInstance, parentName: string, parentId) {
    return {
      id: `${array.craftercms.id}_${parentId}`,
      name: `${parentName}: ${array.craftercms.label}`,
      type: 'component'
    };
  }

  function getChildren(array: ContentInstance, contentType: ContentType, models: LookupTable<ContentInstance>) {
    let children = [];
    Object.keys(array).slice(1).forEach((key) => {
      const { type, name, id } = contentType.fields[key];
      let subChildren = [];
      if (type === 'node-selector' && array[key].length) {
        array[key].forEach((id) => {
          subChildren.push(getNodeSelectorChildren(models[id], name, id));
        });
      }
      children.push({
        id: `${array.craftercms.id}_${id}`,
        name,
        type,
        children: subChildren
      });
    });
    return children;
  }

  const renderTree = (nodes: RenderTree) => {
    let Icon = Union;
    if (nodes.type === 'page') {
      Icon = Page;
    } else if (nodes.type === 'node-selector') {
      Icon = NodeSelector;
    } else if (nodes.type === 'component') {
      Icon = Component;
    }
    const label = <div>
      <Icon/>
      {
        nodes.name
      }
    </div>;
    return (
      <TreeItem key={nodes.id} nodeId={nodes.id} label={label} icon={nodes.id === 'root' ? <Page/> : undefined}>
        {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
      </TreeItem>
    )
  };

  const handleChange = (event: React.ChangeEvent<{}>, nodes: string[]) => {
    setExpanded([...nodes, 'root']);
  };

  return (
    <ToolPanel title={translations.contentTree}>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ChevronRightIcon/>}
        expanded={expanded}
        onNodeToggle={handleChange}
      >
        {
          data.id &&
          renderTree(data)
        }
      </TreeView>
    </ToolPanel>
  );
}
