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
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import {
  useActiveSiteId,
  useLogicResource,
  usePreviewGuest,
  useSelection,
  useSpreadState
} from '../../../utils/hooks';
import { ContentType, ContentTypeField } from '../../../models/ContentType';
import Page from '../../../components/Icons/Page';
import ContentTypeFieldIcon from '../../../components/Icons/ContentTypeField';
import Component from '../../../components/Icons/Component';
import NodeSelector from '../../../components/Icons/NodeSelector';
import RepeatGroupItem from '../../../components/Icons/RepeatGroupItem';
import Root from '@material-ui/icons/HomeOutlined';
import NavigateNextIcon from '@material-ui/icons/NavigateNextRounded';
import { LookupTable } from '../../../models/LookupTable';
import ContentInstance from '../../../models/ContentInstance';
import RepeatGroup from '../../../components/Icons/RepeatGroup';
import { findParentModelId, hierarchicalToLookupTable } from '../../../utils/object';
import {
  CLEAR_CONTENT_TREE_FIELD_SELECTED,
  CONTENT_TREE_FIELD_SELECTED,
  selectTool,
  SORT_ITEM_OPERATION_COMPLETE
} from '../../../state/actions/preview';
import { DRAWER_WIDTH, getHostToGuestBus, getHostToHostBus } from '../previewContext';
import Suspencified from '../../../components/SystemStatus/Suspencified';
import { Resource } from '../../../models/Resource';
import palette from '../../../styles/palette';
import { useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import ComponentMenu from '../../../components/ComponentMenu';

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
    icon: {},
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
        marginRight: '5px',
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
  children: string[];
  type: string;
  modelId?: string;
  parentId?: string;
  embeddedParentPath?: string;
  fieldId?: string;
  index?: string | number;
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
    if (contentTypeField) return;
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
    const { type, name } = contentTypeField;
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
            getContentTypeField(contentType, fieldName, contentTypes),
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
  nodeLookup: LookupTable<RenderTree>;
  node: RenderTree;
  isRootChild?: boolean;

  handleScroll?(node: RenderTree): void;

  handleClick?(node: RenderTree): void;

  handleOptions?(e: any, node: RenderTree): void;

}

function TreeItemCustom(props: TreeItemCustomInterface) {
  const { nodeLookup, node, handleScroll, handleClick, handleOptions, isRootChild } = props;
  const classes = treeItemStyles({});
  const [over, setOver] = useState(false);
  let timeout = React.useRef<any>();
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
    } else if (node.type === 'item') {
      Icon = RepeatGroupItem;
    } else if (node.type === 'root') {
      Icon = Root;
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

  function isRoot(id) {
    return id.includes('root') || node.id.includes(rootPrefix);
  }

  function isPageOrComponent(type: string) {
    return node.type === 'component' || node.type === 'page';
  }

  return (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      onMouseOver={(e) => setOverState(e, true)}
      onMouseOut={(e) => setOverState(e, false)}
      icon={isPageOrComponent(node.type) &&
      <ChevronRightIcon onClick={() => handleClick(node)} />}
      label={
        <div className={classes.treeItemLabel} onClick={() => handleScroll(node)}>
          <Icon className={classes.icon} />
          <p>{node.name}</p>
          {over && isPageOrComponent(node.type) && (
            <IconButton
              className={classes.options}
              onMouseOver={(e) => setOverState(e, true)}
              onClick={(e) =>
                handleOptions(e, node)
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
          (isPageOrComponent(node.type) && !isRootChild) && 'padded',
          isRoot(node.id) && 'root'
        ),
        expanded: classes.treeItemExpanded,
        selected: classes.treeItemSelected,
        group: classes.treeItemGroup,
        iconContainer: isRoot(node.id)
          ? classes.displayNone
          : classes.treeItemIconContainer
      }}
    >
      {node.children?.map((childNodeId, i) => (
        <TreeItemCustom
          {...props}
          key={String(childNodeId) + i}
          node={nodeLookup[String(childNodeId)]}
          isRootChild={node.type === 'root' ? true : false}
        />
      ))}
    </TreeItem>
  );
}

function createBackHandler(dispatch) {
  const hostToGuest$ = getHostToGuestBus();
  return () => {
    hostToGuest$.next({ type: CLEAR_CONTENT_TREE_FIELD_SELECTED });
  };
}

export default function ContentTree() {
  const dispatch = useDispatch();
  const guest = usePreviewGuest();
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const hostToGuest$ = getHostToGuestBus();
  const hostToHost$ = getHostToHostBus();
  const site = useActiveSiteId();
  const [optionsMenu, setOptionsMenu] = React.useState({
    modelId: null,
    embeddedParentPath: null,
    anchorEl: null
  });

  const [state, setState] = React.useState<any>({
    selected: `root`,
    expanded: ['root'],
    breadcrumbs: []
  });

  const [nodeLookup, setNodeLookup] = useSpreadState<any>({});

  const byId = contentTypesBranch?.byId;
  const models = guest?.models;
  const childrenMap = guest?.childrenMap;

  const processedModels = useRef({});

  //effect to refresh the contentTree if the sort op complete
  useEffect(() => {
    const sub = hostToHost$.subscribe((action) => {
      if (action.type === SORT_ITEM_OPERATION_COMPLETE) {
        console.log(action.payload);
        console.log(state);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [dispatch, hostToHost$, state]);

  // effect to refresh the contentTree if the site changes;
  useEffect(() => {
    if (site) {
      processedModels.current = {};
    }
  }, [site]);

  useEffect(() => {
    if (models && byId) {
      let _nodeLookup = {};
      let shouldSetState = false;
      Object.values(models).forEach((model) => {
        let contentType = byId[model.craftercms.contentTypeId];
        if (!processedModels.current[model.craftercms.id] && contentType) {
          processedModels.current[model.craftercms.id] = true;
          let node: RenderTree = {
            id: model.craftercms.id,
            name: model.craftercms.label,
            children: [],
            type: contentType.type,
            modelId: model.craftercms.id
          };
          shouldSetState = true;
          _nodeLookup[node.id] = node;
        }
      });
      if (shouldSetState) {
        setNodeLookup(_nodeLookup);
      }
    }
  }, [byId, models, setNodeLookup]);

  useEffect(() => {
    const handler = (e) => {
      if (e.keyCode === 27) {
        createBackHandler(dispatch)();
      }
    };
    document.addEventListener('keydown', handler, false);
    return () => document.removeEventListener('keydown', handler, false);
  }, [dispatch]);

  const onBack = () => {
    createBackHandler(dispatch)();
    dispatch(selectTool());
  };

  const handleClick = (node: RenderTree) => {
    if ((node.type === 'component' || node.type === 'page') && !node.id.includes(rootPrefix)) {
      let model = models[node.modelId];
      let contentType = byId[model.craftercms.contentTypeId];

      const rootNode = {
        ...node,
        id: `${rootPrefix}${node.id}`,
        children: getChildren(model, contentType, models, byId)
      };

      setNodeLookup({ ...hierarchicalToLookupTable(rootNode) });

      setState({
        selected: node.id,
        expanded: [`${rootPrefix}${node.id}`],
        breadcrumbs: ['root', node.id]
      });
    }
  };

  const handleScroll = (node: RenderTree) => {
    hostToGuest$.next({
      type: CONTENT_TREE_FIELD_SELECTED,
      payload: {
        name: node.name,
        modelId: node.parentId || node.modelId,
        fieldId: node.fieldId ?? null,
        index: node.index ?? null
      }
    });
    return;
  };

  const handleBreadCrumbClick = (event, node?: RenderTree) => {
    event.stopPropagation();
    if (!state.breadcrumbs.length) return null;

    let breadcrumbsArray = [...state.breadcrumbs];
    breadcrumbsArray = state.breadcrumbs.slice(0, breadcrumbsArray.indexOf(node.id) + 1);

    setState({
      ...state,
      selected: node.id,
      expanded: [node.id],
      breadcrumbs: breadcrumbsArray.length === 1 ? [] : breadcrumbsArray
    });
  };

  const handleChange = (event: any, nodes: string[]) => {
    if (
      event.target.classList.contains('toggle') ||
      event.target.parentElement.classList.contains('toggle')
    ) {
      setState({ ...state, expanded: [...nodes] });
    }
  };

  const handleOptions = (
    event: any,
    node: RenderTree
  ) => {
    event.stopPropagation();

    const parentModelId = findParentModelId(node.modelId, childrenMap, models);
    const path = models[node.modelId].craftercms.path;
    const embeddedParentPath = !path && parentModelId ? models[parentModelId].craftercms.path : null;

    setOptionsMenu({
      ...optionsMenu,
      modelId: node.modelId,
      embeddedParentPath,
      anchorEl: event.currentTarget.parentElement
    });
  };

  const handleClose = () => setOptionsMenu({ ...optionsMenu, anchorEl: null });

  const resource = useLogicResource<boolean, any>({ models, byId }, {
    shouldResolve: (source) => Boolean(source.models && source.byId),
    shouldReject: () => false,
    shouldRenew: () => !Object.keys(processedModels.current).length && resource.complete,
    resultSelector: () => true,
    errorSelector: null
  });

  return (
    <ToolPanel title={translations.contentTree} onBack={onBack}>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon className="toggle" />}
        defaultExpandIcon={<ChevronRightIcon className="toggle" />}
        disableSelection
        expanded={state.expanded}
        onNodeToggle={handleChange}
      >
        <Suspencified loadingStateProps={{ title: formatMessage(translations.loading) }}>
          <ContentTreeUI
            handleBreadCrumbClick={handleBreadCrumbClick}
            handleClick={handleClick}
            handleClose={handleClose}
            handleScroll={handleScroll}
            optionsMenu={optionsMenu}
            rootPrefix={rootPrefix}
            site={site}
            handleOptions={handleOptions}
            resource={resource}
            nodeLookup={nodeLookup}
            selected={state.selected}
            breadcrumbs={state.breadcrumbs}
            rootChildren={Object.keys(processedModels.current)}
          />
        </Suspencified>
      </TreeView>
    </ToolPanel>
  );
}

interface ContentTreeUI {
  resource: Resource<any>;
  optionsMenu: {
    modelId: string;
    embeddedParentPath: string;
    anchorEl: Element;
  };
  site: string;
  rootPrefix: string;
  handleScroll(node: RenderTree): void;
  handleClick(node: RenderTree): void;
  handleClose(): void;
  handleOptions?(e: any, node: RenderTree): void;
  handleBreadCrumbClick(event, node?: RenderTree): void;
  nodeLookup: any;
  selected: any;
  breadcrumbs: any;
  rootChildren: string[];
}

function ContentTreeUI(props: ContentTreeUI) {
  const {
    resource,
    handleScroll,
    handleClick,
    handleOptions,
    handleClose,
    handleBreadCrumbClick,
    optionsMenu,
    site,
    rootPrefix,
    nodeLookup,
    selected,
    breadcrumbs,
    rootChildren
  } = props;
  const classes = useStyles({});

  resource.read();

  let node: any = null;

  if (selected === 'root') {
    node = {
      id: 'root',
      name: 'root',
      children: rootChildren,
      type: 'root',
      modelId: 'root'
    };
  } else {
    node = nodeLookup[`${rootPrefix}${selected}`];
  }

  return (
    <>
      {Boolean(breadcrumbs.length) && (
        <MuiBreadcrumbs
          maxItems={2}
          aria-label="Breadcrumbs"
          separator={<NavigateNextIcon fontSize="small" />}
          classes={{
            ol: classes.breadcrumbsList,
            separator: classes.breadcrumbsSeparator
          }}
        >
          {breadcrumbs.map((id, i: number) =>
            id === selected ? (
              <Typography
                key={nodeLookup[id].id}
                variant="subtitle2"
                className={classes.breadcrumbsTypography}
                children={nodeLookup[id].name}
              />
            ) : (
              <Link
                key={id === 'root' ? 'root' : nodeLookup[id].id}
                color="inherit"
                component="button"
                variant="subtitle2"
                underline="always"
                TypographyClasses={{
                  root: classes.breadcrumbsTypography
                }}
                onClick={(e) => handleBreadCrumbClick(e, id === 'root' ? { id: 'root' } : nodeLookup[id])}
                children={id === 'root' ? 'root' : nodeLookup[id].name}
              />
            )
          )}
        </MuiBreadcrumbs>
      )}
      <TreeItemCustom
        node={node}
        nodeLookup={nodeLookup}
        handleScroll={handleScroll}
        handleClick={handleClick}
        handleOptions={handleOptions}
      />
      <ComponentMenu
        anchorEl={optionsMenu.anchorEl}
        handleClose={handleClose}
        site={site}
        modelId={optionsMenu.modelId}
        embeddedParentPath={optionsMenu.embeddedParentPath}
        anchorOrigin={{
          vertical: 'top',
          horizontal: DRAWER_WIDTH - 60
        }}
      />
    </>
  );
}
