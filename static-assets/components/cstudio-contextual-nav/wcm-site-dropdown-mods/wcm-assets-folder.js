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

(function () {
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
    initialize: function (config) {
      // When initializing, check if it's in preview and set the current previewed item into tree cookie
      if (CStudioAuthoringContext.isPreview && config.params.path === '/static-assets') {
        var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent()[0];
        //check if selected content is type asset
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

        //Setup child folders icon configuration
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

        //setup root folder icon configuration
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

        window.setTimeout(function () {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.openLatest(instance);
        }, 1000);
      }
    },

    /**
     * add a root level folder to the content drop down
     */
    addContentTreeRootFolder: function (instance) {
      var folderListEl = instance.config.containerEl;
      var WcmAssets = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      var parentFolderEl = document.createElement('div');

      var parentFolderLinkEl = document.createElement('a');
      parentFolderLinkEl.id = instance.label.toLowerCase() + '-tree';

      var label = instance.label.toLowerCase();
      label = label.replace(/ /g, '');
      var labelLangBundle = CMgs.format(siteDropdownLangBundle, label);
      label = labelLangBundle == label ? instance.label : labelLangBundle;

      //add custom icon class
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
    initializeContentTree: function (treeEl, path, instance) {
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
        success: function (treeData) {
          var items = treeData.item.children;

          if (instance.showRootItem) {
            items = new Array(treeData.item);
          }

          CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawTree(items, tree, path, instance);

          //add hover effect to nodes
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.nodeHoverEffects(this);

          YDom.removeClass(label, 'loading');
        },
        failure: function () {
          YDom.removeClass(label, 'loading');
        }
      });
    },

    getStoredPathKey: function (instance) {
      return CStudioAuthoringContext.site + '-' + instance.label.replace(' ', '').toLowerCase() + '-opened';
    },

    /**
     * render function called on root level elements
     */
    drawTree: function (treeItems, tree, pathToOpenTo, instance, uniquePath) {
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

      tree.subscribe('clickEvent', function (args) {
        CStudioAuthoring.ContextualNav.WcmAssetsFolder.onTreeNodeClick(args.node);
      });

      tree.subscribe('dblClickEvent', function (node) {
        return false;
      });

      tree.subscribe('expand', function (node) {
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

      tree.subscribe('collapse', function (node) {
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

      var contextMenu = new YAHOO.widget.ContextMenu(contextMenuId, {
        container: 'acn-context-menu',
        trigger: 'acn-dropdown-menu-wrapper',
        shadow: false,
        lazyload: true,
        zIndex: 1030
      });

      if (instance.IsContentMenuCreated == false) {
        instance.IsContentMenuCreated = true;
        contextMenu.subscribe(
          'beforeShow',
          function () {
            CStudioAuthoring.ContextualNav.WcmAssetsFolder.onTriggerContextMenu(tree, this, contextMenuId);
          },
          tree,
          false
        );
      }

      //if(uniquePath) {
      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
      nodeOpen = true;
      WcmAssetsFolder.treePaths.push(tree.id);
      (function (t, inst) {
        document.addEventListener(
          'crafter.refresh',
          function (e) {
            /*document.dispatchEvent(eventCM);*/
            try {
              if (e.data && e.data.length) {
                for (var i = 0; i < e.data.length; i++) {
                  RootFolder().refreshNodes(
                    e.data[i]
                      ? e.data[i]
                      : oCurrentTextNode != null
                      ? oCurrentTextNode
                      : CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                    true,
                    e.parent == false ? false : true,
                    t,
                    inst,
                    e.changeStructure,
                    e.typeAction
                  );
                }
              } else {
                RootFolder().refreshNodes(
                  e.data
                    ? e.data
                    : oCurrentTextNode != null
                    ? oCurrentTextNode
                    : CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                  true,
                  e.parent == false ? false : true,
                  t,
                  inst,
                  e.changeStructure,
                  e.typeAction
                );
              }
            } catch (er) {
              if (CStudioAuthoring.SelectedContent.getSelectedContent()[0]) {
                RootFolder().refreshNodes(
                  CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                  true,
                  e.parent == false ? false : true,
                  t,
                  inst,
                  e.changeStructure,
                  e.typeAction
                );
              }
            }

            if (typeof WcmDashboardWidgetCommon != 'undefined') {
              WcmDashboardWidgetCommon.refreshAllDashboards();
            }
          },
          false
        );
      })(tree, instance);
      //}

      contextMenu.subscribe(
        'show',
        function () {
          if (!YDom.isAncestor(tree.id, this.contextEventTarget)) {
            this.hide();
          }
          var idTree = tree.id.toString().replace(/-/g, '');
          RootFolder().myTree = RootFolder().myTreePages[idTree];
        },
        tree,
        false
      );

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
    },

    /**
     * render method called on sub root level elements
     */
    drawSubtree: function (treeItems, root, pathToOpenTo, instance) {
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
    drawTreeItem: function (treeNodeTO, root, instance) {
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

          //create spans for icons
          var childIcons = WcmAssets.customIcons[key].childIcons,
            childClosed = CStudioAuthoring.Utils.createIcon(childIcons.closed, '', 'on-closed'),
            childOpen = CStudioAuthoring.Utils.createIcon(childIcons.open, '', 'on-open');

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

        if (highlight) {
          window.setTimeout(function () {
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
    onRootFolderClick: function () {
      var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;

      WcmAssetsFolder.toggleFolderState(this.componentInstance, WcmAssetsFolder.ROOT_TOGGLE);
    },

    /**
     * toggle folder state
     */
    toggleFolderState: function (instance, forceState, path) {
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
    onLoadNodeDataOnClick: function (node, fnLoadComplete) {
      var path = encodeURI(node.treeNodeTO.path);
      var site = node.treeNodeTO.site;
      var pathToOpenTo = node.openToPath;

      CStudioAuthoring.Service.lookupSiteContent(site, path, 1, 'default', {
        success: function (treeData, args) {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.drawSubtree(
            treeData.item.children,
            node,
            args.pathToOpenTo,
            args.instance
          );

          args.fnLoadComplete();

          //add hove effect to nodes
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.nodeHoverEffects(this);
        },

        failure: function (err, args) {
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
    onTreeNodeClick: function (node) {
      if (node.data.previewable == true) {
        if (!node.data.isLevelDescriptor && !node.data.isContainer) {
          CStudioAuthoring.Operations.openPreview(node.data, '', false, false);
        }
      }

      return false;
    },

    expandTree: function (node, fnLoadComplete) {
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

    collapseTree: function (node, fnLoadComplete) {
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

    save: function (instance, path, fileName, num, mode) {
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

    openLatest: function (instance) {
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
          updatePathTrace = function (j, key) {
            var appendedPath = paths[key] && paths[key][j] ? paths[key][j][counter[key][j]++] : '';
            appendedPath = appendedPath !== '' ? '/' + appendedPath : '';
            return (pathTrace[key][j] = pathTrace[key][j] + appendedPath);
          },
          nextPathTrace = function (j, key) {
            var cont = j == 0 ? 0 : counter[key][j] + 1;
            return pathTrace[key][j] + '/' + paths[key][j][counter[key][j]];
          };
        var YSelector = YAHOO.util.Selector.query;
        var label = instance.rootFolderEl.previousElementSibling;
        YDom.addClass(label, 'loading');
        var doCall = function (n, j, key) {
          CStudioAuthoring.ContextualNav.WcmAssetsFolder.onLoadNodeDataOnClick(n, function () {
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
                RootFolder().getNumKey(node, key, function (currentNode) {
                  var loadEl = YSelector('.ygtvtp', currentNode.getEl(), true);
                  loadEl == null && (loadEl = YSelector('.ygtvlp', currentNode.getEl(), true));
                  YDom.addClass(loadEl, 'ygtvloading');
                  doCall(currentNode, j, key);
                });
              } else {
                YDom.removeClass(label, 'loading');
                YDom.removeClass(YSelector('.ygtvloading', treeEl), 'ygtvloading');
                // Add hover effect to nodes
                CStudioAuthoring.ContextualNav.WcmAssetsFolder.nodeHoverEffects(this);
                RootFolder().firePathLoaded(instance);
              }
            } else {
              k[key]++;
              if (latestStored[key].length > k[key]) {
                pathTrace[key][k[key]] = rooth[key];
                counter[key][k[key]] = 0;
                (function () {
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
                  RootFolder().getNumKey(node, key, function (currentNode) {
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
              // Add hover effect to nodes
              CStudioAuthoring.ContextualNav.WcmAssetsFolder.nodeHoverEffects(this);
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

          (function (ind) {
            function treePrint(servPath) {
              CStudioAuthoring.Service.lookupSiteContent(site, servPath, 1, 'default', {
                success: function (treeData) {
                  var key = treeData.item.path.replace(/\//g, '').toLowerCase();
                  (paths[key] = []), (counter[key] = []), (recursiveCalls[key] = []), (tmp[key] = {});
                  (k[key] = 0), (pathTrace[key] = []), (rooth[key] = treeData.item.path);

                  //if(servPath == "/site/website")
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
                    (function () {
                      tmp[key][k[key]] = latestStored[key][k[key]].replace(treeData.item.path, '');
                      paths[key][k[key]] = tmp[key][k[key]].length
                        ? (tmp[key][k[key]].charAt(0) == '/' ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split('/')
                        : null;
                      recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                    })();
                    var nodes, node, loadEl;
                    nodes = tree.getNodesByProperty('path', treeData.item.path);
                    if (nodes != null) {
                      RootFolder().getNumKey(nodes, key, function (currentNode) {
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
                failure: function () {}
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
    createTreeNodeTransferObject: function (treeItem) {
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
      retTransferObj.style = CStudioAuthoring.Utils.getContentItemClassName(treeItem); //, treeItem.container

      //spilt status and made it as comma seperated items.
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
    buildToolTipRegular: function (
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
    buildToolTipScheduled: function (
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
    },

    onTriggerContextMenu: function (tree, p_aArgs, contextMenuId) {
      target = p_aArgs.contextEventTarget;
      var aMenuItems;
      var menuWidth = '80px';
      var menuItems = {
        'separator-asset': {
          text: '<div>&nbsp;</div>',
          disabled: true,
          classname: 'menu-separator'
        },
        separator: [{ text: '<div>&nbsp;</div>', disabled: true, classname: 'menu-separator' }],
        assetsFolderMenu: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.uploadAsset, obj: tree }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'createFolder'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.createContainer,
              obj: tree
            }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'renameFolder'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.renameContainer,
              obj: tree
            }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'delete'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.deleteContainer,
              obj: tree
            }
          }
        ],
        assetsFolderMenuNoDelete: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.uploadAsset, obj: tree }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'createFolder'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.createContainer,
              obj: tree
            }
          }
        ],
        assetsFolderMenuNoCreateFolder: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.uploadAsset, obj: tree }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'delete'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.deleteContainer,
              obj: tree
            }
          }
        ],
        assetsFolderMenuNoDeleteNoCreateFolder: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.uploadAsset, obj: tree }
          }
        ],
        assetsMenu: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'delete'),
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.deleteContent, obj: tree }
          }
        ],
        assetsMenuNoDelete: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.overwriteAsset,
              obj: tree
            }
          }
        ],
        assetsFolderMenuRead: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'noActionsAvailable'),
            disabled: true,
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.uploadAsset, obj: tree }
          }
        ],

        assetsFolderTemplate: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'createTemplate'),
            disabled: false,
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.createNewTemplate,
              obj: tree
            }
          }
        ],

        assetsFolderScript: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'createController'),
            disabled: false,
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.createNewScript,
              obj: tree
            }
          }
        ],

        assetsMenuRead: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'upload'),
            disabled: true,
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.overwriteAsset,
              obj: tree
            }
          },
          {
            text: CMgs.format(siteDropdownLangBundle, 'delete'),
            disabled: true,
            onclick: { fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.deleteContent, obj: tree }
          }
        ],

        assetsMenuView: [
          {
            text: CMgs.format(siteDropdownLangBundle, 'view'),
            disabled: false,
            onclick: {
              fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.editTemplate,
              obj: 'read'
            }
          }
        ]
      };

      var targetNode = tree.getNodeByElement(target);

      if (targetNode != null && YDom.isAncestor(tree.id, p_aArgs.contextEventTarget)) {
        // Get the TextNode instance that that triggered the display of the ContextMenu instance.
        oCurrentTextNode = targetNode;

        var CSA = CStudioAuthoring;
        var formPath = oCurrentTextNode.data.formPagePath;
        var isContainer = oCurrentTextNode.data.isContainer;
        var isComponent = oCurrentTextNode.data.isComponent;
        var isLevelDescriptor = oCurrentTextNode.data.isLevelDescriptor;
        var menuId = YDom.get(contextMenuId);
        var isAssetsFolder = oCurrentTextNode.instance.type == 'wcm-assets-folder' ? true : false;
        p_aArgs.clearContent();

        //Get user permissions to get read write operations
        var checkPermissionsCb = {
          success: function (results) {
            var perms = results.permissions,
              isWrite = CSA.Service.isWrite(perms),
              isDeleteAllowed = CSA.Service.isDeleteAllowed(perms),
              isCreateFolder = CSA.Service.isCreateFolder(perms);

            if (isWrite == true) {
              RootFolder().IS_WRITE = true;
              if (this.isContainer) {
                this.menuWidth = '130px';
                if (isDeleteAllowed) {
                  if (isCreateFolder) {
                    this.aMenuItems = this.menuItems['assetsFolderMenu'].slice();
                  } else {
                    this.aMenuItems = this.menuItems['assetsFolderMenuNoCreateFolder'].slice();
                  }
                } else {
                  if (isCreateFolder) {
                    this.aMenuItems = this.menuItems['assetsFolderMenuNoDelete'].slice();
                  } else {
                    this.aMenuItems = this.menuItems['assetsFolderMenuNoDeleteNoCreateFolder'].slice();
                  }
                }
              } else {
                this.menuWidth = '130px';
                if (isDeleteAllowed) {
                  this.aMenuItems = this.menuItems['assetsMenu'].slice();
                } else {
                  this.aMenuItems = this.menuItems['assetsMenuNoDelete'].slice();
                }
              }

              if (oCurrentTextNode.data.uri.indexOf('/templates') != -1) {
                this.aMenuItems.push(this.menuItems['separator']);
                this.aMenuItems.push(this.menuItems['assetsFolderTemplate']);
              }

              if (oCurrentTextNode.data.uri.indexOf('/scripts') != -1) {
                this.aMenuItems.push(this.menuItems['assetsFolderScript']);
              }

              if (
                oCurrentTextNode.data.uri.indexOf('.ftl') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.js') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.css') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.groovy') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.html') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.hbs') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.xml') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.tmpl') != -1 ||
                oCurrentTextNode.data.uri.indexOf('.htm') != -1
              ) {
                // item is a template

                this.aMenuItems.push({
                  text: CMgs.format(siteDropdownLangBundle, 'edit'),
                  disabled: false,
                  onclick: { fn: CSA.ContextualNav.WcmAssetsFolder.editTemplate }
                });
              }
            } else {
              if (this.isContainer) {
                // this.menuWidth = "130px";
                // this.aMenuItems = this.menuItems["assetsFolderMenuRead"].slice();
                this.aMenuItems = [];
              } else {
                this.menuWidth = '100px';
                this.aMenuItems = this.menuItems['assetsMenuView'].slice();
              }
            }

            if (CSA.Utils.hasPerm(CSA.Constants.PERMISSION_WRITE, perms) && oCurrentTextNode.data.isContainer) {
              this.aMenuItems.push({
                text: CMgs.format(siteDropdownLangBundle, 'bulkUploadAssets'),
                onclick: { fn: CSA.ContextualNav.WcmAssetsFolder.bulkUpload }
              });
            }

            var isRelevant = !(oCurrentTextNode.data.status.toLowerCase().indexOf('live') !== -1);
            var isAssetsFolder = !oCurrentTextNode.isLeaf;

            if (isRelevant && !isAssetsFolder) {
              if (CStudioAuthoring.Service.isPublishAllowed(perms)) {
                this.aMenuItems.push({
                  text: CMgs.format(siteDropdownLangBundle, 'wcmContentApprove'),
                  onclick: {
                    fn: function () {
                      var callback = {
                        success: function (contentTO) {
                          var selectedContent = [];
                          selectedContent.push(contentTO.item);

                          CStudioAuthoring.Operations.approveCommon(
                            CStudioAuthoringContext.site,
                            selectedContent,
                            false
                          );
                        },
                        failure: function () {}
                      };

                      CStudioAuthoring.Service.lookupContentItem(
                        CStudioAuthoringContext.site,
                        oCurrentTextNode.data.uri,
                        callback,
                        false,
                        false
                      );
                    }
                  }
                });
              } else {
                this.aMenuItems.push({
                  text: CMgs.format(siteDropdownLangBundle, 'wcmContentSubmit'),
                  onclick: {
                    fn: function () {
                      var callback = {
                        success: function (contentTO) {
                          var selectedContent = [];
                          selectedContent.push(contentTO.item);

                          CStudioAuthoring.Operations.submitContent(CStudioAuthoringContext.site, selectedContent);
                        },
                        failure: function () {}
                      };

                      CStudioAuthoring.Service.lookupContentItem(
                        CStudioAuthoringContext.site,
                        oCurrentTextNode.data.uri,
                        callback,
                        false,
                        false
                      );
                    }
                  }
                });
              }
            }

            if (!this.isContainer) {
              this.aMenuItems.push({
                text: CMgs.format(siteDropdownLangBundle, 'history'),
                onclick: {
                  fn: CStudioAuthoring.ContextualNav.WcmAssetsFolder.revertContent,
                  obj: tree
                }
              });
            }

            this.aMenuItems.push({
              text: CMgs.format(siteDropdownLangBundle, 'wcmContentDependencies'),
              onclick: {
                fn: function () {
                  var callback = {
                    success: function (contentTO) {
                      var selectedContent = [];
                      selectedContent.push(contentTO.item);

                      CStudioAuthoring.Operations.viewDependencies(
                        CStudioAuthoringContext.site,
                        selectedContent,
                        false
                      );
                    },
                    failure: function () {}
                  };

                  CStudioAuthoring.Service.lookupContentItem(
                    CStudioAuthoringContext.site,
                    oCurrentTextNode.data.uri,
                    callback,
                    false,
                    false
                  );
                }
              }
            });

            if (isWrite == true) {
              this.aMenuItems.push(this.menuItems['separator-asset']);

              this.aMenuItems.push({
                text: CMgs.format(siteDropdownLangBundle, 'copy'),
                onclick: { fn: RootFolder().copyTree, obj: tree }
              });

              this.aMenuItems.push({
                text: CMgs.format(siteDropdownLangBundle, 'cut'),
                onclick: { fn: RootFolder().cutContent, obj: tree }
              });

              var checkClipboardCb = {
                success: function (collection) {
                  if (oCurrentTextNode.data.isContainer) {
                    if (collection.count > 0) {
                      if (isWrite == true) {
                        this.menuItems.push({
                          text: CMgs.format(siteDropdownLangBundle, 'paste'),
                          onclick: { fn: RootFolder().pasteContent }
                        });
                      } else {
                        this.menuItems.push({
                          text: CMgs.format(siteDropdownLangBundle, 'paste'),
                          disabled: true,
                          onclick: { fn: RootFolder().pasteContent }
                        });
                      }
                    }
                  }

                  this.args.addItems(this.menuItems);
                  this.menuEl.style.display = 'block';
                  this.menuEl.style.minWidth = this.menuWidth;
                  this.args.render();
                  this.args.show();
                },

                failure: function () {},

                args: this.p_aArgs,
                menuItems: this.aMenuItems,
                menuEl: this.menuId,
                menuWidth: this.menuWidth
              };

              /* Removing Paste option until copy/cut are implemented */
              CSA.Clipboard.getClipboardContent(checkClipboardCb);
              /* Remove these when add paste option */

              /*if(0 < this.aMenuItems.length){
             this.p_aArgs.addItems(this.aMenuItems);
             this.menuId.style.display = "block";
             this.menuId.style.minWidth = this.menuWidth;
             this.p_aArgs.render();
             this.p_aArgs.show();
             }*/

              if (!oCurrentTextNode.data.isContainer) {
                this.aMenuItems.push({
                  text: CMgs.format(siteDropdownLangBundle, 'duplicate'),
                  onclick: { fn: RootFolder().duplicateContent, obj: tree }
                });
              }
            }
          },
          failure: function () {}
        };
        checkPermissionsCb.menuItems = menuItems;
        checkPermissionsCb.aMenuItems = aMenuItems;
        checkPermissionsCb.menuWidth = menuWidth;
        checkPermissionsCb.menuId = menuId;
        checkPermissionsCb.p_aArgs = p_aArgs;
        checkPermissionsCb.oCurrentTextNode = oCurrentTextNode;
        checkPermissionsCb.isContainer = isContainer;
        CSA.Service.getUserPermissions(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, checkPermissionsCb);
      }
    },

    /**
     * Creates new container, Opens a dialog box to enter folder name
     */
    createContainer: function () {
      var createCb = {
        success: function () {
          RootFolder().refreshNodes(this.tree, false, false, null, null, true);
        },

        failure: function () {},

        callingWindow: window,
        tree: oCurrentTextNode
      };

      CStudioAuthoring.Operations.createFolder(
        CStudioAuthoringContext.site,
        oCurrentTextNode.data.uri,
        window,
        createCb
      );
    },

    renameContainer: function () {
      var createCb = {
        success: function () {
          RootFolder().refreshNodes(this.tree.parent, false, false, null, null, true);
        },

        failure: function () {},

        callingWindow: window,
        tree: oCurrentTextNode
      };

      CStudioAuthoring.Operations.renameFolder(
        CStudioAuthoringContext.site,
        oCurrentTextNode.data.uri,
        window,
        createCb
      );
    },

    /**
     * Edits the label of the TextNode that was the target of the
     * "contextmenu" event that triggered the display of the
     * ContextMenu instance.
     */
    editContent: function (contentTO, editorId, name, value, draft) {
      var path = oCurrentTextNode.data.uri;

      var editCb = {
        success: function () {
          if (CStudioAuthoringContext.isPreview) {
            try {
              CStudioAuthoring.Operations.refreshPreview();
            } catch (err) {
              if (!draft) {
                this.callingWindow.location.reload(true);
              }
            }
          } else {
            if (!draft) {
              this.callingWindow.location.reload(true);
            }
          }
          eventNS.data = oCurrentTextNode;
          eventNS.typeAction = '';
          document.dispatchEvent(eventNS);
        },

        failure: function () {},

        callingWindow: window
      };

      CStudioAuthoring.Operations.editContent(
        oCurrentTextNode.data.formId,
        CStudioAuthoringContext.site,
        path,
        oCurrentTextNode.data.nodeRef,
        path,
        false,
        editCb
      );
    },

    editTemplate: function (p_sType, p_aArgs, mode) {
      var path = oCurrentTextNode.data.uri;

      this.element.firstChild.style.pointerEvents = 'none';
      if (typeof CStudioAuthoring.editDisabled === 'undefined') {
        CStudioAuthoring.editDisabled = [];
      }
      CStudioAuthoring.editDisabled.push(this.element.firstChild);

      var editCb = {
        success: function () {
          if (CStudioAuthoringContext.isPreview) {
            try {
              CStudioAuthoring.Operations.refreshPreview();
            } catch (err) {
              this.callingWindow.location.reload(true);
            }
          } else {
            this.callingWindow.location.reload(true);
          }

          eventNS.data = oCurrentTextNode;
          eventNS.typeAction = '';
          document.dispatchEvent(eventNS);
        },

        failure: function () {},

        callingWindow: window
      };

      //CStudioAuthoring.Operations.openTemplateEditor(path, "default", editCb);
      CStudioAuthoring.Operations.editContent(
        oCurrentTextNode.data.formId,
        CStudioAuthoringContext.site,
        path,
        oCurrentTextNode.data.nodeRef,
        path,
        false,
        editCb,
        null,
        mode
      );
    },

    createNewTemplate: function () {
      CStudioAuthoring.Operations.createNewTemplate(oCurrentTextNode.data.uri, {
        success: function (templatePath) {
          RootFolder().refreshNodes(this.tree, false, false, null, null, true);
        },
        failure: function () {
          //this.callingWindow.location.reload(true);
        },

        callingWindow: window,
        tree: oCurrentTextNode
      });
    },

    createNewScript: function () {
      CStudioAuthoring.Operations.createNewScript(oCurrentTextNode.data.uri, {
        success: function (templatePath) {
          RootFolder().refreshNodes(this.tree, false, false, null, null, true);
        },
        failure: function () {},
        tree: oCurrentTextNode
      });
    },

    /**
     *	upload an asset to the target folder if it's a new asset
     */
    uploadAsset: function () {
      var uploadCb = {
        success: function () {
          CStudioAuthoring.Operations.refreshPreview();
          RootFolder().refreshNodes(this.tree, false, false, null, null, true);
        },

        failure: function () {},

        callingWindow: window,
        tree: oCurrentTextNode
      };

      CStudioAuthoring.Operations.uploadAsset(
        CStudioAuthoringContext.site,
        oCurrentTextNode.data.uri,
        'upload',
        uploadCb
      );
    },

    bulkUpload: function () {
      if (document.querySelector('#bulkUpload')) {
        const messages = CrafterCMSNext.i18n.messages.bulkUploadConfirmDialogMessages;

        const confirm = document.createElement('div');
        const onClose = () => {
          CrafterCMSNext.ReactDOM.unmountComponentAtNode(confirm);
        };
        CrafterCMSNext.render(confirm, 'ConfirmDialog', {
          title: CrafterCMSNext.i18n.intl.formatMessage(messages.title),
          description: CrafterCMSNext.i18n.intl.formatMessage(messages.description),
          onClose: onClose,
          onOk: onClose,
          open: true
        });
      } else {
        const bulkUpload = document.createElement('div');
        bulkUpload.setAttribute('id', 'bulkUpload');
        document.documentElement.append(bulkUpload);
        const onClose = (dropZoneStatus) => {
          CrafterCMSNext.ReactDOM.unmountComponentAtNode(bulkUpload);
          bulkUpload.remove();
          if (dropZoneStatus.uploadedFiles > 0) {
            RootFolder().refreshNodes(oCurrentTextNode, false, false, null, null, true);
          }
        };
        CrafterCMSNext.render(bulkUpload, 'BulkUpload', {
          path: oCurrentTextNode.data.path,
          site: oCurrentTextNode.data.site,
          maxSimultaneousUploads: 2,
          onClose: onClose,
          open: true
        });
      }
    },

    /**
     *	upload an asset to the target folder if it's a new asset
     */
    overwriteAsset: function () {
      var uploadCb = {
        success: function () {
          RootFolder().refreshNodes(this.tree, false, false, null, null, true);
        },

        failure: function () {},

        callingWindow: window,
        tree: oCurrentTextNode
      };

      CStudioAuthoring.Operations.uploadAsset(
        CStudioAuthoringContext.site,
        oCurrentTextNode.data.uri,
        'overwrite',
        uploadCb
      );
    },

    /**
     * Deletes the TextNode that was the target of the "contextmenu"
     * event that triggered the display of the ContextMenu instance.
     */
    deleteContent: function (p_sType, p_aArgs, tree) {
      CStudioAuthoring.Operations.deleteContent([oCurrentTextNode.data]);
    },

    /**
     * History
     *
     */
    revertContent: function (p_sType, p_aArgs, tree) {
      CStudioAuthoring.Operations.viewContentHistory(oCurrentTextNode.data, RootFolder().IS_WRITE);
    },

    /**
     *	Deletes a folder and contents in the target folder
     */
    deleteContainer: function (p_sType, p_aArgs, tree) {
      CStudioAuthoring.ContextualNav.WcmAssetsFolder.deleteContent(p_sType, p_aArgs, tree);
    },

    nodeHoverEffects: function (e) {
      var YDom = YAHOO.util.Dom,
        highlightWrpClass = 'highlight-wrapper',
        highlightColor = '#e2e2e2',
        overSetClass = 'over-effect-set',
        spanNodes = YAHOO.util.Selector.query(
          'span.yui-resize-label:not(.' + overSetClass + ')',
          'acn-dropdown-menu-wrapper'
        ),
        moverFn = function (evt) {
          var el = this,
            wrapEl = function (table) {
              var wrp = document.createElement('div');
              wrp.setAttribute('style', 'background-color:' + highlightColor);
              wrp.setAttribute('class', highlightWrpClass);
              YDom.insertBefore(wrp, table);
              wrp.appendChild(table);
              return wrp;
            };
          if (YDom.hasClass(el, highlightWrpClass)) {
            YDom.setStyle(el, 'background-color', highlightColor);
          } else if (YDom.hasClass(el, 'ygtvitem')) {
            var firstChild = YDom.getFirstChild(el);
            YDom.hasClass(firstChild, highlightWrpClass)
              ? YDom.setStyle(firstChild, 'background-color', highlightColor)
              : wrapEl(firstChild);
          } else {
            var parent = el.parentNode;
            YDom.hasClass(parent, highlightWrpClass)
              ? YDom.setStyle(parent, 'background-color', highlightColor)
              : wrapEl(el);
          }
          if (RootFolder().lastSelectedTextNode != null) {
            var currentlySelectedTextNode = el;
            if (currentlySelectedTextNode == RootFolder().lastSelectedTextNode) return;
            (YDom.hasClass(RootFolder().lastSelectedTextNode, highlightWrpClass)
              ? RootFolder().lastSelectedTextNode
              : YDom.hasClass(RootFolder().lastSelectedTextNode, 'ygtvitem')
              ? YDom.getFirstChild(RootFolder().lastSelectedTextNode)
              : RootFolder().lastSelectedTextNode.parentNode
            ).style.backgroundColor = '';

            RootFolder().lastSelectedTextNode = null;
          }

          var nodeId = ('' + el.id).replace('table', 'label');
          var node = RootFolder().treeNodes[nodeId];
        },
        moutFn = function (evt) {
          if (RootFolder().lastSelectedTextNode != null) return;
          var el = this;
          (YDom.hasClass(el, highlightWrpClass)
            ? el
            : YDom.hasClass(el, 'ygtvitem')
            ? YDom.getFirstChild(el)
            : el.parentNode
          ).style.backgroundColor = '';
        };
      for (var i = 0, l = spanNodes.length, span = spanNodes[0], barItem; i < l; i++, span = spanNodes[i]) {
        // span -> td -> tr -> tbody -> table
        barItem = span.parentNode.parentNode.parentNode.parentNode;
        if (barItem) {
          YEvent.addListener(barItem, 'mouseover', moverFn);
          YEvent.addListener(barItem, 'mouseout', moutFn);
          YDom.addClass(span, overSetClass);
        }
      }
    }
  };

  /**
   * instance object
   * CStudioAuthoring.ContextualNav.WcmAssetsFolder is static
   */
  CStudioAuthoring.ContextualNav.WcmAssetsFolderInstance = function (config) {
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
