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

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import TreeView from '@material-ui/lab/TreeView';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftRounded';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import TreeItem from '@material-ui/lab/TreeItem';
import { useActiveSiteId, usePreviewGuest, useSelection, useStateResource } from '../../../utils/hooks';
import { ContentType, ContentTypeField } from '../../../models/ContentType';
import Page from '../../../components/Icons/Page';
import ContentTypeFieldIcon from '../../../components/Icons/ContentTypeField';
import Component from '../../../components/Icons/Component';
import NodeSelector from '../../../components/Icons/NodeSelector';
import { LookupTable } from '../../../models/LookupTable';
import ContentInstance from '../../../models/ContentInstance';
import RepeatGroup from '../../../components/Icons/RepeatGroup';
import { iconWithStrokeAndFill } from '../../../styles/icon';
import LoadingState from '../../../components/SystemStatus/LoadingState';
import { createLookupTable, reversePluckProps } from '../../../utils/object';
import { CONTENT_TREE_FIELD_SELECTED } from '../../../state/actions/preview';
import { DRAWER_WIDTH, getHostToGuestBus } from '../previewContext';
import ComponentMenu from '../../../components/ComponentMenu';
import Suspencified from '../../../components/SystemStatus/Suspencified';

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

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& > li > ul': {
        marginLeft: '0px'
      }
    }
  })
);

const treeItemStyles = makeStyles((theme) =>
  createStyles({
    icon: {
      ...iconWithStrokeAndFill
    },
    displayNone: {
      display: 'none'
    },
    treeItemIconContainer: {
      '& svg': {
        fontSize: '1.5rem'
      }
    },
    treeItemRoot: {
      '&:focus > .MuiTreeItem-content': {
        '& .MuiTreeItem-label': {
          backgroundColor: 'inherit'
        }
      }
    },
    treeItemContent: {
      'paddingLeft': '8px',
      '&.padded': {
        paddingLeft: '15px'
      }
    },
    treeItemGroup: {},
    treeItemExpanded: {},
    treeItemLabelRoot: {},
    treeItemLabel: {
      'display': 'flex',
      'alignItems': 'center',
      'height': '36px',
      '& p': {
        'marginTop': 0,
        'marginLeft': '5px',
        'overflow': 'hidden',
        'display': '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        'marginBottom': 0,
        'wordBreak': 'break-all'
      }
    },
    options: {
      marginLeft: 'auto',
      padding: '6px'
    }
  })
);

interface RenderTree {
  id: string;
  name: string;
  children: RenderTree[];
  type: string;
  modelId?: string;
  parentId?: string;
  embeddedParentPath?: string;
  fieldId?: string;
  index?: string | number;
}

interface Data {
  selected: string;
  previous: Array<string>;
  lookupTable: LookupTable<RenderTree>;
  error: string;
}

function getNodeSelectorChildren(
  model: ContentInstance,
  parentModelId: string,
  path: string,
  itemContentTypeName: string,
  fieldId: string,
  index: number | string
) {
  return {
    id: `${parentModelId}_${fieldId}_${index}`,
    name: `${itemContentTypeName}: ${model.craftercms.label}`,
    type: 'component',
    modelId: `${model.craftercms.id}`,
    parentId: parentModelId,
    embeddedParentPath: path || null,
    fieldId,
    index
  };
}

function getRepeatGroupChildren(
  item: LookupTable<any>,
  contentTypeField: ContentTypeField,
  contentTypes: LookupTable<ContentType>,
  parentTreeItemId: string,
  model: ContentInstance,
  models: LookupTable<ContentInstance>,
  index: number
) {
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
          getNodeSelectorChildren(
            models[id],
            model.craftercms.id,
            models[id].craftercms.path ? null : model.craftercms.path,
            itemContentTypeName,
            fieldId,
            `${index}.${i}`
          )
        );
      });
    }
    children.push({
      id: `${parentTreeItemId}_${fieldName}`,
      name,
      type,
      children: subChildren,
      modelId: model.craftercms.id,
      fieldId,
      index
    });
  });
  return children;
}

function getChildren(
  model: ContentInstance,
  contentType: ContentType,
  models: LookupTable<ContentInstance>,
  contentTypes: LookupTable<ContentType>
) {
  let children = [];
  Object.keys(model).forEach((fieldName) => {
    if (fieldName === 'craftercms') return;
    const { type, name } = contentType.fields[fieldName];
    let subChildren = [];
    if (type === 'node-selector') {
      model[fieldName].forEach((id: string, i: number) => {
        let itemContentTypeName = contentTypes[models[id].craftercms.contentType].name;
        subChildren.push(
          getNodeSelectorChildren(
            models[id],
            model.craftercms.id,
            models[id].craftercms.path ? null : model.craftercms.path,
            itemContentTypeName,
            fieldName,
            i
          )
        );
      });
    } else if (type === 'repeat') {
      model[fieldName].forEach((item, index: number) => {
        let id = `${model.craftercms.id}_${fieldName}_${index}`;
        subChildren.push({
          id,
          name: `Item ${index + 1}`,
          type: 'item',
          children: getRepeatGroupChildren(
            item,
            contentType.fields[fieldName],
            contentTypes,
            id,
            model,
            models,
            index
          ),
          modelId: model.craftercms.id,
          fieldId: `${fieldName}`,
          index
        });
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

interface TreeItemCustomInterface {
  nodes: any;

  handleScroll?(node: RenderTree): void;

  handlePrevious?(e: any): void;

  handleClick?(node: RenderTree): void;

  handleOptions?(e: any, modelId: string, parentId: string, embeddedParentPath: string): void;
}

function TreeItemCustom(props: TreeItemCustomInterface) {
  const { nodes: resource, handleScroll, handlePrevious, handleClick, handleOptions } = props;
  const classes = treeItemStyles({});
  const [over, setOver] = useState(false);
  let timeout = React.useRef<any>();
  const nodesResource = !resource.read ? resource : resource.read();
  const nodes = !nodesResource.selected ? nodesResource : nodesResource.lookupTable[nodesResource.selected];

  let Icon;
  if (nodes.type === 'page') {
    Icon = Page;
  } else if (nodes.type === 'node-selector') {
    Icon = NodeSelector;
  } else if (nodes.type === 'component') {
    Icon = Component;
  } else if (nodes.type === 'repeat') {
    Icon = RepeatGroup;
  } else {
    Icon = ContentTypeFieldIcon;
  }

  function setOverState(e: React.MouseEvent, isOver: boolean) {
    e.stopPropagation();
    clearTimeout(timeout.current);
    if (!isOver) {
      timeout.current = setTimeout(() => {
        setOver(false);
      }, 10);
    } else {
      setOver(isOver);
    }
  }

  return (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      onMouseOver={(e) => setOverState(e, true)}
      onMouseOut={(e) => setOverState(e, false)}
      icon={nodes.type === 'component' && <ChevronRightIcon onClick={() => handleClick(nodes)} />}
      label={
        <div className={classes.treeItemLabel} onClick={() => handleScroll(nodes)}>
          {nodes.id === 'root' && handlePrevious ? (
            <ChevronLeftIcon onClick={(e) => handlePrevious(e)} />
          ) : (
            <Icon className={classes.icon} />
          )}
          <p>{nodes.name}</p>
          {over && (nodes.type === 'component' || nodes.id === 'root') && (
            <IconButton
              className={classes.options}
              onMouseOver={(e) => setOverState(e, true)}
              onClick={(e) =>
                handleOptions(e, nodes.modelId, nodes.parentId, nodes.embeddedParentPath)
              }
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </div>
      }
      classes={{
        root: classes.treeItemRoot,
        label: classes.treeItemLabelRoot,
        content: clsx(
          classes.treeItemContent,
          !nodes.children?.length && nodes.type === 'component' && 'padded'
        ),
        expanded: classes.treeItemExpanded,
        group: classes.treeItemGroup,
        iconContainer: nodes.id === 'root' ? classes.displayNone : classes.treeItemIconContainer
      }}
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => (
            <TreeItemCustom key={node.id} nodes={node} {...reversePluckProps(props, 'nodes')} />
          ))
        : null}
    </TreeItem>
  );
}

export default function ContentTree() {
  const classes = useStyles({});
  const guest = usePreviewGuest();
  const { formatMessage } = useIntl();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const hostToGuest$ = getHostToGuestBus();
  const [expanded, setExpanded] = React.useState<string[]>(['root']);
  const site = useActiveSiteId();
  const [optionsMenu, setOptionsMenu] = React.useState({
    modelId: null,
    parentId: null,
    embeddedParentPath: null,
    anchorEl: null
  });
  const [data, setData] = React.useState<Data>({
    previous: [],
    selected: null,
    lookupTable: null,
    error: null
  });

  useEffect(() => {
    if (guest?.modelId && guest.models && contentTypesBranch.byId && data.selected === null) {
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
        lookupTable: createLookupTable<RenderTree>([data], 'modelId'),
        error: null
      });
    }
  }, [contentTypesBranch, data.selected, guest]);

  const handleClick = (node: RenderTree) => {
    if (node.type === 'component' && node.id !== 'root') {
      let model = guest.models[node.modelId];
      let contentType = contentTypesBranch.byId[model.craftercms.contentType];
      const { type, modelId, name, index, fieldId, parentId, embeddedParentPath } = node;
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
            parentId,
            embeddedParentPath
          }
        },
        error: null
      });
      setExpanded(['root']);
    }
    return;
  };

  const handleScroll = (node: RenderTree) => {
    hostToGuest$.next({
      type: CONTENT_TREE_FIELD_SELECTED,
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
    if (
      event.target.classList.contains('toggle') ||
      event.target.parentElement.classList.contains('toggle')
    ) {
      setExpanded([...nodes, 'root']);
    }
  };

  const handleOptions = (
    event: any,
    modelId: string,
    parentId: string,
    embeddedParentPath: string
  ) => {
    event.stopPropagation();
    setOptionsMenu({
      ...optionsMenu,
      modelId,
      parentId,
      embeddedParentPath,
      anchorEl: event.currentTarget.parentElement
    });
  };

  const handleClose = () => {
    setOptionsMenu({ ...optionsMenu, anchorEl: null });
  };

  const resource = useStateResource<Data, Data>(data, {
    shouldResolve: (source) => !source.error && !!source.selected,
    shouldReject: (source) => !!source.error,
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => source,
    errorSelector: (source) => source.error
  });

  return (
    <ToolPanel title={translations.contentTree}>
      {data.selected === null && <LoadingState title={formatMessage(translations.loading)} />}
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon className="toggle" />}
        defaultExpandIcon={<ChevronRightIcon className="toggle" />}
        disableSelection
        expanded={expanded}
        onNodeToggle={handleChange}
      >
        {data.selected && (
          <>
            <Suspencified
              resource={resource}
              loadingStateProps={{
                title: 'Loading'
              }}
              children={
                <TreeItemCustom
                  nodes={resource}
                  handleScroll={handleScroll}
                  handlePrevious={data.previous.length ? handlePrevious : null}
                  handleClick={handleClick}
                  handleOptions={handleOptions}
                />
              }
            />
            <ComponentMenu
              anchorEl={optionsMenu.anchorEl}
              handleClose={handleClose}
              site={site}
              modelId={optionsMenu.modelId}
              parentId={optionsMenu.parentId}
              embeddedParentPath={optionsMenu.embeddedParentPath}
              anchorOrigin={{
                vertical: 'top',
                horizontal: DRAWER_WIDTH - 60
              }}
            />
          </>
        )}
      </TreeView>
    </ToolPanel>
  );
}
