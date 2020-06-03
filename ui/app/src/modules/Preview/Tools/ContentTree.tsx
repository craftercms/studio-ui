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

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import createStyles from '@material-ui/core/styles/createStyles';
import TreeView from '@material-ui/lab/TreeView';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import TreeItem from '@material-ui/lab/TreeItem';
import {
  useActiveSiteId,
  useLogicResource,
  usePreviewGuest,
  useSelection
} from '../../../utils/hooks';
import { ContentType, ContentTypeField } from '../../../models/ContentType';
import Page from '../../../components/Icons/Page';
import ContentTypeFieldIcon from '../../../components/Icons/ContentTypeField';
import Component from '../../../components/Icons/Component';
import NodeSelector from '../../../components/Icons/NodeSelector';
import { LookupTable } from '../../../models/LookupTable';
import ContentInstance from '../../../models/ContentInstance';
import RepeatGroup from '../../../components/Icons/RepeatGroup';
import { iconWithStrokeAndFill } from '../../../styles/icon';
import { hierarchicalToLookupTable } from '../../../utils/object';
import {
  CONTENT_TREE_FIELD_SELECTED,
  SORT_ITEM_OPERATION_COMPLETE
} from '../../../state/actions/preview';
import { DRAWER_WIDTH, getHostToGuestBus, getHostToHostBus } from '../previewContext';
import ComponentMenu from '../../../components/ComponentMenu';
import Suspencified from '../../../components/SystemStatus/Suspencified';
import { Resource } from '../../../models/Resource';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import NavigateNextIcon from '@material-ui/icons/NavigateNextRounded';
import Typography from '@material-ui/core/Typography';
import palette from '../../../styles/palette';
import Link from '@material-ui/core/Link';
import { useDispatch } from 'react-redux';
import { createBackHandler } from './EditFormPanel';

const rootPrefix = '{root}_';

const translations = defineMessages({
  contentTree: {
    id: 'previewContentTreeTool.title',
    defaultMessage: 'Content Tree'
  },
  loading: {
    id: 'previewContentTreeTool.loading',
    defaultMessage: 'Loading'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& > li > ul': {
        marginLeft: '0px'
      }
    },
    breadcrumbs: {
      display: 'flex',
      alignItems: 'center'
    },
    breadcrumbsList: {
      display: 'flex',
      alignItems: 'center',
      padding: '9px 6px 0px 6px',
      '& li': {
        lineHeight: 1
      }
    },
    breadcrumbsSeparator: {
      margin: '0 2px'
    },
    breadcrumbsTypography: {
      fontWeight: 'bold',
      color: palette.gray.medium4
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
        },
        '& .MuiTreeItem-label:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }
    },
    treeItemContent: {
      paddingLeft: '8px',
      '&.padded': {
        paddingLeft: '15px'
      },
      '&.root': {
        paddingLeft: 0
      }
    },
    treeItemGroup: {},
    treeItemExpanded: {},
    treeItemSelected: {},
    treeItemLabelRoot: {},
    treeItemLabel: {
      display: 'flex',
      alignItems: 'center',
      height: '36px',
      '& p': {
        marginTop: 0,
        marginLeft: '5px',
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        marginBottom: 0,
        wordBreak: 'break-all'
      }
    },
    options: {
      marginLeft: 'auto',
      padding: '6px'
    }
  })
);

export interface RenderTree {
  id: string;
  name: string;
  children: RenderTree[];
  type: string;
  modelId?: string;
  parentId?: string;
  embeddedParentPath?: string;
  fieldId?: string;
  index?: string | number;
  rootPath?: boolean;
}

interface Data {
  selected: string;
  nodeLookup: LookupTable<RenderTree>;
  expanded: Array<string>;
  breadcrumbs?: Array<string>;
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
        let itemContentTypeName = contentTypes[models[id].craftercms.contentTypeId].name;
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
    const contentTypeField = getContentTypeField(contentType, fieldName, contentTypes);
    if (!contentTypeField) return;
    const { type, name } = getContentTypeField(contentType, fieldName, contentTypes);
    let subChildren = [];
    if (type === 'node-selector') {
      model[fieldName].forEach((id: string, i: number) => {
        let itemContentTypeName = contentTypes[models[id].craftercms.contentTypeId].name;
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

function getContentTypeField(
  contentType: ContentType,
  fieldName: string,
  contentTypes: LookupTable<ContentType>
): ContentTypeField {
  return (
    contentType.fields[fieldName] ??
    contentTypes['/component/level-descriptor'].fields[fieldName] ??
    null
  );
}

interface TreeItemCustomInterface {
  resource: Resource<Data>;
  nodeId?: string;

  handleScroll?(node: RenderTree): void;

  handleClick?(node: RenderTree): void;

  handleOptions?(e: any, modelId: string, parentId: string, embeddedParentPath: string): void;
}

function TreeItemCustom(props: TreeItemCustomInterface) {
  const { resource, nodeId, handleScroll, handleClick, handleOptions } = props;
  const classes = treeItemStyles({});
  const [over, setOver] = useState(false);
  let timeout = React.useRef<any>();
  const node = resource.read().nodeLookup[nodeId];
  const isMounted = useRef(null);
  let Icon;

  useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  if (!node) {
    return null;
  } else {
    if (node.type === 'page') {
      Icon = Page;
    } else if (node.type === 'node-selector') {
      Icon = NodeSelector;
    } else if (node.type === 'component') {
      Icon = Component;
    } else if (node.type === 'repeat') {
      Icon = RepeatGroup;
    } else {
      Icon = ContentTypeFieldIcon;
    }
  }

  function setOverState(e: React.MouseEvent, isOver: boolean) {
    e.stopPropagation();
    clearTimeout(timeout.current);
    if (!isOver) {
      timeout.current = setTimeout(() => {
        isMounted.current && setOver(false);
      }, 10);
    } else {
      isMounted.current && setOver(isOver);
    }
  }

  return (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      onMouseOver={(e) => setOverState(e, true)}
      onMouseOut={(e) => setOverState(e, false)}
      icon={node.type === 'component' && <ChevronRightIcon onClick={() => handleClick(node)} />}
      label={
        <div className={classes.treeItemLabel} onClick={() => handleScroll(node)}>
          <Icon className={classes.icon} />
          <p>{node.name}</p>
          {over && (node.type === 'component' || node.id.includes(rootPrefix)) && (
            <IconButton
              className={classes.options}
              onMouseOver={(e) => setOverState(e, true)}
              onClick={(e) =>
                handleOptions(e, node.modelId, node.parentId, node.embeddedParentPath)
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
          !node.children?.length && node.type === 'component' && 'padded',
          node.id.includes(rootPrefix) && 'root'
        ),
        expanded: classes.treeItemExpanded,
        selected: classes.treeItemSelected,
        group: classes.treeItemGroup,
        iconContainer: node.id.includes(rootPrefix)
          ? classes.displayNone
          : classes.treeItemIconContainer
      }}
    >
      {node.children?.map((childNodeId) => (
        <TreeItemCustom {...props} key={String(childNodeId)} nodeId={String(childNodeId)} />
      ))}
    </TreeItem>
  );
}

const initialData: Data = {
  selected: null,
  nodeLookup: null,
  expanded: [],
  breadcrumbs: []
};

export default function ContentTree() {
  const classes = useStyles({});
  const dispatch = useDispatch();
  const guest = usePreviewGuest();
  const { formatMessage } = useIntl();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const hostToGuest$ = getHostToGuestBus();
  const hostToHost$ = getHostToHostBus();
  const site = useActiveSiteId();
  const [optionsMenu, setOptionsMenu] = React.useState({
    modelId: null,
    parentId: null,
    embeddedParentPath: null,
    anchorEl: null
  });
  const [data, setData] = React.useState<Data>(initialData);
  const byId = contentTypesBranch?.byId;
  const models = guest?.models;
  const modelId = guest?.modelId;

  useEffect(() => {
    const sub = hostToHost$.subscribe((action) => {
      if (action.type === SORT_ITEM_OPERATION_COMPLETE) {
        setData(initialData);
      }
    });

    if (site) {
      setData(initialData);
    }

    return () => {
      createBackHandler(dispatch)();
      sub.unsubscribe();
    };
  }, [dispatch, hostToHost$, site]);

  useEffect(() => {
    if (modelId && models && byId && data.selected === null) {
      console.log('here');
      let parent = models[modelId];
      let contentType = byId[parent.craftercms.contentTypeId];
      let root: RenderTree = {
        id: `${rootPrefix}${parent.craftercms.id}`,
        name: parent.craftercms.label,
        children: getChildren(parent, contentType, models, byId),
        type: contentType.type,
        modelId: parent.craftercms.id,
        rootPath: true
      };

      setData({
        selected: parent.craftercms.id,
        nodeLookup: hierarchicalToLookupTable(root),
        expanded: [`${rootPrefix}${parent.craftercms.id}`],
        breadcrumbs: []
      });
    }
  }, [byId, data, data.selected, hostToHost$, modelId, models]);

  useEffect(() => {
    const handler = (e) => {
      if (e.keyCode === 27) {
        createBackHandler(dispatch)();
      }
    };
    document.addEventListener('keydown', handler, false);
    return () => document.removeEventListener('keydown', handler, false);
  }, [dispatch]);

  const handleClick = (node: RenderTree) => {
    if (node.type === 'component' && !node.id.includes(rootPrefix)) {
      let model = models[node.modelId];
      let contentType = byId[model.craftercms.contentTypeId];
      const { type, modelId, name, index, fieldId, parentId, embeddedParentPath } = node;
      const nodeData = {
        id: `${rootPrefix}${model.craftercms.id}`,
        name,
        children: getChildren(model, contentType, models, byId),
        type,
        modelId,
        index,
        fieldId,
        parentId,
        embeddedParentPath
      };

      setData({
        selected: model.craftercms.id,
        nodeLookup: {
          ...data.nodeLookup,
          ...hierarchicalToLookupTable(nodeData)
        },
        expanded: [`${rootPrefix}${model.craftercms.id}`],
        breadcrumbs: data.breadcrumbs.length
          ? [...data.breadcrumbs, nodeData.id]
          : [`${rootPrefix}${data.selected}`, nodeData.id]
      });
    }
  };

  const handleScroll = (node: RenderTree) => {
    hostToGuest$.next({
      type: CONTENT_TREE_FIELD_SELECTED,
      payload: node
    });
    return;
  };

  const handleBreadCrumbClick = (event, node?: RenderTree) => {
    event.stopPropagation();
    if (!data.breadcrumbs.length) return null;

    let nodeIdWithoutPrefix = node.id.replace(rootPrefix, '');

    let breadcrumbsArray = [...data.breadcrumbs];
    breadcrumbsArray = data.breadcrumbs.slice(0, breadcrumbsArray.indexOf(node.id) + 1);

    setData({
      ...data,
      selected: nodeIdWithoutPrefix,
      expanded: [node.id],
      breadcrumbs: breadcrumbsArray.length === 1 ? [] : breadcrumbsArray
    });
  };

  const handleChange = (event: any, nodes: string[]) => {
    if (
      event.target.classList.contains('toggle') ||
      event.target.parentElement.classList.contains('toggle')
    ) {
      setData({ ...data, expanded: [...nodes] });
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

  const handleClose = () => setOptionsMenu({ ...optionsMenu, anchorEl: null });

  const resource = useLogicResource<Data, Data>(data, {
    shouldResolve: (source) => Boolean(source.selected),
    shouldReject: () => false,
    shouldRenew: (source, resource) => {
      //return Boolean(source.breadcrumbs.length && resource.complete && source.expanded.length === 1);
      return resource.complete;
    },
    resultSelector: (source) =>  source,
    errorSelector: null
  });

  return (
    <ToolPanel title={translations.contentTree}>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon className="toggle" />}
        defaultExpandIcon={<ChevronRightIcon className="toggle" />}
        disableSelection
        expanded={data.expanded}
        onNodeToggle={handleChange}
      >
        <Suspencified loadingStateProps={{ title: formatMessage(translations.loading) }}>
          {Boolean(data.breadcrumbs.length) && (
            <MuiBreadcrumbs
              maxItems={2}
              aria-label="Breadcrumbs"
              separator={<NavigateNextIcon fontSize="small" />}
              classes={{
                ol: classes.breadcrumbsList,
                separator: classes.breadcrumbsSeparator
              }}
            >
              {data.breadcrumbs.map((id, i: number) =>
                id === `${rootPrefix}${data.selected}` ? (
                  <Typography
                    key={data.nodeLookup[id].id}
                    variant="subtitle2"
                    className={classes.breadcrumbsTypography}
                    children={data.nodeLookup[id].name}
                  />
                ) : (
                  <Link
                    key={data.nodeLookup[id].id}
                    color="inherit"
                    component="button"
                    variant="subtitle2"
                    underline="always"
                    TypographyClasses={{
                      root: classes.breadcrumbsTypography
                    }}
                    onClick={(e) => handleBreadCrumbClick(e, data.nodeLookup[id])}
                    children={data.nodeLookup[id].name}
                  />
                )
              )}
            </MuiBreadcrumbs>
          )}
          <TreeItemCustom
            nodeId={`${rootPrefix}${data.selected}`}
            resource={resource}
            handleScroll={handleScroll}
            handleClick={handleClick}
            handleOptions={handleOptions}
          />
        </Suspencified>
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
      </TreeView>
    </ToolPanel>
  );
}
