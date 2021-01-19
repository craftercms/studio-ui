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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;
var storage = CStudioAuthoring.Storage;

(function() {
  function RootFolder() {
    return CStudioAuthoring.ContextualNav.WcmRootFolder;
  }

  /**
   * WcmAssetsFolder
   * A root level folder is a configurable folder element that can be based at any
   * point along a wcm path.
   */

  CStudioAuthoring.ContextualNav.WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder || {
    ROOT_OPEN: 'open',
    ROOT_CLOSED: 'closed',
    ROOT_TOGGLE: 'toggle',
    IS_WRITE: false,
    treePaths: [],
    storage: CStudioAuthoring.Storage,
    customIcons: {},
    defaultIcons: {
      defaultIcon: 'fa-folder',
      childOpen: 'fa-folder-open-o',
      childClosed: 'fa-folder-o',
      scripts: 'fa-code',
      staticassets: 'fa-file-image-o',
      taxonomy: 'fa-tags',
      templates: 'fa-file-code-o'
    },

    /**
     * initialize module
     */
    initialize: function(config) {
      // When initializing, check if it's in preview and set the current previewed item into tree cookie
      if (CStudioAuthoringContext.isPreview && config.params.path === '/static-assets') {
        var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent()[0];
        // check if selected content is type asset
        if (selectedContent != null && selectedContent.isAsset) {
          CStudioAuthoring.Operations.updateTreeCookiePath('staticassets', 'static-assets', selectedContent.uri);
        }
      }

      var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      if (config.name == 'wcm-assets-folder') {
        var instance = new CStudioAuthoring.ContextualNav.WcmAssetsFolderInstance(config);

        instance.openArray = {};

        var latestStored = CStudioAuthoring.ContextualNav.WcmAssetsFolder.storage.read(this.getStoredPathKey(instance));
        if (latestStored) {
          if (latestStored.indexOf(',') != -1 || latestStored.indexOf('[') != -1 || latestStored.indexOf('{') != -1) {
            instance.openArray = JSON.parse(latestStored);
          } else {
            instance.openArray = [];
            instance.openArray.push(latestStored);
          }
        }

        instance.IsContentMenuCreated = false;

        var key = config.params.label;
        key = key.replace(/\s/g, '');
        WcmAssets.customIcons[key] = {
          childIcons: {
            open: { icon: {} },
            closed: { icon: {} }
          },
          moduleIcons: {
            open: { icon: {} },
            closed: { icon: {} }
          }
        };

        // Setup child folders icon configuration
        if (config.params['child-icon-open'] && config.params['child-icon-open'].class) {
          WcmAssets.customIcons[key].childIcons.open.icon.class = config.params['child-icon-open'].class;
        } else {
          WcmAssets.customIcons[key].childIcons.open.icon.class = WcmAssets.defaultIcons.childOpen;
        }
        if (config.params['child-icon-open'] && config.params['child-icon-open'].styles) {
          WcmAssets.customIcons[key].childIcons.open.icon.styles = config.params['child-icon-open'].styles;
        }
        if (config.params['child-icon-closed'] && config.params['child-icon-closed'].class) {
          WcmAssets.customIcons[key].childIcons.closed.icon.class = config.params['child-icon-closed'].class;
        } else {
          WcmAssets.customIcons[key].childIcons.closed.icon.class = WcmAssets.defaultIcons.childClosed;
        }
        if (config.params['child-icon-closed'] && config.params['child-icon-closed'].styles) {
          WcmAssets.customIcons[key].childIcons.closed.icon.styles = config.params['child-icon-closed'].styles;
        }

        var module = key.toLowerCase();

        // setup root folder icon configuration
        if (config.params['module-icon-open'] && config.params['module-icon-open'].class) {
          WcmAssets.customIcons[key].moduleIcons.open.icon.class = config.params['module-icon-open'].class;
        } else {
          if (WcmAssets.defaultIcons[module]) {
            WcmAssets.customIcons[key].moduleIcons.open.icon.class = WcmAssets.defaultIcons[module];
          } else {
            WcmAssets.customIcons[key].moduleIcons.open.icon.class = WcmAssets.defaultIcons.defaultIcon;
          }
        }
        if (config.params['module-icon-open'] && config.params['module-icon-open'].styles) {
          WcmAssets.customIcons[key].moduleIcons.open.icon.styles = config.params['module-icon-open'].styles;
        }
        if (config.params['module-icon-closed'] && config.params['module-icon-closed'].class) {
          WcmAssets.customIcons[key].moduleIcons.closed.icon.class = config.params['module-icon-closed'].class;
        } else {
          if (WcmAssets.defaultIcons[module]) {
            WcmAssets.customIcons[key].moduleIcons.closed.icon.class = WcmAssets.defaultIcons[module];
          } else {
            WcmAssets.customIcons[key].moduleIcons.closed.icon.class = WcmAssets.defaultIcons.defaultIcon;
          }
        }
        if (config.params['module-icon-closed'] && config.params['module-icon-closed'].styles) {
          WcmAssets.customIcons[key].moduleIcons.closed.icon.styles = config.params['module-icon-closed'].styles;
        }

        this.addContentTreeRootFolder(instance);

        window.setTimeout(function() {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.openLatest(instance);
        }, 1000);
      }
    },

    /**
     * add a root level folder to the content drop down
     */
    addContentTreeRootFolder: function(instance) {
      var folderListEl = instance.config.containerEl;
      var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      var parentFolderEl = document.createElement('div');

      var parentFolderLinkEl = document.createElement('a');
      parentFolderLinkEl.id = instance.label.toLowerCase() + '-tree';

      var label = instance.label.toLowerCase();
      label = label.replace(/ /g, '');
      var labelLangBundle = CMgs.format(siteDropdownLangBundle, label);
      label = labelLangBundle == label ? instance.label : labelLangBundle;

      // add custom icon class
      var key = instance.label;
      key = key.replace(/\s/g, '');

      // create spans for icons
      var moduleIcons = WcmAssets.customIcons[key].moduleIcons,
        moduleClosed = CStudioAuthoring.Utils.createIcon(moduleIcons.closed, '', 'on-closed'),
        moduleOpen = CStudioAuthoring.Utils.createIcon(moduleIcons.open, '', 'on-open');

      parentFolderLinkEl.appendChild(moduleClosed);
      parentFolderLinkEl.appendChild(moduleOpen);
      parentFolderLinkEl.appendChild($('<span />').text(label).get(0));

      parentFolderLinkEl.onclick = CStudioAuthoring.ContextualNav.WcmAssetsFolder.onRootFolderClick;
      parentFolderLinkEl.componentInstance = instance;

      var treeEl = document.createElement('div');
      folderListEl.appendChild(parentFolderEl);
      parentFolderEl.appendChild(parentFolderLinkEl);
      parentFolderEl.appendChild(treeEl);

      YDom.addClass(parentFolderLinkEl, 'acn-parent-folder');
      YDom.addClass(parentFolderEl, 'acn-parent ' + instance.label.toLowerCase() + '-tree');

      parentFolderLinkEl.rootFolderEl = treeEl;
      parentFolderLinkEl.parentControl = this;
      treeEl.rootFolderSite = CStudioAuthoringContext.site;
      treeEl.rootFolderPath = instance.path;

      instance.rootFolderEl = treeEl;
    },

    /**
     * initialize the content tree for the dropdown.
     * There are many methods involved, but it all starts here.
     */
    initializeContentTree: function(treeEl, path, instance) {
      var site = treeEl.rootFolderSite;
      var rootPath = treeEl.rootFolderPath;
      var pathToOpen = path != undefined ? path : null;

      var tree = new YAHOO.widget.TreeView(treeEl);
      RootFolder().myTree = tree;
      tree.setDynamicLoad(this.onLoadNodeDataOnClick);
      tree.FOCUS_CLASS_NAME = null;

      var label = treeEl.previousElementSibling;
      YDom.addClass(label, 'loading');

      CStudioAuthoring.Service.lookupSiteContent(site, rootPath, 1, 'default', {
        openToPath: pathToOpen,
        success: function(treeData) {
          var items = treeData.item.children;

          if (instance.showRootItem) {
            items = new Array(treeData.item);
          }

          CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawTree(items, tree, path, instance);

          YDom.removeClass(label, 'loading');
        },
        failure: function() {
          YDom.removeClass(label, 'loading');
        }
      });
    },

    getStoredPathKey: function(instance) {
      return `${CStudioAuthoringContext.site}-${instance.label.replace(' ', '').toLowerCase()}-opened`;
    },

    /**
     * render function called on root level elements
     */
    drawTree: function(treeItems, tree, pathToOpenTo, instance, uniquePath) {
      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
      var treeNodes = new Array();
      var treeNodesLabels = new Array();
      var currentLevelPath = null;
      var remainingPath = null;
      var nodeToOpen = null;
      var contextMenuPrefix = 'ContextMenu-';
      var contextMenuId = contextMenuPrefix + tree.id;

      if (pathToOpenTo != null && pathToOpenTo != undefined) {
        var pathParts = pathToOpenTo.split('/');

        if (pathParts.length >= 2) {
          currentLevelPath = '/' + pathParts[1];
          remainingPath = pathToOpenTo.substring(currentLevelPath.length + 1);
        }
      }

      for (var i = 0; i < treeItems.length; i++) {
        var treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);

        if (treeNodeTO.isContainer == true) {
          treeNodeTO.style = 'acn-parent-folder';
        }

        if (!treeItems[i].hideInAuthoring) {
          var treeNode = this.drawTreeItem(treeNodeTO, tree.getRoot(), instance);
          treeNode.instance = instance;

          if (pathToOpenTo != null && treeNode != null) {
            if (treeNodeTO.pathSegment == 'index.xml') {
              if (CStudioAuthoring.Utils.endsWith(treeNodeTO.path, currentLevelPath)) {
                nodeToOpen = treeNode;
              }
            }
          }

          treeNodes.push(treeNode);
          treeNodesLabels.push(tree.root.children[i].labelElId);
        }
      }

      new YAHOO.widget.Tooltip('acn-context-tooltipWrapper', {
        context: treeNodesLabels,
        hidedelay: 0,
        showdelay: 1000,
        container: 'acn-context-tooltip'
      });

      tree.subscribe('clickEvent', function(args) {
        CStudioAuthoring.ContextualNav.WcmAssetsFolder.onTreeNodeClick(args.node);
      });

      tree.subscribe('dblClickEvent', function(node) {
        return false;
      });

      tree.subscribe('expand', function(node) {
        var id = node.labelElId;
        var nodeId = YDom.get(id);

        if (nodeId != null) {
          var expandedNodeStyle = nodeId.className;
          expandedNodeStyle = expandedNodeStyle.replace(' acn-collapsed-tree-node-label', '');
          nodeId.className = expandedNodeStyle + ' acn-expanded-tree-node-label';
        }

        CStudioAuthoring.ContextualNav.WcmAssetsFolder.expandTree(node);

        if (Object.prototype.toString.call(instance.path) === '[object Array]') {
          var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
          for (var i = 0; i < treeChild.length; i++) {
            treeChild[i].setAttribute('num', instance.path[i].replace(/\//g, '').toLowerCase());
          }
        } else {
          var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
          treeChild[0].setAttribute('num', instance.path.replace(/\//g, '').toLowerCase());
        }

        return true;
      });

      tree.subscribe('collapse', function(node) {
        var id = node.labelElId;
        var nodeId = YDom.get(id);
        var collapsedNodeStyle = nodeId.className;
        collapsedNodeStyle = collapsedNodeStyle.replace(' acn-expanded-tree-node-label', '');
        nodeId.className = collapsedNodeStyle + ' acn-collapsed-tree-node-label';

        CStudioAuthoring.ContextualNav.WcmAssetsFolder.collapseTree(node);

        if (Object.prototype.toString.call(instance.path) === '[object Array]') {
          var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
          for (var i = 0; i < treeChild.length; i++) {
            treeChild[i].setAttribute('num', instance.path[i].replace(/\//g, '').toLowerCase());
          }
        } else {
          var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
          treeChild[0].setAttribute('num', instance.path.replace(/\//g, '').toLowerCase());
        }

        return true;
      });

      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
      nodeOpen = true;
      WcmAssetsFolder.treePaths.push(tree.id);

      tree.draw();

      if (Object.prototype.toString.call(instance.path) === '[object Array]') {
        var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
        for (var i = 0; i < treeChild.length; i++) {
          treeChild[i].setAttribute('num', instance.path[i].replace(/\//g, '').toLowerCase());
        }
      } else {
        var treeChild = tree.getEl().querySelectorAll('.acn-parent > div > div > .ygtvchildren > .ygtvitem');
        treeChild[0].setAttribute('num', instance.path.replace(/\//g, '').toLowerCase());
      }

      if (nodeToOpen != null) {
        // opening to a specific path
        nodeToOpen.expand();
        nodeToOpen.openToPath = remainingPath;
      }

      var treeId = tree.id.toString().replace(/-/g, '');
      RootFolder().myTreePages[treeId] = tree;
      if (treeNodeTO.path === '/static-assets') {
        RootFolder().currentTextNode = treeNodeTO;
        RootFolder().myTreeAssets = tree;
      }
      CrafterCMSNext.system
        .getHostToHostBus()
        .pipe(
          CrafterCMSNext.rxjs.operators.filter((e) =>
            [
              'ITEM_CUT',
              'ITEMS_PASTED',
              'ITEM_DUPLICATED',
              'ITEM_CREATED',
              'ITEM_UPDATED',
              'ITEMS_DELETED',
              'FOLDER_RENAMED',
              'FOLDER_CREATED'
            ].includes(e.type)
          )
        )
        .subscribe(({ type, payload }) => {
          const Self = RootFolder();
          const tree = RootFolder().myTreePages[treeId];
          switch (type) {
            case 'ITEM_CUT': {
              const node = tree.getNodeByProperty('path', CrafterCMSNext.util.path.withoutIndex(payload.target));
              if (node) {
                const parentTreeNode = node.getEl();
                const treeInner = YDom.get('acn-dropdown-menu-inner');
                const previousCutEl = YDom.getElementsByClassName('status-icon', null, treeInner);
                for (let i = 0; i < previousCutEl.length; i++) {
                  if (
                    previousCutEl[i].style.color == Self.CUT_STYLE_RGB ||
                    previousCutEl[i].style.color == Self.CUT_STYLE
                  ) {
                    previousCutEl[i].style.color = '';
                  }
                }

                document.getElementById(node.labelElId).style.cssText += 'color: ' + Self.CUT_STYLE + ' !important';

                if (node.hasChildren()) {
                  const getTextNodes = YDom.getElementsByClassName('status-icon', null, parentTreeNode);
                  for (let i = 0; i < getTextNodes.length; i++) {
                    getTextNodes[i].style.cssText += 'color: ' + Self.CUT_STYLE + ' !important';
                  }
                }
              }
              break;
            }
            case 'ITEMS_PASTED': {
              const targetNode = tree.getNodeByProperty('path', CrafterCMSNext.util.path.withoutIndex(payload.target));
              if (targetNode) {
                if (payload.clipboard.type === 'COPY') {
                  Self.refreshNodes(targetNode, true, false, tree, null, true);
                } else {
                  const sourceNode = tree.getNodeByProperty(
                    'path',
                    CrafterCMSNext.util.path.withoutIndex(payload.clipboard.sourcePath)
                  );
                  Self.refreshNodes(targetNode, true, false, tree, null, true);
                  Self.refreshNodes(sourceNode.parent, true, false, tree, null, true);
                }
              }
              break;
            }
            case 'ITEM_UPDATED':
            case 'FOLDER_RENAMED':
            case 'ITEM_DUPLICATED':
            case 'ITEM_CREATED': {
              const targetNode = tree.getNodeByProperty('path', CrafterCMSNext.util.path.getParentPath(payload.target));
              if (targetNode) {
                Self.refreshNodes(targetNode, true, false, tree, null, true);
              }
              break;
            }
            case 'FOLDER_CREATED': {
              const targetNode = tree.getNodeByProperty('path', CrafterCMSNext.util.path.withoutIndex(payload.target));
              if (targetNode) {
                Self.refreshNodes(targetNode, true, false, tree, null, true);
              }
              break;
            }
            case 'ITEMS_DELETED': {
              payload.targets.forEach((path) => {
                let targetNode = tree.getNodeByProperty('path', CrafterCMSNext.util.path.getParentPath(path));
                if (targetNode) {
                  Self.refreshNodes(targetNode, true, false, tree, null, true);
                }
              });
              break;
            }
          }
        });
    },

    /**
     * render method called on sub root level elements
     */
    drawSubtree: function(treeItems, root, pathToOpenTo, instance) {
      var treeNodes = new Array();
      var treeNodesLabels = new Array();
      var nodeToOpen = null;
      var currentLevelPath = null;
      var remainingPath = null;
      var replaceAllChildFolders = false;

      if (pathToOpenTo) {
        var pathParts = pathToOpenTo.split('/');

        if (pathParts.length >= 2) {
          currentLevelPath = '/' + pathParts[0];
          remainingPath = pathToOpenTo.substring(currentLevelPath.length);
        }
      }

      for (var i = 0; i < treeItems.length; i++) {
        var treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);

        if (treeNodeTO.isContainer) {
          treeNodeTO.style = 'acn-parent-folder no-preview';
        }

        if (!treeItems[i].hideInAuthoring) {
          var treeNode = this.drawTreeItem(treeNodeTO, root, instance);
          treeNode.instance = instance;

          if (pathToOpenTo != null && treeNode != null) {
            if (CStudioAuthoring.Utils.endsWith(treeNodeTO.path, currentLevelPath)) {
              nodeToOpen = treeNode;
            }
          }

          treeNodes.push(treeNode);
          if (root.children[i]) {
            treeNodesLabels.push(root.children[i].labelElId);
          } else {
            treeNodesLabels.push(treeNode.labelElId);
          }
        }
      }

      new YAHOO.widget.Tooltip('acn-context-tooltipWrapper', {
        context: treeNodesLabels,
        hidedelay: 0,
        showdelay: 1000,
        container: 'acn-context-tooltip'
      });

      if (nodeToOpen) {
        nodeToOpen.expand();
        //nodeToOpen.openToPath = remainingPath;
      }
    },

    /**
     * render a tree item
     */
    drawTreeItem: function(treeNodeTO, root, instance) {
      var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder,
        isPreview = CStudioAuthoringContext.isPreview,
        isLevelDescriptor = '/component/level-descriptor' === treeNodeTO.contentType,
        isFolder = 'folder' === treeNodeTO.contentType,
        currentPreviewed = CStudioAuthoring.SelectedContent.getSelectedContent(),
        highlight = false;

      if (isPreview && (currentPreviewed[0] || {}).browserUri === treeNodeTO.browserUri && !isLevelDescriptor) {
        highlight = true;
      }

      if (treeNodeTO.container == true || treeNodeTO.name != 'index.xml') {
        var nodeSpan = document.createElement('span');

        if (treeNodeTO.style.match(/\bfolder\b/)) {
          var key = instance.label;
          key = key.replace(/\s/g, '');

          // create spans for icons

          var childIcons = WcmAssets.customIcons[key].childIcons;
          var closedConfig = childIcons.closed;
          var openConfig = childIcons.open;

          // adding stackedclass to folders if inProgress
          if (treeNodeTO.statusObj.inProgress) {
            closedConfig.icon.stackedclass = `${CStudioAuthoring.Constants.WORKFLOWICONS.edited} edited`;
            openConfig.icon.stackedclass = `${CStudioAuthoring.Constants.WORKFLOWICONS.edited} edited`;
          } else {
            closedConfig.icon.stackedclass = null;
            openConfig.icon.stackedclass = null;
          }

          var childClosed = CStudioAuthoring.Utils.createIcon(closedConfig, '', 'on-closed');
          var childOpen = CStudioAuthoring.Utils.createIcon(openConfig, '', 'on-open');

          nodeSpan.appendChild(childClosed);
          nodeSpan.appendChild(childOpen);
        } else {
          var icon = CStudioAuthoring.Utils.getContentItemIcon(treeNodeTO);
          nodeSpan.appendChild(icon);
        }

        nodeSpan.innerHTML += CrafterCMSNext.util.string.escapeHTML(treeNodeTO.label);
        nodeSpan.setAttribute('title', treeNodeTO.title);
        nodeSpan.className = treeNodeTO.style + ' yui-resize-label treenode-label';

        if (treeNodeTO.previewable == false) {
          nodeSpan.className += ' no-preview';
        } else {
          nodeSpan.className += ' preview';
        }

        nodeSpan.className += '  yui-resize-label';

        nodeSpan.className = highlight ? nodeSpan.className + ' highlighted' : nodeSpan.className;

        if (!isFolder && !isLevelDescriptor) {
          nodeSpan.dataset.uri = treeNodeTO.uri;
        }

        const path = treeNodeTO.uri;

        const loaderItems = CrafterCMSNext.util.content.getNumOfMenuOptionsForItem(
          CrafterCMSNext.util.content.parseLegacyItemToDetailedItem(treeNodeTO)
        );

        const openItemMenu = () => {
          CrafterCMSNext.system.store.dispatch({
            type: 'BATCH_ACTIONS',
            payload: [
              {
                type: 'COMPLETE_DETAILED_ITEM',
                payload: {
                  path
                }
              },
              {
                type: 'FETCH_USER_PERMISSIONS',
                payload: {
                  path
                }
              },
              {
                type: 'SHOW_ITEM_MENU',
                payload: {
                  path,
                  loaderItems,
                  anchorReference: 'anchorPosition',
                  anchorPosition: { top: event.clientY - 10, left: event.clientX - 10 }
                }
              }
            ]
          });
        };

        // Adding ItemMenu Icon and Trigger
        const menuIcon = document.createElement('i');
        menuIcon.className = 'fa fa-ellipsis-v item-menu-trigger';
        menuIcon.onclick = function(event) {
          event.preventDefault();
          event.stopPropagation();
          openItemMenu();
        };
        nodeSpan.appendChild(menuIcon);

        treeNodeTO.html = nodeSpan;
        var treeNode = new YAHOO.widget.HTMLNode(treeNodeTO, root, false);

        if (!RootFolder().treeNodes) RootFolder().treeNodes = [];

        treeNode.html.id = 'ygtvlabelel' + treeNode.index;
        treeNode.labelElId = 'ygtvlabelel' + treeNode.index;

        RootFolder().treeNodes['' + treeNode.labelElId] = treeNodeTO;

        treeNode.nodeType = 'CONTENT';
        treeNode.treeNodeTO = treeNodeTO;
        treeNode.renderHidden = true;
        treeNode.nowrap = true;

        treeNode.html.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          openItemMenu();
        });

        if (highlight) {
          window.setTimeout(function() {
            CStudioAuthoring.ContextualNav.WcmRootFolder.scrollToHighlighted();
          }, 500);
        }

        if (!treeNodeTO.isContainer) {
          treeNode.isLeaf = true;
        }
      }

      return treeNode;
    },

    /**
     * method fired when user clicks on the root level folder
     */
    onRootFolderClick: function() {
      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      WcmAssetsFolder.toggleFolderState(this.componentInstance, WcmAssetsFolder.ROOT_TOGGLE);
    },

    /**
     * toggle folder state
     */
    toggleFolderState: function(instance, forceState, path) {
      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      var $el;
      if (forceState != null && forceState != WcmAssetsFolder.ROOT_TOGGLE) {
        // force
        if (forceState == WcmAssetsFolder.ROOT_OPEN) {
          instance.rootFolderEl.style.display = 'block';
          instance.state = WcmAssetsFolder.ROOT_OPEN;
          this.initializeContentTree(instance.rootFolderEl, path, instance);
          this.save(instance, WcmAssetsFolder.ROOT_OPENED, null, 'root-folder');

          $el = $('#' + instance.rootFolderEl.id)
            .parent()
            .find('>a');
          $el.removeClass('closed');
          $el.addClass('open');
        } else {
          instance.rootFolderEl.style.display = 'none';
          instance.state = WcmAssetsFolder.ROOT_CLOSED;
          WcmAssetsFolder.storage.eliminate(RootFolder().getStoredPathKey(instance));

          $el = $('#' + instance.rootFolderEl.id)
            .parent()
            .find('>a');
          $el.removeClass('open');
          $el.addClass('closed');
        }
      } else {
        // toggle
        if (instance.state == WcmAssetsFolder.ROOT_OPEN) {
          this.toggleFolderState(instance, WcmAssetsFolder.ROOT_CLOSED, path);
        } else {
          this.toggleFolderState(instance, WcmAssetsFolder.ROOT_OPEN, path);
        }
      }
    },

    /**
     * method fired when tree node is expanded for first time
     */
    onLoadNodeDataOnClick: function(node, fnLoadComplete) {
      var path = encodeURI(node.treeNodeTO.path);
      var site = node.treeNodeTO.site;
      var pathToOpenTo = node.openToPath;

      CStudioAuthoring.Service.lookupSiteContent(site, path, 1, 'default', {
        success: function(treeData, args) {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawSubtree(
            treeData.item.children,
            node,
            args.pathToOpenTo,
            args.instance
          );

          args.fnLoadComplete();
        },

        failure: function(err, args) {
          args.fnLoadComplete();
        },

        argument: {
          node: node,
          instance: node.instance,
          fnLoadComplete: fnLoadComplete,
          pathToOpenTo: pathToOpenTo
        }
      });
    },

    /**
     * method fired when tree item is clicked
     */
    onTreeNodeClick: function(node) {
      if (node.data.previewable == true) {
        if (!node.data.isLevelDescriptor && !node.data.isContainer) {
          CStudioAuthoring.Operations.openPreview(node.data, '', false, false);
        }
      }

      return false;
    },

    expandTree: function(node, fnLoadComplete) {
      if (node) {
        var iniPath;
        try {
          iniPath = node.treeNodeTO.path;
        } catch (er) {
          iniPath = node.path;
        }
        var fileName = iniPath.split('/')[node.treeNodeTO.path.split('/').length - 1],
          roothpath = iniPath.replace('/' + fileName, ''),
          plainpath = iniPath,
          el = node.getEl(),
          num = el.getAttribute('num');
        plainpath = roothpath == '/site' ? 'root-folder' : plainpath;
        if (!num) {
          while ((el = el.parentElement) && !el.hasAttribute('num'));
        }
        if (el) {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.save(
            node.instance,
            plainpath,
            null,
            el.getAttribute('num') ? el.getAttribute('num') : 'root-folder',
            'expand'
          );
        }

        var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
        var id = node.labelElId,
          key = node.instance.label;
        key = key.replace(/\s/g, '');

        var $el = $('#' + id);
        $el.removeClass('closed');
        $el.addClass('open');
      }
    },

    collapseTree: function(node, fnLoadComplete) {
      var iniPath;
      try {
        iniPath = node.treeNodeTO.path;
      } catch (er) {
        iniPath = node.path;
      }
      var path = iniPath.replace(/\//g, '').toLowerCase();
      (fileName = iniPath.split('/')[node.treeNodeTO.path.split('/').length - 1]),
        (plainpath = iniPath.replace('/' + fileName, '')),
        (el = node.getEl()),
        (num = el.getAttribute('num'));
      plainpath = plainpath == '/site' || path == num ? 'root-folder' : plainpath;
      if (!num) {
        while ((el = el.parentElement) && !el.hasAttribute('num'));
      }

      CStudioAuthoring.ContextualNav.WcmAssetsFolder.save(
        node.instance,
        plainpath,
        fileName,
        el.getAttribute('num') ? el.getAttribute('num') : 'root-folder',
        'collapse'
      );

      var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
      var id = node.labelElId,
        key = node.instance.label;
      key = key.replace(/\s/g, '');

      var $el = $('#' + id);
      $el.removeClass('open');
      $el.addClass('closed');
    },

    save: function(instance, path, fileName, num, mode) {
      var flag = true;
      if (!instance.openArray[num]) {
        instance.openArray[num] = [];
      }
      for (var i = 0; i < instance.openArray[num].length; i++) {
        if (instance.openArray[num][i] && path.indexOf(instance.openArray[num][i]) > -1) {
          instance.openArray[num].splice(i, 1);
          i--;
          continue;
        } else {
          var aux = path;
          if (fileName) {
            aux = aux + '/' + fileName;
          }
          if (instance.openArray[num][i] && instance.openArray[num][i].indexOf(aux) > -1) {
            instance.openArray[num].splice(i, 1);
            i--;
            continue;
          }
          if (instance.openArray[num].length > 0 && instance.openArray[num][i]) {
            if (instance.openArray[num][i] && instance.openArray[num][i].indexOf(path) > -1) flag = false;
          }
        }
      }
      if (flag) {
        if (path == 'root-folder') {
          instance.openArray[num] = [];
        }
        instance.openArray[num].push(path);
      }
      for (var i = 0; i < instance.openArray[num].length; i++) {
        if (
          instance.openArray[num].length > 1 &&
          instance.openArray[num][i] &&
          instance.openArray[num][i].indexOf('root-folder') > -1
        ) {
          instance.openArray[num].splice(i, 1);
        }

        if (
          instance.openArray[num].length < 2 &&
          instance.openArray[num][i] &&
          instance.openArray[num][i].indexOf('root-folder') > -1 &&
          num != 'root-folder' &&
          mode != 'expand'
        ) {
          delete instance.openArray[num];
          break;
        }
      }

      CStudioAuthoring.ContextualNav.WcmAssetsFolder.storage.write(
        RootFolder().getStoredPathKey(instance),
        JSON.stringify(instance.openArray),
        360
      );
    },

    openLatest: function(instance) {
      var latestStored = instance.openArray;
      var index = instance.indexPath;

      if (Object.keys(latestStored).length >= 1) {
        var pathFlag = true;
        var treeEl = instance.rootFolderEl,
          site = treeEl.rootFolderSite,
          rootPath = treeEl.rootFolderPath,
          tree = (instance.tree = new YAHOO.widget.TreeView(treeEl)),
          paths = {},
          counter = {},
          recursiveCalls = {},
          tmp = {},
          k = {},
          pathTrace = {},
          rooth = {},
          updatePathTrace = function(j, key) {
            var appendedPath = paths[key] && paths[key][j] ? paths[key][j][counter[key][j]++] : '';
            appendedPath = appendedPath !== '' ? '/' + appendedPath : '';
            return (pathTrace[key][j] = pathTrace[key][j] + appendedPath);
          },
          nextPathTrace = function(j, key) {
            var cont = j == 0 ? 0 : counter[key][j] + 1;
            return pathTrace[key][j] + '/' + paths[key][j][counter[key][j]];
          };

        var YSelector = YAHOO.util.Selector.query;
        var label = instance.rootFolderEl.previousElementSibling;
        YDom.addClass(label, 'loading');
        var doCall = function(n, j, key) {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.onLoadNodeDataOnClick(n, function() {
            n.loadComplete();

            var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

            if (n.expanded && n.data.style.match(/\bfolder\b/)) {
              var iconsKey = n.instance.label;
              iconsKey = iconsKey.replace(/\s/g, '');

              var $el = $('#' + n.labelElId);
              $el.removeClass('closed');
              $el.addClass('open');
            }

            if (counter[key][j] < recursiveCalls[key][j]) {
              updatePathTrace(j, key);
              var node = tree.getNodesByProperty('path', pathTrace[key][j]);
              if (node != null) {
                RootFolder().getNumKey(node, key, function(currentNode) {
                  var loadEl = YSelector('.ygtvtp', currentNode.getEl(), true);
                  loadEl == null && (loadEl = YSelector('.ygtvlp', currentNode.getEl(), true));
                  YDom.addClass(loadEl, 'ygtvloading');
                  doCall(currentNode, j, key);
                });
              } else {
                YDom.removeClass(label, 'loading');
                YDom.removeClass(YSelector('.ygtvloading', treeEl), 'ygtvloading');
                RootFolder().firePathLoaded(instance);
              }
            } else {
              k[key]++;
              if (latestStored[key].length > k[key]) {
                pathTrace[key][k[key]] = rooth[key];
                counter[key][k[key]] = 0;
                (function() {
                  tmp[key][k[key]] = latestStored[key][k[key]].replace(rooth[key], '');
                  paths[key][k[key]] = tmp[key][k[key]].length
                    ? (tmp[key][k[key]].charAt(0) == '/' ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split('/')
                    : null;
                  recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                })();
                var node, loadEl;
                for (var i = 0; recursiveCalls[key][k[key]] > i; i++) {
                  if (tree.getNodeByProperty('path', nextPathTrace(k[key], key)) != null) {
                    updatePathTrace(k[key], key);
                  }
                }
                node = tree.getNodesByProperty('path', pathTrace[key][k[key]]);
                if (node == null) {
                  node = tree.getNodesByProperty('path', updatePathTrace(k[key], key));
                }

                if (node != null) {
                  RootFolder().getNumKey(node, key, function(currentNode) {
                    var loadEl = YSelector('.ygtvtp', currentNode.getEl(), true);
                    loadEl == null && (loadEl = YSelector('.ygtvlp', currentNode.getEl(), true));
                    YDom.addClass(loadEl, 'ygtvloading');
                    doCall(currentNode, k[key], key);
                  });
                }
              } else {
              }

              YDom.removeClass(label, 'loading');
              YDom.removeClass(YSelector('.ygtvloading', treeEl), 'ygtvloading');
              RootFolder().firePathLoaded(instance);
            }
          });
        };
        tree.setDynamicLoad(this.onLoadNodeDataOnClick);
        if (RootFolder().pathOnlyHasCannedSearch(rootPath, instance)) {
          var dummy = new Object();
          dummy.path = rootPath;
          var items = new Array();
          items.push(dummy);
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawTree(items, tree, null, instance, pathFlag);
          YDom.removeClass(label, 'loading');
          RootFolder().firePathLoaded(instance);
        } else {
          var ind = 0;
          var servPath;
          if (Object.prototype.toString.call(rootPath) === '[object Array]') {
            servPath = rootPath[ind];
          } else {
            servPath = rootPath;
          }

          (function(ind) {
            function treePrint(servPath) {
              CStudioAuthoring.Service.lookupSiteContent(site, servPath, 1, 'default', {
                success: function(treeData) {
                  var key = treeData.item.path.replace(/\//g, '').toLowerCase();
                  (paths[key] = []), (counter[key] = []), (recursiveCalls[key] = []), (tmp[key] = {});
                  (k[key] = 0), (pathTrace[key] = []), (rooth[key] = treeData.item.path);

                  // if(servPath == "/site/website")
                  window.treeData = treeData;

                  var items = treeData.item.children;
                  if (instance.showRootItem) {
                    items = new Array(treeData.item);

                    //add custom icon class
                    var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
                    var keyId = instance.label;
                    keyId = keyId.replace(/\s/g, '');

                    var $el = $('#' + instance.rootFolderEl.id)
                      .parent()
                      .find('>a');
                    $el.removeClass('closed');
                    $el.addClass('open');
                  }
                  instance.state = RootFolder().ROOT_OPEN;
                  CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawTree(items, tree, null, instance, pathFlag);
                  pathFlag = false;

                  if (latestStored[key] && latestStored[key][[key]] != RootFolder().ROOT_OPENED) {
                    pathTrace[key][k[key]] = treeData.item.path;
                    counter[key][k[key]] = 0;
                    (function() {
                      tmp[key][k[key]] = latestStored[key][k[key]].replace(treeData.item.path, '');
                      paths[key][k[key]] = tmp[key][k[key]].length
                        ? (tmp[key][k[key]].charAt(0) == '/' ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split('/')
                        : null;
                      recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                    })();
                    var nodes, node, loadEl;
                    nodes = tree.getNodesByProperty('path', treeData.item.path);
                    if (nodes != null) {
                      RootFolder().getNumKey(nodes, key, function(currentNode) {
                        node = currentNode;
                      });
                    }
                    if (node == null) {
                      node = tree.getNodeByProperty('path', updatePathTrace(k[key], key));
                      if (node != null) {
                        loadEl = YAHOO.util.Selector.query('.ygtvtp', node.getEl(), true);
                      }
                    } else {
                      loadEl = YAHOO.util.Selector.query('.ygtvlp', node.getEl(), true);
                    }
                    if (node == null) {
                      YDom.removeClass(label, 'loading');
                      RootFolder().firePathLoaded(instance);
                    } else {
                      YDom.addClass(loadEl, 'ygtvloading');
                      //YDom.setAttribute ( node , "index" ,instance.pathNumber  );
                      doCall(node, k[key], key);
                    }
                  } else {
                    YDom.removeClass(label, 'loading');
                    RootFolder().firePathLoaded(instance);
                  }
                  index = instance.indexPath++;

                  ind++;
                  if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                    servPath = rootPath[ind];
                  } else {
                    servPath = rootPath;
                  }
                  if (servPath && Object.prototype.toString.call(rootPath) === '[object Array]') {
                    treePrint(servPath);
                  }
                },
                failure: function() {}
              });
            }

            treePrint(servPath);
          })(ind);
        }
      } else {
        RootFolder().firePathLoaded(instance);
      }
    },

    /**
     * create a transfer object for a node
     */
    createTreeNodeTransferObject: function(treeItem) {
      var retTransferObj = new Object();
      retTransferObj.site = CStudioAuthoringContext.site;
      retTransferObj.internalName = treeItem.internalName;
      retTransferObj.sandboxId = treeItem.sandboxId;
      retTransferObj.link = '/NOTSET';
      retTransferObj.path = treeItem.path;
      retTransferObj.uri = treeItem.uri;
      retTransferObj.browserUri = treeItem.browserUri;
      retTransferObj.nodeRef = treeItem.nodeRef;
      retTransferObj.formId = treeItem.form;
      retTransferObj.formPagePath = treeItem.formPagePath;
      retTransferObj.isContainer = treeItem.container;
      retTransferObj.isComponent = true;
      retTransferObj.isAsset = treeItem.isAsset;
      retTransferObj.isNew = treeItem.isNew;
      retTransferObj.isLevelDescriptor = treeItem.levelDescriptor;
      retTransferObj.editedDate = '';
      retTransferObj.modifier = '';
      retTransferObj.pathSegment = treeItem.name;
      retTransferObj.sandboxLockOwner = treeItem.sandboxLockOwner;
      retTransferObj.sandboxLockStore = treeItem.sandboxLockStore;
      retTransferObj.scheduledDate = treeItem.scheduledDate;
      retTransferObj.previewable = treeItem.previewable;
      retTransferObj.mimeType = treeItem.mimeType;
      retTransferObj.contentType = treeItem.contentType;
      retTransferObj.isFloating = treeItem.isFloating;
      var itemNameLabel = 'Page';

      retTransferObj.statusObj = {
        deleted: treeItem.deleted,
        scheduled: treeItem.scheduled,
        disabled: treeItem.disabled,
        inFlight: treeItem.inFlight,
        inProgress: treeItem.inProgress,
        live: treeItem.live,
        submitted: treeItem.submitted
      };

      treeItem.component = true;

      retTransferObj.status = CStudioAuthoring.Utils.getContentItemStatus(treeItem).string;
      retTransferObj.style = CStudioAuthoring.Utils.getContentItemClassName(treeItem); // treeItem.container

      // spilt status and made it as comma seperated items.
      var statusStr = retTransferObj.status;
      if (retTransferObj.status.indexOf(' and ') != -1) {
        var statusArray = retTransferObj.status.split(' and ');
        if (statusArray && statusArray.length >= 2) {
          statusStr = '';
          for (var statusIdx = 0; statusIdx < statusArray.length; statusIdx++) {
            if (statusIdx == statusArray.length - 1) {
              statusStr += statusArray[statusIdx];
            } else {
              statusStr += statusArray[statusIdx] + ', ';
            }
          }
        }
      }

      if (treeItem.component) {
        itemNameLabel = 'Component';
      } else if (treeItem.document) {
        itemNameLabel = 'Document';
      }

      if (retTransferObj.internalName == '') {
        retTransferObj.internalName = treeItem.name;
      }

      if (retTransferObj.internalName == 'crafter-level-descriptor.level.xml') {
        retTransferObj.internalName = 'Section Defaults';
      }

      retTransferObj.label = retTransferObj.internalName;

      if (treeItem.container == true) {
        retTransferObj.fileName = treeItem.name;
      } else {
        retTransferObj.fileName = '';
      }

      if (treeItem.userFirstName != undefined && treeItem.userLastName != undefined) {
        retTransferObj.modifier = treeItem.userFirstName + ' ' + treeItem.userLastName;
      }

      var ttFormattedEditDate = '';
      if (treeItem.eventDate != '' && treeItem.eventDate != undefined) {
        var formattedEditDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.eventDate, studioTimeZone);
        retTransferObj.editedDate = formattedEditDate;
        ttFormattedEditDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.eventDate, studioTimeZone);
      }

      var icon = treeItem.folder
          ? CStudioAuthoring.Utils.createIcon('', RootFolder().defaultIcons.childClosed)
          : CStudioAuthoring.Utils.getContentItemIcon(treeItem),
        contentType = 'unknown' != retTransferObj.contentType ? retTransferObj.contentType : retTransferObj.mimeType;

      if (treeItem.scheduled == true) {
        retTransferObj.scheduledDate = treeItem.scheduledDate;

        formattedSchedDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.scheduledDate, studioTimeZone);
        retTransferObj.formattedScheduledDate = formattedSchedDate;
        var ttFormattedSchedDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.scheduledDate, studioTimeZone);

        retTransferObj.title = this.buildToolTipScheduled(
          retTransferObj.label,
          contentType,
          retTransferObj.style,
          statusStr,
          ttFormattedEditDate,
          retTransferObj.modifier,
          retTransferObj.lockOwner,
          itemNameLabel,
          ttFormattedSchedDate,
          icon
        );
      } else {
        retTransferObj.title = this.buildToolTipRegular(
          retTransferObj.label,
          contentType,
          retTransferObj.style,
          statusStr,
          ttFormattedEditDate,
          retTransferObj.modifier,
          retTransferObj.lockOwner,
          itemNameLabel,
          '',
          icon
        );
      }
      return retTransferObj;
    },

    /**
     * build the HTML for the scheduled tool tip.
     *
     */
    buildToolTipRegular: function(
      label,
      contentType,
      style,
      status,
      editedDate,
      modifier,
      lockOwner,
      itemNameLabel,
      nan,
      icon
    ) {
      if (!itemNameLabel) {
        itemNameLabel = 'Page';
      }

      label = CrafterCMSNext.util.string.escapeHTML(label);
      label = CStudioAuthoring.Utils.replaceWithASCIICharacter(label);

      return CStudioAuthoring.Utils.buildToolTip(
        itemNameLabel,
        label,
        contentType,
        style,
        status,
        editedDate,
        modifier,
        lockOwner,
        '',
        icon
      );
    },

    /**
     * build the HTML for the scheduled tool tip.
     *
     */
    buildToolTipScheduled: function(
      label,
      contentType,
      style,
      status,
      editedDate,
      modifier,
      lockOwner,
      itemNameLabel,
      schedDate,
      icon
    ) {
      var toolTip = '';
      if (!itemNameLabel) {
        itemNameLabel = 'Page';
      }

      label = CrafterCMSNext.util.string.escapeHTML(label);
      label = CStudioAuthoring.Utils.replaceWithASCIICharacter(label);

      try {
        toolTip = CStudioAuthoring.Utils.buildToolTip(
          itemNameLabel,
          label,
          contentType,
          style,
          status,
          editedDate,
          modifier,
          lockOwner,
          schedDate,
          icon
        );
      } catch (err) {
        console.log(err);
      }
      return toolTip;
    }
  };

  /**
   * instance object
   * CStudioAuthoring.ContextualNav.WcmAssetsFolder is static
   */
  CStudioAuthoring.ContextualNav.WcmAssetsFolderInstance = function(config) {
    this._self = this;
    this._toggleState = CStudioAuthoring.ContextualNav.WcmAssetsFolder.ROOT_CLOSED;
    this.rootFolderEl = null;

    this.type = config.name;
    this.label = config.params['label'];
    this.path = config.params['path'];
    this.showRootItem = config.params['showRootItem'] === 'true' ? true : false;
    this.onClickAction = config.params['onClick'] ? config.params['onClick'] : '';
    this.config = config;
  };

  CStudioAuthoring.Module.moduleLoaded('wcm-assets-folder', CStudioAuthoring.ContextualNav.WcmAssetsFolder);
})();
