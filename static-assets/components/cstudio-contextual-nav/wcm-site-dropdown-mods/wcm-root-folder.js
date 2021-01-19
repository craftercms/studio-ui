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

(function() {
  var YDom = YAHOO.util.Dom,
    YEvent = YAHOO.util.Event,
    YConnect = YAHOO.util.Connect,
    sutils = CStudioAuthoring.StringUtils,
    storage = CStudioAuthoring.Storage,
    counter = 0, // Used to identify the contextmenu for each instances. May be used for any other purpose while numberic chronological order is maintained
    Self = null; // Local reference to CStudioAuthoring.ContextualNav.WcmRootFolder initialized by CStudioAuthoring.register call

  if (YAHOO.lang && !YAHOO.lang.escapeHTML) {
    // YUI version conflicts
    YAHOO.lang.escapeHTML = function(val) {
      return val;
    };
  }

  /**
   * WcmRootFolder
   * A root level folder is a configurable folder element that can be based at any
   * point along a wcm path.
   */
  Self = CStudioAuthoring.register({
    'ContextualNav.WcmRootFolder': {
      ROOT_OPENED: 'root-folder',
      ROOT_OPEN: 'open',
      ROOT_CLOSED: 'closed',
      ROOT_TOGGLE: 'toggle',
      CUT_STYLE_RGB: 'rgb(159, 182, 205)',
      CUT_STYLE: '#9FB6CD',
      IS_WRITE: false,
      searchesToWire: [],
      myTree: null,
      myTreePages: [],
      myTreeAssets: [],
      currentTextNode: null,
      copiedItem: null,
      cutItem: null,
      instanceCount: 0,
      lastSelectedTextNode: null, // used for holding last selected node; to use it to hold hover effect on a text node when cotex menu is open.
      treePaths: [],
      menuOn: false,
      treePathOpenedEvt: new YAHOO.util.CustomEvent('wcmRootFolderTreePathLoaded', Self),
      labelsMenu: [],
      customIcons: {},
      defaultIcons: {
        pages: 'fa-file-text-o',
        components: 'fa-puzzle-piece',
        defaultIcon: 'fa-folder',
        childOpen: 'fa-folder-open-o',
        childClosed: 'fa-folder-o',
        navPage: 'fa-file',
        floatingPage: 'fa-file-o',
        component: 'fa-puzzle-piece',
        taxonomy: 'fa-tags'
      },
      /**
       * initialize module
       */
      initialize: function(config) {
        var Self = this;

        // When initializing, check if it's in preview and set the current previewed item into tree cookie
        if (CStudioAuthoringContext.isPreview && config.params.path === '/site/website') {
          var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent()[0];
          // check if selected content is type page
          if (selectedContent != null && selectedContent.isPage) {
            CStudioAuthoring.Operations.updateTreeCookiePath('pages', 'sitewebsite', selectedContent.uri);
          }
        }

        if (config.name === 'wcm-root-folder') {
          var instance = new CStudioAuthoring.ContextualNav.WcmRootFolderInstance(config);
          instance.cannedSearchCache = [];
          instance.excludeCache = [];
          instance.excludeRegexCache = [];
          instance.openArray = {};
          var latestStored = storage.read(Self.getStoredPathKey(instance));
          if (latestStored) {
            if (
              latestStored.indexOf(',') !== -1 ||
              latestStored.indexOf('[') !== -1 ||
              latestStored.indexOf('{') !== -1
            ) {
              instance.openArray = JSON.parse(latestStored);
            } else {
              instance.openArray = [];
              instance.openArray.push(latestStored);
            }
          }
          instance.pathNumber = 0;

          var key = config.params.label;
          key = key.replace(/\s/g, '');
          Self.customIcons[key] = {
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
            Self.customIcons[key].childIcons.open.icon.class = config.params['child-icon-open'].class;
          } else {
            // default open folder icon
            Self.customIcons[key].childIcons.open.icon.class = Self.defaultIcons.childOpen;
          }
          if (config.params['child-icon-open'] && config.params['child-icon-open'].styles) {
            Self.customIcons[key].childIcons.open.icon.styles = config.params['child-icon-open'].styles;
          }
          if (config.params['child-icon-closed'] && config.params['child-icon-closed'].class) {
            Self.customIcons[key].childIcons.closed.icon.class = config.params['child-icon-closed'].class;
          } else {
            // default closed folder icon
            Self.customIcons[key].childIcons.closed.icon.class = Self.defaultIcons.childClosed;
          }
          if (config.params['child-icon-closed'] && config.params['child-icon-closed'].styles) {
            Self.customIcons[key].childIcons.closed.icon.styles = config.params['child-icon-closed'].styles;
          }

          var module;

          // setup root folder icon configuration
          if (config.params['module-icon-open'] && config.params['module-icon-open'].class) {
            Self.customIcons[key].moduleIcons.open.icon.class = config.params['module-icon-open'].class;
          } else {
            module = key.toLowerCase();

            if (Self.defaultIcons[module]) {
              Self.customIcons[key].moduleIcons.open.icon.class = Self.defaultIcons[module];
            } else {
              Self.customIcons[key].moduleIcons.open.icon.class = Self.defaultIcons.defaultIcon;
            }
          }
          if (config.params['module-icon-open'] && config.params['module-icon-open'].styles) {
            Self.customIcons[key].moduleIcons.open.icon.styles = config.params['module-icon-open'].styles;
          }
          if (config.params['module-icon-closed'] && config.params['module-icon-closed'].class) {
            Self.customIcons[key].moduleIcons.closed.icon.class = config.params['module-icon-closed'].class;
          } else {
            module = key.toLowerCase();

            if (Self.defaultIcons[module]) {
              Self.customIcons[key].moduleIcons.closed.icon.class = Self.defaultIcons[module];
            } else {
              Self.customIcons[key].moduleIcons.closed.icon.class = Self.defaultIcons.defaultIcon;
            }
          }
          if (config.params['module-icon-closed'] && config.params['module-icon-closed'].styles) {
            Self.customIcons[key].moduleIcons.closed.icon.styles = config.params['module-icon-closed'].styles;
          }

          if (config.params.mods) {
            if (typeof config.params.mods == 'object' && typeof config.params.mods.mod != 'array') {
              config.params.mods = [config.params.mods.mod];
            }

            for (var m = 0; m < config.params.mods.length; m++) {
              // load modules
              var mod = config.params.mods[m];

              CStudioAuthoring.Module.requireModule(
                mod.name,
                '/static-assets/components/cstudio-contextual-nav/wcm-site-dropdown-mods/root-folder-mods/' +
                  mod.name +
                  '.js',
                { config: mod },
                {
                  context: instance,
                  moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
                    this.context.mods[this.context.mods.length] = moduleClass;
                    moduleClass.init(moduleConfig);
                  }
                }
              );
            }
          }
          if (config.params.excludes && typeof config.params.excludes == 'object') {
            if (config.params.excludes.exclude) {
              this.creatingExcludeArray(config.params.excludes.exclude, instance.excludeCache);
            }
            if (config.params.excludes.regex) {
              this.creatingExcludeArray(config.params.excludes.regex, instance.excludeRegexCache);
            }
          }

          // cache the searches by name so they can be checked quickly when building the nav
          if (config.params.cannedSearches) {
            // not an array
            if (
              typeof config.params.cannedSearches == 'object' &&
              config.params.cannedSearches.cannedSearch.length == undefined
            ) {
              if (config.params.cannedSearches.cannedSearch != undefined) {
                var searchPath = config.params.cannedSearches.cannedSearch.path;
                if (!instance.cannedSearchCache[searchPath]) {
                  instance.cannedSearchCache[searchPath] = [];
                }
                instance.cannedSearchCache[searchPath].push(config.params.cannedSearches.cannedSearch);
              }
            } else {
              for (var i = 0; i < config.params.cannedSearches.cannedSearch.length; i++) {
                var searchPath = config.params.cannedSearches.cannedSearch[i].path;
                if (!instance.cannedSearchCache[searchPath]) {
                  instance.cannedSearchCache[searchPath] = [];
                }
                instance.cannedSearchCache[searchPath].push(config.params.cannedSearches.cannedSearch[i]);
              }
            }
          }
          this.addContentTreeRootFolder(instance);

          var contOpenTreeTimes = 0;
          var openTreeFn = function(instance, thisComponent) {
            var readyToLoad = true;
            if (instance.mods.length > 0) {
              for (var m = 0; m < instance.mods.length; m++) {
                var mod = instance.mods[m];
                if (mod.readyToLoad == false) {
                  readyToLoad = false;
                  break;
                }
              }
            }

            if (readyToLoad || contOpenTreeTimes < 5) {
              contOpenTreeTimes = 0;
              if (YAHOO.util.Dom.getStyle('acn-dropdown-menu-wrapper', 'display') != 'none') {
                window.firstClick = true;
                thisComponent.openLatest(instance);
              }
              YEvent.on('acn-dropdown-toggler', 'click', function() {
                if (!window.firstClick && YAHOO.util.Dom.getStyle('acn-dropdown-menu-wrapper', 'display') != 'none') {
                  window.firstClick = true;
                  thisComponent.openLatest(instance);
                }
                this.blur();
              });

              Self.wireUpCannedSearches();
            } else {
              // give mods a bit of time to load then try again
              contOpenTreeTimes++;
              setTimeout(openTreeFn, 1000, instance, thisComponent);
            }
          };

          setTimeout(openTreeFn, 1000, instance, this);
        }
      },

      /**
       * add a root level folder to the content drop down
       */
      addContentTreeRootFolder: function(instance) {
        var folderListEl = instance.config.containerEl;
        var parentFolderEl = document.createElement('div');
        var parentFolderLinkEl = document.createElement('a');
        parentFolderLinkEl.id = instance.label.toLowerCase() + '-tree'; // should be part of class no?
        var label = instance.label.toLowerCase();
        label = label.replace(/ /g, '');
        var labelLangBundle = CMgs.format(siteDropdownLangBundle, label);
        label = labelLangBundle == label ? instance.label : labelLangBundle;

        // add custom icon class
        var key = instance.label;
        key = key.replace(/\s/g, '');

        // create spans for icons
        var moduleIcons = Self.customIcons[key].moduleIcons,
          moduleClosed = CStudioAuthoring.Utils.createIcon(moduleIcons.closed, '', 'on-closed'),
          moduleOpen = CStudioAuthoring.Utils.createIcon(moduleIcons.open, '', 'on-open');

        parentFolderLinkEl.appendChild(moduleClosed);
        parentFolderLinkEl.appendChild(moduleOpen);
        parentFolderLinkEl.appendChild($('<span />').text(label).get(0));

        parentFolderLinkEl.onclick = Self.onRootFolderClick;
        parentFolderLinkEl.componentInstance = instance;

        var treeEl = document.createElement('div');
        folderListEl.appendChild(parentFolderEl);
        parentFolderEl.appendChild(parentFolderLinkEl);
        parentFolderEl.appendChild(treeEl);

        YDom.addClass(parentFolderLinkEl, 'acn-parent-folder');
        parentFolderLinkEl.style.cursor = 'pointer';
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
        var pathFlag = true;

        var tree = (instance.tree = new YAHOO.widget.TreeView(treeEl));

        tree.setDynamicLoad(this.onLoadNodeDataOnClick);
        /* tree.subscribe("collapse", function(node) {this.collapseTree});
                tree.subscribe("expand", function(node) {this.expandTree}); */

        tree.FOCUS_CLASS_NAME = null;

        var label = treeEl.previousElementSibling;
        YDom.addClass(label, 'loading');

        // reduce call if not necessary
        if (this.pathOnlyHasCannedSearch(rootPath, instance)) {
          var dummy = new Object();
          dummy.path = rootPath;
          var items = new Array();
          items.push(dummy);
          Self.drawTree(items, tree, path, instance, pathFlag);
          YDom.removeClass(label, 'loading');
        } else {
          var pathLength;
          if (Object.prototype.toString.call(rootPath) === '[object Array]') {
            pathLength = rootPath.length ? rootPath.length : 1;
          } else {
            pathLength = 1;
          }

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
                openToPath: pathToOpen,
                success: function(treeData) {
                  YDom.removeClass(label, 'loading');
                  // if(servPath == "/site/website")
                  window.treeData = treeData;

                  var items = treeData.item.children;
                  if (instance.showRootItem) {
                    items = new Array(treeData.item);
                  }
                  Self.drawTree(items, tree, path, instance, pathFlag);
                  pathFlag = false;

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

                failure: function() {
                  YDom.removeClass(label, 'loading');
                }
              });
            }

            treePrint(servPath);
          })(ind);
        }
      },

      /**
       * to check, if extra ajax call can be reduced
       */
      pathOnlyHasCannedSearch: function(path, instance) {
        if (!instance.showRootItem && instance.cannedSearchCache && instance.cannedSearchCache[path]) return true;
        return false;
      },

      /**
       * creating Exclude Array
       */
      creatingExcludeArray: function(exclude, excludeCache) {
        if (exclude) {
          const excludes = Array.isArray(exclude) ? exclude : [exclude];

          excludes.forEach(function(path) {
            if (!excludeCache[path]) {
              excludeCache[path] = [];
            }
            excludeCache[path].push(path);
          });
        }
      },

      /**
       * is Exclude
       */
      isExcludeFromNav: function(path, instance) {
        var regex;
        if (instance.excludeCache[path]) {
          return true;
        }
        for (const excludeRegexCache in instance.excludeRegexCache) {
          regex = RegExp(excludeRegexCache, 'g');
          if (regex.test(path)) {
            return true;
          }
        }
        return false;
      },

      /**
       * render function called on root level elements
       */
      drawTree: function(treeItems, tree, pathToOpenTo, instance, uniquePath) {
        self = this;

        var treeNodes = [];
        var treeNodesLabels = new Array();
        var currentLevelPath = null;
        var remainingPath = null;
        var nodeToOpen = null;

        if (pathToOpenTo != null && pathToOpenTo != undefined) {
          var pathParts = pathToOpenTo.split('/');

          if (pathParts.length >= 2) {
            currentLevelPath = '/' + pathParts[1];
            remainingPath = pathToOpenTo.substring(currentLevelPath.length + 1);
          }
        }

        if (instance.mods) {
          for (var m = 0; m < instance.mods.length; m++) {
            var mod = instance.mods[m];
            if (mod.sortTreeItems) {
              treeItems = mod.sortTreeItems(treeItems);
            }
          }
        }

        for (var i = 0; i < treeItems.length; i++) {
          var exclude = this.isExcludeFromNav(treeItems[i].path, instance);

          if (instance.mods) {
            for (var m = 0; m < instance.mods.length; m++) {
              var mod = instance.mods[m];
              exclude = mod.filterItem(treeItems[i]);
            }
          }

          var cannedSearches = instance.cannedSearchCache[treeItems[i].path];
          var isSearch = false;
          var linkSearch = false;

          if (cannedSearches) {
            for (var l = 0; l < cannedSearches.length; l++) {
              if (cannedSearches[l].insertAs == 'replace') {
                this.drawCannedSearch(cannedSearches[l], tree.getRoot());
                isSearch = true;
              } else if (cannedSearches[l].insertAs == 'append') {
                this.drawCannedSearch(cannedSearches[l], tree.getRoot());
                isSearch = false;
              }
            }
          }

          if (!treeItems[i].hideInAuthoring) {
            if (!isSearch && exclude == false) {
              var treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);

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
              if (treeNode.labelElId) {
                treeNodesLabels.push(treeNode.labelElId);
              } else {
                treeNodesLabels.push(tree.root.children[i].labelElId);
              }
            }
          }
        }

        document.addEventListener(
          'setContentDone',
          function() {
            var checkRenderingTemplates = function(renderingTemplates) {
              var noTemplate = true;
              for (var x = 0; x < renderingTemplates.length; x++) {
                if (renderingTemplates[x].uri != '') {
                  noTemplate = false;
                }
              }
              return noTemplate;
            };

            var icePanel = document.getElementById('ice-tools-panel-elem'),
              editTemplateEl;

            if (icePanel) {
              editTemplateEl = icePanel.getElementsByClassName('edit-code template')[0].firstChild;

              if (
                checkRenderingTemplates(CStudioAuthoring.SelectedContent.getSelectedContent()[0].renderingTemplates)
              ) {
                editTemplateEl.setAttributeNode(document.createAttribute('disabled'));
                editTemplateEl.style.pointerEvents = 'none';
              } else {
                editTemplateEl.removeAttribute('disabled');
                editTemplateEl.style.pointerEvents = '';
              }
            }
          },
          false
        );

        for (var i = 0; i < treeNodesLabels.length; i++) {
          Self.labelsMenu.push(treeNodesLabels[i]);
        }

        new YAHOO.widget.Tooltip('acn-context-tooltipWrapper', {
          context: Self.labelsMenu,
          hidedelay: 0,
          showdelay: 1000,
          container: 'acn-context-tooltip'
        });

        tree.subscribe('clickEvent', function(args) {
          var idTree = tree.id.toString().replace(/-/g, '');
          Self.myTree = Self.myTreePages[idTree];
          Self.onTreeNodeClick(args.node);

          // Prevent the default behavior (i.e. expand/collapse) of links that should take the user to preview
          if (args.node.data.linkToPreview) {
            return false;
          }
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
          self.expandTree(node);

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

          self.collapseTree(node);

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

        if (uniquePath) {
          nodeOpen = true;
          self.treePaths.push(tree.id);
        }

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
        instance.pathNumber++;
        if (instance.path.length - 1 < instance.pathNumber) {
          instance.pathNumber = 0;
        }

        Self.wireUpCannedSearches();

        if (nodeToOpen != null) {
          // opening to a specific path
          nodeToOpen.expand();
          nodeToOpen.openToPath = remainingPath;
        }

        instance.firstDraw = true;

        var treeId = tree.id.toString().replace(/-/g, '');
        Self.myTreePages[treeId] = tree;

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
            const tree = Self.myTreePages[treeId];
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
                const targetNode = tree.getNodeByProperty(
                  'path',
                  CrafterCMSNext.util.path.withoutIndex(payload.target)
                );
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
                const targetNode = tree.getNodeByProperty(
                  'path',
                  CrafterCMSNext.util.path.getParentPath(payload.target)
                );
                if (targetNode) {
                  Self.refreshNodes(targetNode, true, false, tree, null, true);
                }
                break;
              }
              case 'FOLDER_CREATED': {
                const targetNode = tree.getNodeByProperty(
                  'path',
                  CrafterCMSNext.util.path.withoutIndex(payload.target)
                );
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

        var parentCannedSearch = instance.cannedSearchCache[root.treeNodeTO.path];
        var replaceChildren = new Array();

        if (parentCannedSearch) {
          for (var j = 0; j < parentCannedSearch.length; j++) {
            if (parentCannedSearch[j].insertAs == 'replaceAllChildFolders') {
              replaceAllChildFolders = true;
              break;
            }
          }
        }

        if (instance.mods) {
          for (var m = 0; m < instance.mods.length; m++) {
            var mod = instance.mods[m];
            if (mod.sortTreeItems) {
              treeItems = mod.sortTreeItems(treeItems);
            }
          }
        }

        for (var i = 0, l = treeItems.length, treeNodeTO, renderChild; i < l; i++) {
          var exclude = this.isExcludeFromNav(treeItems[i].path, instance);

          if (instance.mods) {
            for (var m = 0; m < instance.mods.length; m++) {
              var mod = instance.mods[m];
              exclude = mod.filterItem(treeItems[i]);
            }
          }

          treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);
          if (
            treeNodeTO.isLevelDescriptor ||
            treeNodeTO.isComponent ||
            treeNodeTO.container == false ||
            treeNodeTO.name == 'index.xml' ||
            (treeNodeTO.isContainer == true && treeNodeTO.pathSegment != 'index.xml') ||
            treeNodeTO.previewable == false
          ) {
            treeNodeTO.style += ' no-preview';
          } else {
            treeNodeTO.style += ' preview';
          }

          renderChild = true;

          if (replaceAllChildFolders && treeNodeTO.isContainer) {
            renderChild = false;
          }

          if (renderChild && exclude == false) {
            if (!treeItems[i].hideInAuthoring) {
              var itemCannedSearch = instance.cannedSearchCache[treeNodeTO.path];

              if (itemCannedSearch && itemCannedSearch.length != 0 && itemCannedSearch[0].insertAs != 'append') {
                replaceChildren.push(treeNodeTO.path);
              } else {
                var treeNode = this.drawTreeItem(treeNodeTO, root, instance);
                // nodes will not have collapse/expand icon if they do not have any children
                if (treeItems[i].numOfChildren == 0) {
                  treeNode.isLeaf = true;
                }
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
          }
        }

        // done here so searches show up at the bottom
        if (replaceAllChildFolders) {
          for (var k = 0; k < parentCannedSearch.length; k++) {
            this.drawCannedSearch(parentCannedSearch[k], root);
          }
        } else if (replaceChildren.length > 0) {
          for (var i = 0; i < replaceChildren.length; i++) {
            var itemCannedSearch = instance.cannedSearchCache[replaceChildren[i]];

            for (var k = 0; k < itemCannedSearch.length; k++) {
              if (itemCannedSearch[k].insertAs == 'replace') {
                this.drawCannedSearch(itemCannedSearch[k], root);
              }
            }
          }
        }

        for (var i = 0; i < treeNodesLabels.length; i++) {
          Self.labelsMenu.push(treeNodesLabels[i]);
        }

        new YAHOO.widget.Tooltip('acn-context-tooltipWrapper', {
          context: Self.labelsMenu,
          hidedelay: 0,
          showdelay: 1000,
          container: 'acn-context-tooltip'
        });

        if (nodeToOpen) {
          nodeToOpen.expand();
          // nodeToOpen.openToPath = remainingPath;
        }
      },

      /**
       * draw a canned search element
       */
      drawCannedSearch: function(searchConfig, root) {
        var treeNode = null;
        var searchId = CStudioAuthoring.Utils.generateUUID();
        var newId = CStudioAuthoring.Utils.generateUUID();
        if (searchConfig.newPath && !window.pasteFlag) {
          var label =
            "<a style='display: inline; padding-right:5px;' id='ID' href='#' class='canned-search-el'>LABEL</a><a style='display: inline; border-left: 1px solid grey; padding-left: 5px;' id='NEWID' href='#'>+add</a>";

          label = label.replace('ID', searchId);
          label = label.replace('LABEL', searchConfig.label);
          label = label.replace('NEWID', newId);

          searchConfig.label = label;

          treeNode = new YAHOO.widget.TextNode(searchConfig, root, false);
          Self.searchesToWire.push(treeNode);
        } else {
          searchConfig.label =
            "<a style='display: inline;' id='" + searchId + "' href='#'>" + searchConfig.label + '</a>';

          treeNode = new YAHOO.widget.TextNode(searchConfig, root, false);

          Self.searchesToWire.push(treeNode);
        }

        treeNode.nodeType = 'SEARCH';
        treeNode.searchTO = searchConfig;
        treeNode.searchTO.newId = newId;
        treeNode.searchTO.searchId = searchId;
        treeNode.renderHidden = true;
        treeNode.nowrap = true;
        treeNode.isLeaf = true;
        treeNode.labelStyle = 'acn-canned-search yui-resize-label';
        treeNode._yuiGetHtml = treeNode.getHtml();

        treeNode.getHtml = function() {
          var markup = treeNode._yuiGetHtml;
          markup = markup.replace(/\&gt;/g, '>');
          markup = markup.replace(/\&lt;/g, '<');
          markup = markup.replace(/\&amp;/g, '&');
          markup = markup.replace(/\&#x27;/g, "'");
          markup = markup.replace(/\&#x2F;/g, '/');

          return markup;
        };
        return treeNode;
      },
      /**
       * render a tree item
       */
      drawTreeItem: function(treeNodeTO, root, instance) {
        var _self = this,
          isPreview = CStudioAuthoringContext.isPreview,
          isLevelDescriptor = '/component/level-descriptor' === treeNodeTO.contentType,
          currentPreviewed = CStudioAuthoring.SelectedContent.getSelectedContent(),
          highlight = false;

        if (isPreview && currentPreviewed[0] && currentPreviewed[0].path === treeNodeTO.path && !isLevelDescriptor) {
          highlight = true;
        }

        if (treeNodeTO.container == true || treeNodeTO.name != 'index.xml') {
          var nodeSpan = document.createElement('div');

          if (!treeNodeTO.style.match(/\bfolder\b/)) {
            treeNodeTO.linkToPreview = true;

            var icon = CStudioAuthoring.Utils.getContentItemIcon(treeNodeTO);
            nodeSpan.appendChild(icon);
          } else {
            var key = instance.label;
            key = key.replace(/\s/g, '');

            // create spans for icons
            var childIcons = Self.customIcons[key].childIcons,
              childClosed = CStudioAuthoring.Utils.createIcon(childIcons.closed, '', 'on-closed'),
              childOpen = CStudioAuthoring.Utils.createIcon(childIcons.open, '', 'on-open');

            nodeSpan.appendChild(childClosed);
            nodeSpan.appendChild(childOpen);
          }

          nodeSpan.innerHTML += treeNodeTO.statusObj.deleted
            ? treeNodeTO.path
            : CrafterCMSNext.util.string.escapeHTML(treeNodeTO.label);
          const tooltip = treeNodeTO.statusObj.deleted
            ? `<div class=\'width300 acn-tooltip\'>${CrafterCMSNext.i18n.intl.formatMessage(
                CrafterCMSNext.i18n.messages.wcmRootFolder.pathNotFound,
                { path: treeNodeTO.path }
              )}</div>`
            : treeNodeTO.title;
          nodeSpan.setAttribute('title', tooltip);
          nodeSpan.className = `${treeNodeTO.style} yui-resize-label treenode-label over-effect-set ${treeNodeTO
            .statusObj.deleted && 'warning'} ${highlight && 'highlighted'}`;

          if (!isLevelDescriptor) {
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

          treeNode.html.id = 'ygtvlabelel' + treeNode.index;
          treeNode.labelElId = 'ygtvlabelel' + treeNode.index;
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
              self.scrollToHighlighted();
            }, 500);
          }

          if (!treeNodeTO.isContainer) {
            treeNode.isLeaf = true;
          }
        }

        if (instance.mods) {
          for (var m = 0; m < instance.mods.length; m++) {
            var mod = instance.mods[m];
            treeNode = mod.drawTreeItem(treeNodeTO, root, treeNode);
          }
        }

        return treeNode;
      },
      /**
       *
       */
      scrollToHighlighted: function() {
        var $highlightedEl = $('#acn-dropdown-menu .highlighted'),
          highlightedElTop = $highlightedEl.length > 0 ? $highlightedEl.offset().top : 0,
          $dropdownMenuContainer = $('#acn-dropdown-menu'),
          $dropdownMenuContainerHeight = $dropdownMenuContainer.height(),
          scrollElement = highlightedElTop > $dropdownMenuContainerHeight || highlightedElTop < 0;

        if ($highlightedEl.length > 0 && scrollElement) {
          $dropdownMenuContainer.scrollTop(highlightedElTop / 2);
        }
      },

      /**
       * method fired when user clicks on the root level folder
       */
      onRootFolderClick: function() {
        Self.toggleFolderState(this.componentInstance, Self.ROOT_TOGGLE);
      },

      /**
       * toggle folder state
       */
      toggleFolderState: function(instance, forceState, path) {
        var WcmRootFolder = Self,
          $el;
        if (forceState != null && forceState != WcmRootFolder.ROOT_TOGGLE) {
          // force
          if (forceState == WcmRootFolder.ROOT_OPEN) {
            instance.rootFolderEl.style.display = 'block';
            instance.state = WcmRootFolder.ROOT_OPEN;
            if (!instance.firstDraw) {
              Self.initializeContentTree(instance.rootFolderEl, path, instance);
              Self.save(instance, Self.ROOT_OPENED, null, 'root-folder');
            }

            $el = $('#' + instance.rootFolderEl.id)
              .parent()
              .find('>a');
            $el.removeClass('closed');
            $el.addClass('open');
          } else {
            instance.rootFolderEl.style.display = 'none';
            instance.state = WcmRootFolder.ROOT_CLOSED;
            storage.eliminate(Self.getStoredPathKey(instance));

            $el = $('#' + instance.rootFolderEl.id)
              .parent()
              .find('>a');
            $el.removeClass('open');
            $el.addClass('closed');
          }
        } else {
          // toggle
          if (instance.state == WcmRootFolder.ROOT_OPEN) {
            this.toggleFolderState(instance, WcmRootFolder.ROOT_CLOSED, path);
          } else {
            this.toggleFolderState(instance, WcmRootFolder.ROOT_OPEN, path);
          }
        }
      },

      getStoredPathKey: function(instance) {
        return `${CStudioAuthoringContext.site}-${instance.label.replace(' ', '').toLowerCase()}-opened`;
      },

      getNumKey: function(nodes, key, callback) {
        var num;
        for (n = 0; nodes.length > n; n++) {
          var el = nodes[n].getEl(),
            num;
          num = el.getAttribute('num');
          if (!num) {
            while ((el = el.parentElement) && !el.hasAttribute('num'));
          }
          try {
            num = el.getAttribute('num') ? el.getAttribute('num') : null;
          } catch (e) {
            num = null;
          }
          if (num == key) {
            callback(nodes[n]);
          }
        }
        return num;
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

          YSelector = YAHOO.util.Selector.query;
          var label = instance.rootFolderEl.previousElementSibling;
          YDom.addClass(label, 'loading');
          var doCall = function(n, j, key) {
            Self.onLoadNodeDataOnClick(n, function() {
              n.loadComplete();

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
                  Self.getNumKey(node, key, function(currentNode) {
                    var loadEl = YSelector('.ygtvtp', currentNode.getEl(), true);
                    loadEl == null && (loadEl = YSelector('.ygtvlp', currentNode.getEl(), true));
                    YDom.addClass(loadEl, 'ygtvloading');
                    doCall(currentNode, j, key);
                  });
                } else {
                  YDom.removeClass(label, 'loading');
                  YDom.removeClass(YSelector('.ygtvloading', treeEl), 'ygtvloading');
                  Self.firePathLoaded(instance);
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
                    Self.getNumKey(node, key, function(currentNode) {
                      var loadEl = YSelector('.ygtvtp', currentNode.getEl(), true);
                      loadEl == null && (loadEl = YSelector('.ygtvlp', currentNode.getEl(), true));
                      YDom.addClass(loadEl, 'ygtvloading');
                      doCall(currentNode, k[key], key);
                    });
                  }
                } else {
                  // YDom.removeClass(label, "loading");
                  // Self.firePathLoaded(instance);
                }

                YDom.removeClass(label, 'loading');
                YDom.removeClass(YSelector('.ygtvloading', treeEl), 'ygtvloading');
                Self.firePathLoaded(instance);
              }
            });
          };
          tree.setDynamicLoad(this.onLoadNodeDataOnClick);
          if (this.pathOnlyHasCannedSearch(rootPath, instance)) {
            var dummy = new Object();
            dummy.path = rootPath;
            var items = new Array();
            items.push(dummy);
            Self.drawTree(items, tree, null, instance, pathFlag);
            YDom.removeClass(label, 'loading');
            Self.firePathLoaded(instance);
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

                      // add custom icon class
                      var keyId = instance.label;
                      keyId = keyId.replace(/\s/g, '');

                      var $el = $('#' + instance.rootFolderEl.id)
                        .parent()
                        .find('>a');
                      $el.removeClass('closed');
                      $el.addClass('open');
                    }
                    instance.state = Self.ROOT_OPEN;
                    Self.drawTree(items, tree, null, instance, pathFlag);
                    pathFlag = false;

                    if (latestStored[key] && latestStored[key][[key]] != Self.ROOT_OPENED) {
                      pathTrace[key][k[key]] = treeData.item.path;
                      counter[key][k[key]] = 0;
                      (function() {
                        tmp[key][k[key]] = (latestStored[key][k[key]] || '').replace(treeData.item.path, '');
                        paths[key][k[key]] = tmp[key][k[key]].length
                          ? (tmp[key][k[key]].charAt(0) === '/' ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split(
                              '/'
                            )
                          : null;
                        recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                      })();
                      var nodes, node, loadEl;
                      nodes = tree.getNodesByProperty('path', treeData.item.path);
                      if (nodes != null) {
                        Self.getNumKey(nodes, key, function(currentNode) {
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
                        Self.firePathLoaded(instance);
                      } else {
                        YDom.addClass(loadEl, 'ygtvloading');
                        // YDom.setAttribute ( node , "index" ,instance.pathNumber  );
                        doCall(node, k[key], key);
                      }
                    } else {
                      YDom.removeClass(label, 'loading');
                      Self.firePathLoaded(instance);
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
          Self.firePathLoaded(instance);
        }
      },
      firePathLoaded: function(instance) {
        ++Self.treePathOpenedEvt.fireCount;
        Self.treePathOpenedEvt.fire(Self.instanceCount, Self.treePathOpenedEvt.fireCount);
      },
      /**
       *  wire up new to search items
       */
      wireUpCannedSearches: function() {
        var searchesToWire = Self.searchesToWire;

        for (var i = 0; i < searchesToWire.length; i++) {
          var newId = searchesToWire[i].searchTO.newId;
          var searchId = searchesToWire[i].searchTO.searchId;

          var newEl = document.getElementById(newId);
          var searchEl = document.getElementById(searchId);

          if (newEl) {
            newEl.searchTO = searchesToWire[i].searchTO;
          }

          searchEl.searchTO = searchesToWire[i].searchTO;

          var createCb = {
            success: function() {
              this.callingWindow.location.reload(true);
            },

            failure: function() {},

            callingWindow: window
          };

          if (newEl) {
            newEl.onclick = function() {
              CStudioAuthoring.Operations.createNewContent(
                CStudioAuthoringContext.site,
                this.searchTO.newPath,
                false,
                createCb
              );

              return false;
            };
          }

          searchEl.onclick = function() {
            var url =
              CStudioAuthoringContext.authoringAppBaseUri + '/search?site=' + CStudioAuthoringContext.site + '&s=';

            var queryParams = this.searchTO.queryParams.queryParam;

            for (var i = 0; i < queryParams.length; i++) {
              url += '&' + encodeURIComponent(queryParams[i].name) + '=' + encodeURIComponent(queryParams[i].value);
            }

            window.location = url;
          };
        }
        /* free up once current ones registered */
        Self.searchesToWire = new Array();
      },
      /**
       * method fired when tree node is expanded for first time
       */

      onLoadNodeDataOnClick: function(node, fnLoadComplete) {
        // applicable for items under detail folder
        if (!node.treeNodeTO) {
          fnLoadComplete();
          return;
        }

        var plainpath = node.treeNodeTO.path,
          path = encodeURI(plainpath),
          site = node.treeNodeTO.site,
          pathToOpenTo = node.openToPath;

        // Self.save(node.instance, plainpath);

        var serviceCb = {
          success: function(treeData, args) {
            /**
             * nodes will not have collapse/expand icon if they do not have any children
             * after clicking them.
             */
            if (treeData.item.children.length == 0) {
              node.isLeaf = true;
            }

            Self.drawSubtree(treeData.item.children, args.node, args.pathToOpenTo, args.instance);

            args.fnLoadComplete();

            /* wire up new to search items */
            Self.wireUpCannedSearches();

            // add blur effect for cut items
            Self.setChildrenStyles(args.node);
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
        };

        CStudioAuthoring.Service.lookupSiteContent(site, path, 1, 'default', serviceCb);
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
            Self.save(
              node.instance,
              plainpath,
              null,
              el.getAttribute('num') ? el.getAttribute('num') : 'root-folder',
              'expand'
            );
          }

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

        if (iniPath.endsWith('/' + fileName)) {
          var index = iniPath.lastIndexOf('/' + fileName);
          plainpath = iniPath.slice(0, index);
        } else {
          plainpath = iniPath.replace('/' + fileName + '/', '/');
        }

        plainpath = plainpath == '/site' || path == num ? 'root-folder' : plainpath;
        if (!num) {
          while ((el = el.parentElement) && !el.hasAttribute('num'));
        }
        // Self.remove(node.instance, plainpath);
        Self.save(
          node.instance,
          plainpath,
          fileName,
          el.getAttribute('num') ? el.getAttribute('num') : 'root-folder',
          'collapse'
        );

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
          if (path.indexOf(instance.openArray[num][i]) > -1) {
            instance.openArray[num].splice(i, 1);
            i--;
            continue;
          } else {
            var aux = path;
            if (fileName) {
              aux = aux + '/' + fileName;
            }
            if (instance.openArray[num][i].indexOf(aux) > -1) {
              instance.openArray[num].splice(i, 1);
              i--;
              continue;
            }
            if (instance.openArray[num].length > 0 && instance.openArray[num][i]) {
              if (instance.openArray[num][i].indexOf(path) > -1) flag = false;
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
          if (instance.openArray[num].length > 1 && instance.openArray[num][i].indexOf('root-folder') > -1) {
            instance.openArray[num].splice(i, 1);
          }

          if (
            instance.openArray[num].length < 2 &&
            instance.openArray[num][i].indexOf('root-folder') > -1 &&
            num != 'root-folder' &&
            mode != 'expand'
          ) {
            delete instance.openArray[num];
            break;
          }
        }
        storage.write(Self.getStoredPathKey(instance), JSON.stringify(instance.openArray), 360);
      },

      remove: function(instance, path) {
        storage.eliminate(Self.getStoredPathKey(instance));
      },

      findAncestor: function(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
      },

      updateNote: function(note, treeData) {
        note.browserUri != treeData.browserUri && treeData.browserUri != undefined
          ? (note.browserUri = treeData.browserUri)
          : null;
        note.contentType != treeData.contentType && treeData.contentType != undefined
          ? (note.contentType = treeData.contentType)
          : null;
        note.editedDate != treeData.editedDate && treeData.editedDate != undefined
          ? (note.editedDate = treeData.editedDate)
          : null;
        note.fileName != treeData.fileName && treeData.fileName != undefined
          ? (note.fileName = treeData.fileName)
          : null;
        note.formId != treeData.formId && treeData.formId != undefined ? (note.formId = treeData.formId) : null;
        note.formPagePath != treeData.formPagePath && treeData.formPagePath != undefined
          ? (note.formPagePath = treeData.formPagePath)
          : null;
        note.inFlight != treeData.inFlight && treeData.inFlight != undefined
          ? (note.inFlight = treeData.inFlight)
          : null;
        note.inProgress != treeData.inProgress && treeData.inProgress != undefined
          ? (note.inProgress = treeData.inProgress)
          : null;
        note.internalName != treeData.internalName && treeData.internalName != undefined
          ? (note.internalName = treeData.internalName)
          : null;
        note.isComponent != treeData.isComponent && treeData.isComponent != undefined
          ? (note.isComponent = treeData.isComponent)
          : null;
        note.isContainer != treeData.isContainer && treeData.isContainer != undefined
          ? (note.isContainer = treeData.isContainer)
          : null;
        note.isLevelDescriptor != treeData.isLevelDescriptor && treeData.isLevelDescriptor != undefined
          ? (note.isLevelDescriptor = treeData.isLevelDescriptor)
          : null;
        note.link != treeData.link && treeData.link != undefined ? (note.link = treeData.link) : null;
        note.linkToPreview != treeData.linkToPreview && treeData.linkToPreview != undefined
          ? (note.linkToPreview = treeData.linkToPreview)
          : null;
        note.lockOwner != treeData.lockOwner && treeData.lockOwner != undefined
          ? (note.lockOwner = treeData.lockOwner)
          : null;
        note.modifier != treeData.modifier && treeData.modifier != undefined
          ? (note.modifier = treeData.modifier)
          : null;
        note.nodeRef != treeData.nodeRef && treeData.nodeRef != undefined ? (note.nodeRef = treeData.nodeRef) : null;
        note.path != treeData.path && treeData.path != undefined ? (note.path = treeData.path) : null;
        note.pathSegment != treeData.pathSegment && treeData.pathSegment != undefined
          ? (note.pathSegment = treeData.pathSegment)
          : null;
        note.previewable != treeData.previewable && treeData.previewable != undefined
          ? (note.previewable = treeData.previewable)
          : null;
        note.site != treeData.site && treeData.site != undefined ? (note.site = treeData.site) : null;
        note.status != treeData.status && treeData.status != undefined ? (note.status = treeData.status) : null;
        note.uri != treeData.uri && treeData.uri != undefined ? (note.uri = treeData.uri) : null;
      },

      /**
       * methos that fires when new items added to tree.
       */
      refreshNodes: function(
        treeNode,
        status,
        parent,
        tree,
        instance,
        changeStructure,
        typeAction,
        oldPath,
        dependencies
      ) {
        var treePath = treeNode ? treeNode.path : null,
          instancePath = instance ? instance.path : null,
          isValidPath =
            instance &&
            treePath &&
            (Array.isArray(instancePath) ? instancePath.indexOf(treePath) >= 0 : treePath.indexOf(instancePath) >= 0),
          refresh = typeAction == 'edit' ? isValidPath : true;
        if (refresh) {
          var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
          var tree = tree ? tree : Self.myTree,
            isMytree = false,
            currentPath = treeNode.data ? treeNode.data.path : treeNode.path,
            currentUri = treeNode.data ? treeNode.data.uri : treeNode.uri,
            currentBrowserUri = treeNode.data ? treeNode.data.browserUri : treeNode.browserUri,
            treePathsLocal = self.treePaths ? self.treePaths : WcmAssetsFolder.treePaths,
            oldPath = Array.isArray(oldPath) ? oldPath[currentBrowserUri.replace(/\//g, '')] : oldPath;
          if (tree && Self.myTree && !self.treePaths) {
            for (var i = 0; i < treePathsLocal.length; i++) {
              if (treePathsLocal[i] == Self.myTree.id) {
                isMytree = true;
              }
            }
            if (!isMytree) {
              tree = Self.myTree;
            }
          }
          if (tree) {
            var copiedItemNode = Self.copiedItem;
            var node = [];

            if (currentPath == '/site/website' && typeAction == 'createContent') {
              var auxNodes = tree.getNodesByProperty('path', currentPath);
              if (auxNodes && auxNodes.length) {
                for (var i = 0; i < auxNodes.length; i++) {
                  if (auxNodes[i].data.path == '/site/website') {
                    node[0] = auxNodes[i];
                  }
                }
              }
            } else {
              if (oldPath && currentUri != oldPath && tree.getNodesByProperty('uri', oldPath)) {
                node = tree.getNodesByProperty('uri', oldPath) ? tree.getNodesByProperty('uri', oldPath) : null;
              } else {
                node = tree.getNodesByProperty('path', currentPath)
                  ? tree.getNodesByProperty('path', currentPath)
                  : null;
              }
            }

            if (copiedItemNode != null && currentPath == copiedItemNode.data.path && treeNode.parent) {
              if (treeNode.parent.data.path) {
                node = tree.getNodesByProperty('path', treeNode.parent.data.path);
                Self.copiedItem = null;
              }
            }

            if (node) {
              for (var i = 0; i < node.length; i++) {
                node[i] = parent ? node[i].parent : node[i];
                if (node[i].isLeaf) node[i].isLeaf = false;
              }
            } else {
              node = parent ? treeNode.parent : treeNode;
            }

            if (!changeStructure) {
              if (instance) {
                // Self.initializeContentTree(instance.rootFolderEl, null, instance);
                var nodeToChange;
                if (parent) {
                  nodeToChange = tree.getNodesByProperty('path', currentPath);
                } else {
                  nodeToChange = node;
                }

                /* Updating the tree Url if the path has been change. */
                if (oldPath && currentPath != oldPath && tree.getNodesByProperty('uri', oldPath)) {
                  var treeToUpdate = tree.getNodesByProperty('uri', oldPath);
                  for (var i = 0; i < treeToUpdate.length; i++) {
                    Self.updateNote(treeToUpdate[i].data, treeNode.data ? treeNode.data : treeNode);
                    treeToUpdate[i].label = treeNode.data ? treeNode.data.internalName : treeNode.internalName;
                    treeToUpdate[i].treeNodeTO.path = treeNode.data ? treeNode.data.path : treeNode.path;
                    treeToUpdate[i].treeNodeTO.uri = treeNode.data ? treeNode.data.uri : treeNode.uri;
                  }
                  nodeToChange = treeToUpdate;
                }

                if (nodeToChange) {
                  for (var i = 0; i < nodeToChange.length; i++) {
                    (function(nodeToChange, i) {
                      lookupSiteContent(nodeToChange[i], currentUri);
                      nodeOpen = true;
                    })(nodeToChange, i);
                  }
                }

                if (dependencies) {
                  var treeToUpdateDependencies;
                  for (var i = 0; i < dependencies.length; i++) {
                    if (dependencies[i] != currentUri) {
                      treeToUpdateDependencies = tree.getNodesByProperty('uri', dependencies[i]);
                      if (treeToUpdateDependencies) {
                        for (var j = 0; j < treeToUpdateDependencies.length; j++) {
                          if (treeToUpdateDependencies[j].data.contentType != 'folder') {
                            (function(treeToUpdateDependencies, j) {
                              lookupSiteContent(treeToUpdateDependencies[j], treeToUpdateDependencies[j].data.uri);
                              nodeOpen = true;
                            })(treeToUpdateDependencies, j);
                          }
                        }
                      }
                    }
                  }
                }

                function lookupSiteContent(curNode, currentUri, paramCont) {
                  if (curNode) {
                    CStudioAuthoring.Service.lookupSiteContent(
                      CStudioAuthoringContext.site,
                      curNode.data.uri,
                      1,
                      'default',
                      {
                        success: function(treeData) {
                          if (currentUri.replace(/ /g, '%20') == treeData.item.uri) {
                            var style = '',
                              cont = paramCont ? paramCont : 0,
                              currentInternalName =
                                treeData.item.internalName != '' ? treeData.item.internalName : treeData.item.name,
                              curElt = YDom.get(curNode.labelElId);
                            curNode.data = Self.createTreeNodeTransferObject(treeData.item);
                            if (
                              typeAction === 'publish' &&
                              treeData.item.inProgress &&
                              !treeData.item.scheduled &&
                              cont < 5
                            ) {
                              treeData.item.inFlight = true;
                            }
                            eventCM.typeAction = typeAction;
                            eventCM.item = treeData.item;
                            document.dispatchEvent(eventCM);
                            style = CStudioAuthoring.Utils.getIconFWClasses(treeData.item);
                            if (treeData.item.isPreviewable) {
                              style = style + ' preview';
                            } else {
                              style = style + ' no-preview';
                            }
                            if (treeData.item.contentType == 'asset') {
                              style = style + ' component';
                            }
                            style = style + ' treenode-label';
                            treeData.item.style = style;
                            if (curElt) {
                              curElt.className = style;
                              if (curNode.data.title && curElt.title != curNode.data.title) {
                                curElt.title = curNode.data.title;
                              }
                            }
                            if (style.indexOf('deleted') != -1 || treeData.item.isDeleted) {
                              var tempSplit = curNode.labelElId.split('labelel');
                              var parentNode = YDom.get(tempSplit[0] + tempSplit[1]);
                              parentNode.style.display = 'none';
                              tree.removeNode(curNode);
                              if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                CStudioAuthoring.SelectedContent.getSelectedContent()[0]
                                  ? CStudioAuthoring.SelectedContent.unselectContent(
                                      CStudioAuthoring.SelectedContent.getSelectedContent()[0]
                                    )
                                  : null;
                              }
                              eventCM.typeAction = typeAction;
                              eventCM.item = treeData.item;
                              document.dispatchEvent(eventCM);
                              if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                WcmDashboardWidgetCommon.refreshAllDashboards();
                              }
                            } else {
                              if (style.indexOf('in-flight') != -1) {
                                cont++;
                                setTimeout(function() {
                                  lookupSiteContent(curNode, currentUri, cont);
                                }, 3000);
                              } else {
                                cont++;

                                var indexOfFolder = -1;
                                if (curNode.labelStyle) {
                                  indexOfFolder = curNode.labelStyle.indexOf('folder');
                                } else {
                                  indexOfFolder = curNode.html.className.indexOf('folder');
                                }

                                if ((indexOfFolder != -1 && cont < 25) || (indexOfFolder == -1 && cont < 2)) {
                                  setTimeout(function() {
                                    lookupSiteContent(curNode, currentUri, cont);
                                    if (
                                      typeof WcmDashboardWidgetCommon != 'undefined' &&
                                      eventNS.typeAction == 'edit' &&
                                      !eventNS.draft
                                    ) {
                                      CStudioAuthoring.SelectedContent.getSelectedContent()[0]
                                        ? CStudioAuthoring.SelectedContent.unselectContent(
                                            CStudioAuthoring.SelectedContent.getSelectedContent()[0]
                                          )
                                        : null;
                                    }
                                    if (indexOfFolder == -1 && typeAction != 'edit') {
                                      eventCM.typeAction = typeAction;
                                      eventCM.item = treeData.item;
                                      document.dispatchEvent(eventCM);
                                      if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                        WcmDashboardWidgetCommon.refreshAllDashboards();
                                      }
                                    }
                                  }, 300);
                                }
                              }
                            }

                            var icon = CStudioAuthoring.Utils.getContentItemIcon(treeData.item);
                            curElt.innerHTML = '';
                            curElt.appendChild(icon);
                            curElt
                              ? (curElt.innerHTML += CrafterCMSNext.util.string.escapeHTML(currentInternalName))
                              : null;
                          }
                        },
                        failure: function() {}
                      }
                    );
                  }
                }
              }
            } else {
              if (node) {
                nodeOpen = true;
                for (var i = 0; i < node.length; i++) {
                  var curNode = node[i];
                  if (curNode.nodeType == 'CONTENT') {
                    var itemStore = instance ? storage.read(Self.getStoredPathKey(instance)) : null;
                    if (YDom.get(curNode.labelElId)) {
                      tree.removeChildren(curNode);
                      var loadEl = YAHOO.util.Selector.query('.ygtvtp', curNode.getEl(), true);
                      loadEl == null && (loadEl = YAHOO.util.Selector.query('.ygtvlp', curNode.getEl(), true));
                      YDom.addClass(loadEl, 'ygtvloading');
                      curNode.renderChildren();
                      curNode.refresh();
                      if (instance) {
                        storage.write(Self.getStoredPathKey(instance), itemStore.sitewebsite, 360);
                      }
                      self.expandTree ? self.expandTree(curNode) : WcmAssetsFolder.expandTree;
                      if (typeof WcmDashboardWidgetCommon != 'undefined') {
                        WcmDashboardWidgetCommon.refreshAllDashboards();
                      }
                    }
                  } else {
                    var root = false;
                    if (Object.prototype.toString.call(instance.path) === '[object Array]') {
                      var path;
                      try {
                        path = curNode.data
                          ? curNode.data.path
                            ? curNode.data.path
                            : treeNode.treeNodeTO.path
                          : treeNode.treeNodeTO.path;
                      } catch (er) {
                        path = curNode.data
                          ? curNode.data.path
                            ? curNode.data.path
                            : treeNode.path
                            ? treeNode.path
                            : null
                          : treeNode.path
                          ? treeNode.path
                          : null;
                      }
                      for (var i = 0; i <= instance.path.length; i++) {
                        if (path == instance.path[i]) {
                          root = true;
                        }
                      }
                    }
                    if (root && instance) {
                      Self.initializeContentTree(instance.rootFolderEl, null, instance);
                      Self.toggleFolderState(instance, 'open');
                    }
                    if (typeof WcmDashboardWidgetCommon != 'undefined') {
                      WcmDashboardWidgetCommon.refreshAllDashboards();
                    }
                  }
                  if (i >= node.length - 1) {
                    eventYS.parent = null;
                    eventNS.parent = null;
                  }
                }
              }
              if (root && instance) {
                setTimeout(function() {
                  CStudioAuthoring.ContextualNav.WcmRootFolder.openLatest(instance);
                }, 100);
              }
            }

            var treeInner = YDom.get('acn-dropdown-menu-inner');
            var previousCutEl = YDom.getElementsByClassName('status-icon', null, treeInner);

            for (var i = 0; i < previousCutEl.length; i++) {
              if (
                previousCutEl[i].style.color == Self.CUT_STYLE_RGB ||
                previousCutEl[i].style.color == Self.CUT_STYLE
              ) {
                if (status) {
                  var tempSplit = previousCutEl[i].id.split('labelel');
                  var parentNode = YDom.get(tempSplit[0] + tempSplit[1]);
                  parentNode.style.display = 'none';
                  if (Self.cutItem != null) {
                    var parNode = tree.getNodeByProperty('path', Self.cutItem.parent.data.path);
                    // if parent have single child and we did cut and paste the child,
                    // we should refresh the parent node to remove expand collapse icon
                    if (parNode && parNode.children && parNode.children.length == 1) {
                      tree.removeChildren(parNode);
                      var parLoadEl = YSelector('.ygtvtp', parNode.getEl(), true);
                      parLoadEl == null && (parLoadEl = YSelector('.ygtvlp', parNode.getEl(), true));
                      YDom.addClass(parLoadEl, 'ygtvloading');
                      parNode.renderChildren();
                      parNode.refresh();
                    } else if (parNode) {
                      // remove the only item from parent node.
                      tree.removeNode(Self.cutItem);
                    }
                    Self.cutItem = null;
                  }
                } else {
                  previousCutEl[i].removeAttribute('style');
                }
              }
            }
          }
        }
      },

      /**
       * method fired when tree item is clicked
       */
      onTreeNodeClick: function(node) {
        // lets remove ths case logic here and just invoke a callback
        if (node.nodeType == 'CONTENT') {
          if (node.data.previewable == true && node.instance.onClickAction == 'preview') {
            if (node.data.isContainer == true && node.data.pathSegment != 'index.xml') {
              // this is a false state coming from the back-end
            } /* if (node.data.isLevelDescriptor == false) */ else {
              CStudioAuthoring.Operations.openPreview(node.data, '', false, false);
            }
          }
        } else if (node.nodeType == 'SEARCH') {
          // wired on render
        }

        return false;
      },
      /**
       * create a transfer object for a node
       */
      createTreeNodeTransferObject: function(treeItem) {
        var retTransferObj = new Object();
        retTransferObj.site = CStudioAuthoringContext.site;
        retTransferObj.internalName = treeItem.internalName;
        retTransferObj.link = 'UNSET';
        retTransferObj.path = treeItem.path;
        retTransferObj.uri = treeItem.uri;
        retTransferObj.browserUri = treeItem.browserUri;
        retTransferObj.nodeRef = treeItem.nodeRef;
        retTransferObj.formId = treeItem.form;
        retTransferObj.contentType = treeItem.contentType;
        retTransferObj.formPagePath = treeItem.formPagePath;
        retTransferObj.isContainer = treeItem.container || treeItem.isContainer;
        retTransferObj.isComponent = treeItem.component;
        retTransferObj.isPage = treeItem.isPage;
        retTransferObj.isNew = treeItem.isNew;
        retTransferObj.isFloating = treeItem.floating;
        retTransferObj.isLevelDescriptor = treeItem.levelDescriptor;
        retTransferObj.inFlight = treeItem.inFlight;
        retTransferObj.editedDate = '';
        retTransferObj.modifier = '';
        retTransferObj.pathSegment = treeItem.name;
        retTransferObj.lockOwner = treeItem.lockOwner;
        retTransferObj.inProgress = treeItem.inProgress;
        retTransferObj.previewable = treeItem.previewable;
        retTransferObj.mimeType = treeItem.mimeType;
        retTransferObj.contentType = treeItem.contentType;
        var itemNameLabel = 'Page';

        retTransferObj.statusObj = {
          deleted: treeItem.deleted,
          scheduled: treeItem.scheduled,
          disabled: treeItem.disabled,
          inFlight: treeItem.inFlight,
          inProgress: treeItem.inProgress,
          live: treeItem.live,
          lockOwner: treeItem.lockOwner,
          submitted: treeItem.submitted
        };

        retTransferObj.status = CStudioAuthoring.Utils.getContentItemStatus(treeItem).string;
        retTransferObj.style = CStudioAuthoring.Utils.getIconFWClasses(treeItem); // , treeItem.container

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

        if (treeItem.previewable == false) {
          retTransferObj.style += ' no-preview';
        } else {
          retTransferObj.style += ' preview';
        }

        if (treeItem.disabled == true) {
          retTransferObj.style += ' disabled';
        }

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
          ? CStudioAuthoring.Utils.createIcon('', Self.defaultIcons.childClosed)
          : CStudioAuthoring.Utils.getContentItemIcon(treeItem);

        if (treeItem.scheduled == true) {
          retTransferObj.scheduledDate = treeItem.scheduledDate;

          formattedSchedDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.scheduledDate, studioTimeZone);
          retTransferObj.formattedScheduledDate = formattedSchedDate;
          var ttFormattedSchedDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.scheduledDate, studioTimeZone);

          retTransferObj.title = this.buildToolTipScheduled(
            retTransferObj.label,
            retTransferObj.contentType,
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
            retTransferObj.contentType,
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
          console.error(err);
        }
        return toolTip;
      },
      /**
       * unlock a content item
       */
      unlockContent: function() {
        var unlockCb = {
          success: function() {
            eventNS.data = oCurrentTextNode;
            eventNS.typeAction = '';
            eventNS.oldPath = null;
            document.dispatchEvent(eventNS);
          },
          failure: function() {},
          callingWindow: window
        };
        CStudioAuthoring.Service.unlockContentItem(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, unlockCb);
      },
      /**
       * given a path, attempt to open the folder to that path
       */
      openTreeToPath: function(instance, path) {
        // open first level
        this.toggleFolderState(instance, this.ROOT_OPEN, path);
      },
      /**
       * add hover effect to context nav items.
       */
      setChildrenStyles: function(treeNode) {
        var parentNode = treeNode.getContentEl();
        if (
          parentNode.children[0] &&
          (parentNode.children[0].style.color == Self.CUT_STYLE_RGB ||
            parentNode.children[0].style.color == Self.CUT_STYLE)
        ) {
          for (var chdIdx = 0; chdIdx < treeNode.children.length; chdIdx++) {
            var chdEl = treeNode.children[chdIdx].getContentEl();
            if (chdEl && chdEl.children[0]) {
              chdEl.children[0].style.color = Self.CUT_STYLE;
            }
          }
        }
      },

      resetNodeStyles: function() {
        var treeInner = YDom.get('acn-dropdown-menu-inner');
        var previousCutEl = YDom.getElementsByClassName('status-icon', null, treeInner);
        for (var i = 0; i < previousCutEl.length; i++) {
          if (previousCutEl[i].style.color == Self.CUT_STYLE_RGB || previousCutEl[i].style.color == Self.CUT_STYLE) {
            previousCutEl[i].removeAttribute('style');
          }
        }
      }
    }
  });
  Self.treePathOpenedEvt.fireCount = 0;
  /**
   * instance object
   * CStudioAuthoring.ContextualNav.WcmRootFolder is static
   */
  CStudioAuthoring.ContextualNav.WcmRootFolderInstance = function(config) {
    ++CStudioAuthoring.ContextualNav.WcmRootFolder.instanceCount;
    this._self = this;
    this._toggleState = CStudioAuthoring.ContextualNav.WcmRootFolder.ROOT_CLOSED;
    this.rootFolderEl = null;

    this.type = config.name;
    this.label = config.params['label'];
    this.path = config.params['path'] ? config.params['path'] : config.params['paths'].path;
    this.showRootItem = config.params['showRootItem'] === 'true' ? true : false;
    this.onClickAction = config.params['onClick'] ? config.params['onClick'] : '';
    this.config = config;
    this.mods = [];

    if (config.params.path === '/site/website') {
      amplify.subscribe('SELECTED_CONTENT_SET', function(message) {
        var contentTO = message.contentTO,
          reload = message.reload,
          $highlightEl = $('#acn-dropdown-menu [data-uri="' + contentTO.uri + '"]');
        (highlightVisible = $highlightEl.is(':visible')), (treeExists = $('#pages-tree + div').children().length > 0);

        if (!highlightVisible && treeExists && reload) {
          var $container = $(config.containerEl).empty();
          CStudioAuthoring.ContextualNav.WcmRootFolder.initialize(
            Object.assign({}, config, { containerEl: $container[0] })
          );
        } else {
          $('#acn-dropdown-menu [data-uri]').removeClass('highlighted');
          $highlightEl.addClass('highlighted');
          CStudioAuthoring.ContextualNav.WcmRootFolder.scrollToHighlighted();
        }
      });
    }
  };
  CStudioAuthoring.Module.moduleLoaded('wcm-root-folder', CStudioAuthoring.ContextualNav.WcmRootFolder);
})();
