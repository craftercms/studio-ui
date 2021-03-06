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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import TreeItem from '@material-ui/lab/TreeItem';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import { ContentType, ContentTypeField } from '../../models/ContentType';
import Page from '../Icons/Page';
import ContentTypeFieldIcon from '../Icons/ContentTypeField';
import Component from '../Icons/Component';
import NodeSelector from '../Icons/NodeSelector';
import RepeatGroupItem from '../Icons/RepeatGroupItem';
import Root from '@material-ui/icons/HomeRounded';
import NavigateNextIcon from '@material-ui/icons/NavigateNextRounded';
import { LookupTable } from '../../models/LookupTable';
import ContentInstance from '../../models/ContentInstance';
import RepeatGroup from '../Icons/RepeatGroup';
import { hierarchicalToLookupTable } from '../../utils/object';
import {
  CLEAR_CONTENT_TREE_FIELD_SELECTED,
  CONTENT_TREE_FIELD_SELECTED,
  DELETE_ITEM_OPERATION_COMPLETE,
  SORT_ITEM_OPERATION_COMPLETE
} from '../../state/actions/preview';
import { getHostToGuestBus, getHostToHostBus } from '../../modules/Preview/previewContext';
import Suspencified from '../SystemStatus/Suspencified';
import { Resource } from '../../models/Resource';
import palette from '../../styles/palette';
import { useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import ItemActionsMenu from '../ItemActionsMenu';
import { completeDetailedItem } from '../../state/actions/content';
import SearchBar from '../Controls/SearchBar';
import Divider from '@material-ui/core/Divider';
// @ts-ignore
import { getOffsetLeft, getOffsetTop } from '@material-ui/core/Popover/Popover';
import { showItemMegaMenu } from '../../state/actions/dialogs';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePreviewGuest } from '../../utils/hooks/usePreviewGuest';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useSpreadState } from '../../utils/hooks/useSpreadState';

const rootPrefix = '{root}_';

const translations = defineMessages({
  title: {
    id: 'previewPageExplorerPanel.title',
    defaultMessage: 'Page Explorer'
  },
  loading: {
    id: 'previewPageExplorerPanel.loading',
    defaultMessage: 'Loading'
  },
  onThisPage: {
    id: 'previewPageExplorerPanel.rootItemLabel',
    defaultMessage: 'Current Content Items'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& > li > ul': {
        marginLeft: '0'
      }
    },
    searchWrapper: {
      padding: '10px'
    },
    divider: {
      marginTop: '10px'
    },
    rootIcon: {
      fontSize: '1.2em',
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium7
    },
    breadcrumbs: {
      display: 'flex',
      alignItems: 'center'
    },
    breadcrumbsList: {
      display: 'flex',
      alignItems: 'center',
      padding: '9px 10px 2px 8px'
    },
    breadcrumbsSeparator: {
      margin: '0 2px'
    },
    breadcrumbsButton: {
      display: 'flex'
    },
    breadcrumbsTypography: {
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium4
    },
    currentContentItems: {
      fontWeight: 600,
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium7,
      padding: '0 12px 2px 12px'
    },
    chevron: {
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium3,
      fontSize: '1.4rem'
    }
  })
);

const treeItemStyles = makeStyles((theme) =>
  createStyles({
    icon: {
      color: palette.teal.main
    },
    displayNone: {
      display: 'none'
    },
    treeItemIconContainer: {},
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
        paddingLeft: 0,
        '& $treeItemLabelRoot': {
          paddingLeft: '6px'
        }
      }
    },
    treeItemGroup: {},
    treeItemExpanded: {},
    treeItemSelected: {},
    treeItemLabelRoot: {
      paddingLeft: 0
    },
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
    },
    chevron: {
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium3,
      fontSize: '1.4rem'
    },
    nameLabel: {
      color: theme.palette.type === 'dark' ? palette.white : palette.gray.medium4
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
  path?: string;
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
      path: model.craftercms.path,
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
  return contentType.fields[fieldName] ?? contentTypes['/component/level-descriptor'].fields[fieldName] ?? null;
}

interface TreeItemCustomInterface {
  nodeLookup: LookupTable<RenderTree>;
  node: RenderTree;
  isRootChild?: boolean;
  keyword?: string;

  handleScroll?(node: RenderTree): void;

  handleClick?(node: RenderTree): void;

  handleOptions?(e: any, node: RenderTree): void;
}

function TreeItemCustom(props: TreeItemCustomInterface) {
  const { nodeLookup, node, handleScroll, handleClick, handleOptions, isRootChild, keyword } = props;
  const classes = treeItemStyles({});
  const [over, setOver] = useState(false);
  let timeout = React.useRef<any>();
  const isMounted = useRef(null);
  let Icon;
  const nodeName = node.name.split(':');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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
      }, 50);
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

  const children = keyword
    ? node.children?.filter((childNodeId) =>
        nodeLookup[String(childNodeId)].name.toLowerCase().includes(keyword.toLowerCase())
      )
    : node.children;

  return (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      onMouseOver={(e) => setOverState(e, true)}
      onMouseOut={(e) => setOverState(e, false)}
      icon={
        isPageOrComponent(node.type) && (
          <ChevronRightIcon onClick={() => handleClick(node)} className={classes.chevron} />
        )
      }
      label={
        <div className={classes.treeItemLabel} onClick={() => handleScroll(node)}>
          <Icon className={classes.icon} />
          <p title={node.name}>
            {nodeName.length === 1 ? (
              nodeName[0]
            ) : (
              <>
                {nodeName[1]} <span className={classes.nameLabel}>{`(${nodeName[0].trim()})`}</span>
              </>
            )}
          </p>
          {over && node.path && (
            <IconButton
              className={classes.options}
              onMouseOver={(e) => setOverState(e, true)}
              onClick={(e) => handleOptions(e, node)}
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
          isPageOrComponent(node.type) && !isRootChild && 'padded',
          isRoot(node.id) && 'root'
        ),
        expanded: classes.treeItemExpanded,
        selected: classes.treeItemSelected,
        group: classes.treeItemGroup,
        iconContainer: isRoot(node.id) ? classes.displayNone : classes.treeItemIconContainer
      }}
    >
      {children?.map((childNodeId, i) => (
        <TreeItemCustom
          {...props}
          key={String(childNodeId) + i}
          node={nodeLookup[String(childNodeId)]}
          isRootChild={node.type === 'root'}
        />
      ))}
    </TreeItem>
  );
}

export default function PreviewPageExplorerPanel() {
  const dispatch = useDispatch();
  const guest = usePreviewGuest();
  const currentModelId = guest?.modelId;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const hostToGuest$ = getHostToGuestBus();
  const hostToHost$ = getHostToHostBus();
  const site = useActiveSiteId();
  const [keyword, setKeyword] = useState('');
  const [optionsMenu, setOptionsMenu] = useState({
    modelId: null,
    anchorEl: null,
    path: null
  });

  const [state, setState] = React.useState<any>({
    selected: `root`,
    expanded: ['root'],
    breadcrumbs: ['root']
  });

  const [nodeLookup, setNodeLookup] = useSpreadState<any>({});

  const ContentTypesById = contentTypesBranch?.byId;
  const models = guest?.models;

  const processedModels = useRef({});

  const updateNode = useCallback(
    (modelId: string, fieldId: string, nodeId: string) => {
      const model = models[modelId];
      const children = [];

      // TODO: IF deleted op, optional: remove deleted id from nodeLookup

      if (nodeLookup[nodeId].type === 'node-selector') {
        model[fieldId].forEach((id: string, i: number) => {
          let itemContentTypeName = ContentTypesById[models[id].craftercms.contentTypeId].name;
          children.push(
            getNodeSelectorChildren(
              models[id],
              model.craftercms.id,
              models[id].craftercms.path ? null : model.craftercms.path,
              itemContentTypeName,
              fieldId,
              i
            )
          );
        });
        const updatedNode = {
          ...nodeLookup[nodeId],
          children: children.map((node: RenderTree) => node.id)
        };
        setNodeLookup({ [nodeId]: updatedNode, ...hierarchicalToLookupTable(children) });
      } else if (nodeLookup[nodeId].type === 'page') {
        const contentType = ContentTypesById[model.craftercms.contentTypeId];
        const rootNode = {
          ...nodeLookup[nodeId],
          children: getChildren(model, contentType, models, ContentTypesById)
        };

        setNodeLookup({ ...hierarchicalToLookupTable(rootNode) });
      }
    },
    [ContentTypesById, models, nodeLookup, setNodeLookup]
  );

  const updateRoot = useCallback(
    (modelId: string, fieldId: string, index: string | number, update: Function) => {
      processedModels.current = {};
      Object.values(models).forEach((model) => {
        processedModels.current[model.craftercms.id] = true;
      });
      update();
    },
    [models]
  );

  // effect to refresh the contentTree if the models are updated
  useEffect(() => {
    const sub = hostToHost$.subscribe((action) => {
      switch (action.type) {
        case DELETE_ITEM_OPERATION_COMPLETE:
        case SORT_ITEM_OPERATION_COMPLETE: {
          const { modelId, fieldId, index } = action.payload;
          if (state.expanded.includes(`${modelId}_${fieldId}`)) {
            updateNode(modelId, fieldId, `${modelId}_${fieldId}`);
          } else if (state.selected.includes(modelId)) {
            updateNode(modelId, fieldId, `${rootPrefix}${modelId}`);
          } else if (state.selected === 'root' && action.type === DELETE_ITEM_OPERATION_COMPLETE) {
            updateRoot(modelId, fieldId, index, () => setState({ ...state }));
          }
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [dispatch, hostToHost$, state, updateNode, updateRoot]);

  // effect to refresh the contentTree if the site changes;
  useEffect(() => {
    if (site && currentModelId) {
      processedModels.current = {};
      setState({
        selected: `root`,
        expanded: ['root'],
        breadcrumbs: ['root']
      });
    }
  }, [site, currentModelId]);

  useEffect(() => {
    if (models && ContentTypesById) {
      let _nodeLookup = {};
      let shouldSetState = false;
      Object.values(models).forEach((model) => {
        let contentType = ContentTypesById[model.craftercms.contentTypeId];
        if (!processedModels.current[model.craftercms.id] && contentType) {
          processedModels.current[model.craftercms.id] = true;
          let node: RenderTree = {
            id: model.craftercms.id,
            name: `${contentType.name}: ${model.craftercms.label}`,
            children: [],
            type: contentType.type,
            path: model.craftercms.path,
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
  }, [ContentTypesById, formatMessage, models, setNodeLookup]);

  useEffect(() => {
    const handler = (e) => {
      if (e.keyCode === 27) {
        hostToGuest$.next({ type: CLEAR_CONTENT_TREE_FIELD_SELECTED });
      }
    };
    document.addEventListener('keydown', handler, false);
    return () => document.removeEventListener('keydown', handler, false);
  }, [dispatch, hostToGuest$]);

  const onBack = () => {
    hostToGuest$.next({ type: 'CLEAR_CONTENT_TREE_FIELD_SELECTED' });
  };

  const handleClick = (node: RenderTree) => {
    if ((node.type === 'component' || node.type === 'page') && !node.id.includes(rootPrefix)) {
      let model = models[node.modelId];
      let contentType = ContentTypesById[model.craftercms.contentTypeId];

      const rootNode = {
        ...node,
        id: `${rootPrefix}${node.id}`,
        children: getChildren(model, contentType, models, ContentTypesById)
      };

      setNodeLookup({ ...hierarchicalToLookupTable(rootNode) });
      setKeyword('');
      setState({
        selected: node.id,
        expanded: [`${rootPrefix}${node.id}`],
        breadcrumbs: [...state.breadcrumbs, node.id]
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
    breadcrumbsArray = breadcrumbsArray.slice(0, breadcrumbsArray.indexOf(node.id) + 1);

    setState({
      ...state,
      selected: node.id,
      expanded: node.id === 'root' ? [node.id] : [`${rootPrefix}${node.id}`],
      breadcrumbs: breadcrumbsArray
    });
  };

  const handleChange = (event: any, nodes: string[]) => {
    if (event.target.classList.contains('toggle') || event.target.parentElement.classList.contains('toggle')) {
      setState({ ...state, expanded: [...nodes] });
    }
  };

  const handleOptions = (event: any, node: RenderTree) => {
    event.stopPropagation();

    const path = node.path;
    const element = event.currentTarget;
    const anchorRect = element.getBoundingClientRect();
    const top = anchorRect.top + getOffsetTop(anchorRect, 'top');
    const left = anchorRect.left + getOffsetLeft(anchorRect, 'left');

    if (path) {
      dispatch(completeDetailedItem({ path }));
      dispatch(
        showItemMegaMenu({
          path: path,
          anchorReference: 'anchorPosition',
          anchorPosition: { top, left }
        })
      );
    }
  };

  const handleClose = () => setOptionsMenu({ ...optionsMenu, anchorEl: null });

  const handleSearchKeyword = (keyword) => {
    setKeyword(keyword);
  };

  const resource = useLogicResource<boolean, any>(
    { models, byId: ContentTypesById },
    {
      shouldResolve: (source) => Boolean(source.models && source.byId),
      shouldReject: () => false,
      shouldRenew: () => !Object.keys(processedModels.current).length && resource.complete,
      resultSelector: () => true,
      errorSelector: null
    }
  );

  useUnmount(onBack);

  return (
    <>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon className={clsx('toggle', classes.chevron)} />}
        defaultExpandIcon={<ChevronRightIcon className={clsx('toggle', classes.chevron)} />}
        disableSelection
        expanded={state.expanded}
        onNodeToggle={handleChange}
      >
        <div className={classes.searchWrapper}>
          <SearchBar showActionButton={Boolean(keyword)} onChange={handleSearchKeyword} keyword={keyword} />
          <Divider className={classes.divider} />
        </div>
        <Suspencified loadingStateProps={{ title: formatMessage(translations.loading) }}>
          <PageExplorerUI
            handleBreadCrumbClick={handleBreadCrumbClick}
            handleClick={handleClick}
            handleClose={handleClose}
            handleScroll={handleScroll}
            optionsMenu={optionsMenu}
            rootPrefix={rootPrefix}
            handleOptions={handleOptions}
            resource={resource}
            keyword={keyword}
            nodeLookup={nodeLookup}
            selected={state.selected}
            breadcrumbs={state.breadcrumbs}
            rootChildren={Object.keys(processedModels.current)}
          />
        </Suspencified>
      </TreeView>
    </>
  );
}

interface PageExplorerUIProps {
  resource: Resource<any>;
  optionsMenu: {
    modelId: string;
    anchorEl: Element;
    path: null;
  };
  rootPrefix: string;
  keyword: string;
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

function PageExplorerUI(props: PageExplorerUIProps) {
  const {
    resource,
    handleScroll,
    handleClick,
    handleOptions,
    handleClose,
    handleBreadCrumbClick,
    optionsMenu,
    rootPrefix,
    nodeLookup,
    selected,
    keyword,
    breadcrumbs,
    rootChildren
  } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();

  resource.read();

  let node: any = null;

  if (selected === 'root') {
    node = {
      id: 'root',
      name: formatMessage(translations.onThisPage),
      children: rootChildren,
      type: 'root',
      modelId: 'root'
    };
  } else {
    node = nodeLookup[`${rootPrefix}${selected}`];
  }

  return (
    <>
      {Boolean(breadcrumbs.length > 1) && (
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
                children={nodeLookup[id].name.split(':').pop()}
              />
            ) : (
              <Link
                key={id === 'root' ? 'root' : nodeLookup[id].id}
                color="inherit"
                component="button"
                variant="subtitle2"
                underline="always"
                className={classes.breadcrumbsButton}
                TypographyClasses={{
                  root: classes.breadcrumbsTypography
                }}
                onClick={(e) => handleBreadCrumbClick(e, id === 'root' ? { id: 'root' } : nodeLookup[id])}
                children={id === 'root' ? <Root className={classes.rootIcon} /> : nodeLookup[id].name.split(':').pop()}
              />
            )
          )}
        </MuiBreadcrumbs>
      )}
      {node.id === 'root' ? (
        <>
          <Typography variant="subtitle1" className={classes.currentContentItems}>
            <FormattedMessage id="pageExplorerPanel.currentContentItems" defaultMessage="Current Content Items" />
          </Typography>
          {node.children
            ?.filter((childNodeId) =>
              nodeLookup[String(childNodeId)].name.toLowerCase().includes(keyword.toLowerCase())
            )
            .map((childNodeId, i) => (
              <TreeItemCustom
                {...props}
                key={String(childNodeId) + i}
                node={nodeLookup[String(childNodeId)]}
                isRootChild={node.type === 'root'}
              />
            ))}
        </>
      ) : (
        <TreeItemCustom
          node={node}
          keyword={keyword}
          nodeLookup={nodeLookup}
          handleScroll={handleScroll}
          handleClick={handleClick}
          handleOptions={handleOptions}
        />
      )}
      {Boolean(optionsMenu.anchorEl) && (
        <ItemActionsMenu
          path={optionsMenu.path}
          open={Boolean(optionsMenu.anchorEl)}
          anchorEl={optionsMenu.anchorEl}
          onClose={handleClose}
        />
      )}
    </>
  );
}
