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

import React, { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import { createStyles, makeStyles } from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftRounded from '@material-ui/icons/ChevronLeftRounded';
import TreeItem from '@material-ui/lab/TreeItem';
import { usePreviewGuest, useSelection } from '../../../utils/hooks';
import { ContentType } from '../../../models/ContentType';
import Page from '../../../components/Icons/Page';
import Field from '../../../components/Icons/Field';
import Component from '../../../components/Icons/Component';
import NodeSelector from '../../../components/Icons/NodeSelector';
import { LookupTable } from '../../../models/LookupTable';
import ContentInstance from '../../../models/ContentInstance';
import Repeat from '../../../components/Icons/Repeat';
import iconStyles from '../../../styles/icon';
import LoadingState from '../../../components/SystemStatus/LoadingState';
import { createLookupTable } from '../../../utils/object';
import { SCROLL_TO_ELEMENT } from '../../../state/actions/preview';
import { getHostToGuestBus } from '../previewContext';

const translations = defineMessages({
  contentTree: {
    id: 'craftercms.ice.contentTree.title',
    defaultMessage: 'Content Tree'
  },
  loading: {
    id: 'craftercms.ice.contentTree.loading',
    defaultMessage: 'Loading'
  }
});

const useStyles = makeStyles((theme) => createStyles({
  root: {
    '& > li > ul': {
      marginLeft: '0px'
    }
  },
  icon: {
    ...iconStyles
  },
  treeItemIconContainer: {
    display: 'none'
  },
  treeItemRoot: {
    '&:focus > .MuiTreeItem-content': {
      background: 'none'
    },
    '&:hover > .MuiTreeItem-content': {
      background: 'none'
    }
  },
  treeItemContent: {
    padding: '6px 8px',
    '&.padded': {
      paddingLeft: '34px'
    }
  },
  treeItemGroup: {
    //marginLeft: '12px'
  },
  treeItemExpanded: {},
  treeItemLabel: {
    display: 'flex',
    '& p': {
      marginTop: 0,
      marginLeft: '5px',
      overflow: 'hidden',
      'display': '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
      marginBottom: 0,
      wordBreak: 'break-all'
    }
  }
}));

interface RenderTree {
  id: string;
  name: string;
  children: RenderTree[];
  type: string;
  modelId?: string;
  parentId?: string;
  fieldId?: string;
  index?: string | number;
}

interface Data {
  selected: string;
  previous: Array<string>;
  lookupTable: LookupTable<RenderTree>
}

function getNodeSelectorChildren(array: ContentInstance, modelId: string, parentName: string, fieldId: string, index: string | number) {
  return {
    id: `${modelId}_${fieldId}_${index}`,
    name: `${parentName}: ${array.craftercms.label}`,
    type: 'component',
    modelId: `${array.craftercms.id}`,
    parentId: modelId,
    fieldId,
    index
  };
}

function getChildren(array: ContentInstance, contentType: any, models: LookupTable<ContentInstance>, contentTypes: ContentType[], modelId?: string) {
  let children = [];
  Object.keys(array).forEach((key) => {
    if (key === 'craftercms') return;
    const { type, name } = contentType.fields[key];
    let subChildren = [];
    if (type === 'node-selector' && array[key].length) {
      array[key].forEach((id: string, i: number) => {
        let parentName = contentTypes.find((contentType) => contentType.id === models[id].craftercms.contentType).name;
        subChildren.push(getNodeSelectorChildren(models[id], modelId || array.craftercms.id, parentName, key, i));
      });
    } else if (type === 'repeat') {
      array[key].forEach((item, index: number) => {
        subChildren.push({
          id: `${modelId || array.craftercms.id}_${key}_${index}`,
          name: 'Item',
          type: 'item',
          children: getChildren(item, contentType.fields[key], models, contentTypes, array.craftercms.id),
          modelId: modelId || array.craftercms.id,
          fieldId: `${key}.${index}`,
          index
        })
      });
    }
    children.push({
      id: `${modelId || array.craftercms.id}_${key}`,
      name,
      type,
      children: subChildren,
      modelId: modelId || array.craftercms.id,
      fieldId: key
    });
  });
  return children;
}

export default function ContentTree() {
  const classes = useStyles({});
  const guest = usePreviewGuest();
  const { formatMessage } = useIntl();
  const contentTypesBranch = useSelection(state => state.contentTypes);
  const hostToGuest$ = getHostToGuestBus();
  const contentTypes = useMemo(
    () => contentTypesBranch.byId ? Object.values(contentTypesBranch.byId) : null,
    [contentTypesBranch.byId]
  );
  const [expanded, setExpanded] = React.useState<string[]>(['root']);
  const [data, setData] = React.useState<Data>({
    previous: [],
    selected: null,
    lookupTable: null
  });

  useEffect(() => {
    if (guest?.modelId && guest?.models && contentTypes && data.selected === null) {
      let parent = guest.models[guest.modelId];
      let contentType = contentTypes.find((contentType) => contentType.id === parent.craftercms.contentType);
      let data: RenderTree = {
        id: 'root',
        name: parent.craftercms.label,
        children: getChildren(parent, contentType, guest.models, contentTypes),
        type: contentType.type,
        modelId: parent.craftercms.id
      };
      setData({
        previous: [],
        selected: parent.craftercms.id,
        lookupTable: createLookupTable<RenderTree>([data], 'modelId')
      });
    }
  }, [contentTypes, data.selected, guest]);


  const handleClick = (node: RenderTree) => {
    if (node.type === 'component' && node.id !== 'root') {
      let model = guest.models[node.modelId];
      let contentType = contentTypes.find((contentType) => contentType.id === model.craftercms.contentType);
      const { type, modelId, name, index, fieldId, parentId } = node;
      setData({
        previous: [...data.previous, data.selected],
        selected: model.craftercms.id,
        lookupTable: {
          ...data.lookupTable,
          [model.craftercms.id]: {
            id: 'root',
            name,
            children: getChildren(model, contentType, guest.models, contentTypes),
            type,
            modelId,
            index,
            fieldId,
            parentId
          }
        }
      });
      setExpanded(['root']);
    }
    return;
  };

  const handleScroll = (node: RenderTree) => {
    hostToGuest$.next({
      type: SCROLL_TO_ELEMENT,
      payload: node
    });
    return;
  };

  const handlePrevious = (event: React.ChangeEvent<{}>) => {
    event.stopPropagation();
    let previousArray = [...data.previous];
    let previous = previousArray.pop();
    setData({ ...data, selected: previous, previous: previousArray });
  };

  const handleChange = (event: any, nodes: string[]) => {
    if (event.target.classList.contains('toggle') || event.target.parentElement.classList.contains('toggle')) {
      setExpanded([...nodes, 'root']);
    }
  };

  const renderTree = (nodes: RenderTree) => {
    let Icon;
    if (nodes.type === 'page') {
      Icon = Page;
    } else if (nodes.type === 'node-selector') {
      Icon = NodeSelector;
    } else if (nodes.type === 'component') {
      Icon = Component;
    } else if (nodes.type === 'repeat') {
      Icon = Repeat;
    } else {
      Icon = Field;
    }

    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id}
        label={
          <div className={classes.treeItemLabel} onClick={() => handleScroll(nodes)}>
            {
              (nodes.id === 'root' && data.previous.length) ? (
                <ChevronLeftRounded onClick={(e) => handlePrevious(e)}/>
              ) : (
                <>
                  {(nodes.type === 'component') && <ChevronRightIcon onClick={() => handleClick(nodes)}/>}
                  <Icon className={classes.icon}/>
                </>
              )
            }
            <p>{nodes.name}</p>
          </div>
        }
        classes={{
          root: classes.treeItemRoot,
          content: clsx(classes.treeItemContent, (!nodes.children?.length && nodes.type !== 'component') && 'padded'),
          expanded: classes.treeItemExpanded,
          group: classes.treeItemGroup,
          iconContainer: nodes.id === 'root' ? classes.treeItemIconContainer : ''
        }}
      >
        {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
      </TreeItem>
    )
  };

  return (
    <ToolPanel title={translations.contentTree}>
      {
        data.selected === null &&
        <LoadingState
          title={formatMessage(translations.loading)}
          graphicProps={{ width: 150 }}
        />
      }
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon className='toggle'/>}
        defaultExpandIcon={<ChevronRightIcon className='toggle'/>}
        expanded={expanded}
        onNodeToggle={handleChange}
      >
        {
          data.selected &&
          renderTree(data.lookupTable[data.selected])
        }
      </TreeView>
    </ToolPanel>
  );
}
