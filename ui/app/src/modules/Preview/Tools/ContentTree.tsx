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

import React, { useEffect } from 'react';
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
import { ContentType, ContentTypeField } from '../../../models/ContentType';
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

function getNodeSelectorChildren(model: ContentInstance, parentModelId: string, itemContentTypeName: string, fieldId: string, index: number | string) {
  return {
    id: `${parentModelId}_${fieldId}_${index}`,
    name: `${itemContentTypeName}: ${model.craftercms.label}`,
    type: 'component',
    modelId: `${model.craftercms.id}`,
    parentId: parentModelId,
    fieldId,
    index
  };
}

function getRepeatGroupChildren(item: LookupTable<any>, contentTypeField: ContentTypeField, contentTypes: LookupTable<ContentType>, parentTreeItemId: string, modelId: string, models: LookupTable<ContentInstance>, index: number) {
  let children = [];
  Object.keys(item).forEach((fieldName) => {
    let subChildren = [];
    let fieldId = fieldName;
    const { type, name } = contentTypeField.fields[fieldName];
    if (type === 'node-selector') {
      fieldId = `${contentTypeField.id}.${fieldName}`;
      item[fieldName].forEach((id: string, i: number) => {
        let itemContentTypeName = contentTypes[models[id].craftercms.contentType].name;
        subChildren.push(
          getNodeSelectorChildren(models[id], modelId, itemContentTypeName, fieldId, `${index}.${i}`)
        );
      });
    }
    children.push({
      id: `${parentTreeItemId}_${fieldName}`,
      name,
      type,
      children: subChildren,
      modelId: modelId,
      fieldId,
      index
    })
  });
  return children;
}

function getChildren(model: ContentInstance, contentType: ContentType, models: LookupTable<ContentInstance>, contentTypes: LookupTable<ContentType>) {
  let children = [];
  Object.keys(model).forEach((fieldName) => {
    if (fieldName === 'craftercms')
      return;
    const { type, name } = contentType.fields[fieldName];
    let subChildren = [];
    if (type === 'node-selector') {
      model[fieldName].forEach((id: string, i: number) => {
        let itemContentTypeName = contentTypes[models[id].craftercms.contentType].name;
        subChildren.push(
          getNodeSelectorChildren(models[id], model.craftercms.id, itemContentTypeName, fieldName, i)
        );
      });
    } else if (type === 'repeat') {
      model[fieldName].forEach((item, index: number) => {
        let id = `${model.craftercms.id}_${fieldName}_${index}`;
        subChildren.push({
          id,
          name: `Item ${index + 1}`,
          type: 'item',
          children: getRepeatGroupChildren(item, contentType.fields[fieldName], contentTypes, id, model.craftercms.id, models, index),
          modelId: model.craftercms.id,
          fieldId: `${fieldName}`,
          index
        })
      });
    }
    children.push({
      id: `${model.craftercms.id}_${fieldName}`,
      name,
      type,
      children: subChildren,
      modelId: model.craftercms.id,
      fieldId: fieldName
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
  const [expanded, setExpanded] = React.useState<string[]>(['root']);
  const [data, setData] = React.useState<Data>({
    previous: [],
    selected: null,
    lookupTable: null
  });

  useEffect(() => {
    if (guest?.modelId && guest?.models && contentTypesBranch.byId && data.selected === null) {
      let parent = guest.models[guest.modelId];
      let contentType = contentTypesBranch.byId[parent.craftercms.contentType];
      let data: RenderTree = {
        id: 'root',
        name: parent.craftercms.label,
        children: getChildren(parent, contentType, guest.models, contentTypesBranch.byId),
        type: contentType.type,
        modelId: parent.craftercms.id
      };
      setData({
        previous: [],
        selected: parent.craftercms.id,
        lookupTable: createLookupTable<RenderTree>([data], 'modelId')
      });
    }
  }, [contentTypesBranch, data.selected, guest]);


  const handleClick = (node: RenderTree) => {
    if (node.type === 'component' && node.id !== 'root') {
      let model = guest.models[node.modelId];
      let contentType = contentTypesBranch.byId[model.craftercms.contentType];
      const { type, modelId, name, index, fieldId, parentId } = node;
      setData({
        previous: [...data.previous, data.selected],
        selected: model.craftercms.id,
        lookupTable: {
          ...data.lookupTable,
          [model.craftercms.id]: {
            id: 'root',
            name,
            children: getChildren(model, contentType, guest.models, contentTypesBranch.byId),
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
