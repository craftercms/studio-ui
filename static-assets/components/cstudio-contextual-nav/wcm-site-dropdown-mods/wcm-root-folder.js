(function() {
    var YDom = YAHOO.util.Dom,
    	YEvent = YAHOO.util.Event,
    	YConnect = YAHOO.util.Connect;
		sutils = CStudioAuthoring.StringUtils,
		storage = CStudioAuthoring.Storage,
		counter = 0, // Used to identify the contextmenu for each instances. May be used for any other purpose while numberic chronological order is maintained
		Self = null; // Local reference to CStudioAuthoring.ContextualNav.WcmRootFolder initialized by CStudioAuthoring.register call

		if(YAHOO.lang && !YAHOO.lang.escapeHTML) {
			// YUI version conflicts
			YAHOO.lang.escapeHTML = function(val) { return val; }
		}

    /**
     * WcmRootFolder
     * A root level folder is a configurable folder element that can be based at any
     * point along a wcm path.
     */
    Self = CStudioAuthoring.register({
        "ContextualNav.WcmRootFolder": {
			ROOT_OPENED: "root-folder",
            ROOT_OPEN: "open",
            ROOT_CLOSED: "closed",
            ROOT_TOGGLE: "toggle",
            CUT_STYLE_RGB: "rgb(159, 182, 205)",
            CUT_STYLE: "#9FB6CD",
			searchesToWire: [],
            myTree: null,
            myTreePages: [],
            myTreeAssets: [],
            currentTextNode : null,
            copiedItem: null,
            cutItem: null,
            instanceCount: 0,
            lastSelectedTextNode: null, //used for holding last selected node; to use it to hold hover effect on a text node when cotex menu is open.
            treePaths: [],
            menuOn: false,
            treePathOpenedEvt: new YAHOO.util.CustomEvent("wcmRootFolderTreePathLoaded", Self),
            labelsMenu: [],
            customIcons: {},
            defaultIcons: {
                pages: "fa-file-text-o",
                components: "fa-puzzle-piece",
                defaultIcon: "fa-folder",
                childOpen: "fa-folder-open-o",
                childClosed: "fa-folder-o",
                navPage: "fa-file",
                floatingPage: "fa-file-o",
                component: "fa-puzzle-piece",
                taxonomy: "fa-tags"
            },
            /**
             * initialize module
             */
            initialize: function(config) {
                var Self = this;

                if (config.name == "wcm-root-folder") {
                    var instance = new CStudioAuthoring.ContextualNav.WcmRootFolderInstance(config);
                    instance.cannedSearchCache = [];
                    instance.excludeCache = [];
                    instance.openArray = {};
                    var latestStored = storage.read( Self.getStoredPathKey(instance) );
                    if(latestStored){
                        if(latestStored.indexOf(',')!=-1 || latestStored.indexOf('[')!=-1 || latestStored.indexOf('{')!=-1){
                            instance.openArray = JSON.parse(latestStored);
                        }else{
                            instance.openArray = [];
                            instance.openArray.push(latestStored);
                        }
                    }
                    instance.pathNumber = 0;

                    var key = config.params.label;
                    key = key.replace(/\s/g,'');
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

                    //Setup child folders icon configuration
                    if(config.params["child-icon-open"] && config.params["child-icon-open"].class){
                        Self.customIcons[key].childIcons.open.icon.class = config.params["child-icon-open"].class;
                    }else{  //default open folder icon
                        Self.customIcons[key].childIcons.open.icon.class = Self.defaultIcons.childOpen;
                    }
                    if(config.params["child-icon-open"] && config.params["child-icon-open"].styles){
                        Self.customIcons[key].childIcons.open.icon.styles = config.params["child-icon-open"].styles;
                    }
                    if(config.params["child-icon-closed"] && config.params["child-icon-closed"].class){
                        Self.customIcons[key].childIcons.closed.icon.class = config.params["child-icon-closed"].class;
                    }else{  //default closed folder icon
                        Self.customIcons[key].childIcons.closed.icon.class = Self.defaultIcons.childClosed;
                    }
                    if(config.params["child-icon-closed"] && config.params["child-icon-closed"].styles){
                        Self.customIcons[key].childIcons.closed.icon.styles = config.params["child-icon-closed"].styles;
                    }

                    var module;

                    //setup root folder icon configuration
                    if(config.params["module-icon-open"] && config.params["module-icon-open"].class){
                        Self.customIcons[key].moduleIcons.open.icon.class = config.params["module-icon-open"].class;
                    }else {
                        module = key.toLowerCase();

                        if(Self.defaultIcons[module]){
                            Self.customIcons[key].moduleIcons.open.icon.class = Self.defaultIcons[module];
                        }else{
                            Self.customIcons[key].moduleIcons.open.icon.class = Self.defaultIcons.defaultIcon;
                        }
                    }
                    if(config.params["module-icon-open"] && config.params["module-icon-open"].styles){
                        Self.customIcons[key].moduleIcons.open.icon.styles = config.params["module-icon-open"].styles;
                    }
                    if(config.params["module-icon-closed"] && config.params["module-icon-closed"].class){
                        Self.customIcons[key].moduleIcons.closed.icon.class = config.params["module-icon-closed"].class;
                    }else {
                        module = key.toLowerCase();

                        if(Self.defaultIcons[module]){
                            Self.customIcons[key].moduleIcons.closed.icon.class = Self.defaultIcons[module];
                        }else{
                            Self.customIcons[key].moduleIcons.closed.icon.class = Self.defaultIcons.defaultIcon;
                        }
                    }
                    if(config.params["module-icon-closed"] && config.params["module-icon-closed"].styles){
                        Self.customIcons[key].moduleIcons.closed.icon.styles = config.params["module-icon-closed"].styles;
                    }

                    if(config.params.mods) {
                        if ((typeof(config.params.mods) == "object")
                        && (typeof(config.params.mods.mod) != "array")) {
                            config.params.mods = [config.params.mods.mod]
                        }

                        for(var m=0; m<config.params.mods.length; m++) {
                            // load modules
                            var mod = config.params.mods[m];

                            CStudioAuthoring.Module.requireModule(mod.name,
                            '/static-assets/components/cstudio-contextual-nav/wcm-site-dropdown-mods/root-folder-mods/' + mod.name + ".js",
                            {config: mod}, {
                                context: instance,
                                moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                                    this.context.mods[this.context.mods.length] = moduleClass;
                                    moduleClass.init(moduleConfig);
                                }
                            });
                        }
                    }


                    if(config.params.excludes) {
                        if ( (typeof(config.params.excludes) == "object")
                        && (typeof(config.params.excludes.exclude) != "array")) {
                            if (config.params.excludes.exclude != undefined) {
                                var path = config.params.excludes.exclude;
                                if (!instance.excludeCache[path]) {
                                    instance.excludeCache[path] = [];
                                }
                                instance.excludeCache[path].push(config.params.excludes.exclude);
                            }
                        }
                        else {
                            for (var i = 0; i < config.params.excludes.exclude.length; i++) {
                                var path = config.params.excludes.exclude[i];
                                if (!instance.excludeCache[path]) {
                                    instance.excludeCache[path] = [];
                                }
                                instance.excludeCache[path].push(config.params.excludes.exclude[i]);
                            }
                        }
                    }


                    // cache the searches by name so they can be checked quickly when building the nav
                    if (config.params.cannedSearches) {
                    	// not an array
                    	if ( (typeof(config.params.cannedSearches) == "object") && (config.params.cannedSearches.cannedSearch.length == undefined)) {
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
                        if(instance.mods.length > 0) {
                            for(var m=0; m<instance.mods.length; m++) {
                                var mod = instance.mods[m];
                                if(mod.readyToLoad == false) {
                                    readyToLoad = false;
                                    break;
                                }
                            }
                        }

                        if(readyToLoad || contOpenTreeTimes < 5) {
                            contOpenTreeTimes = 0;
                            if(YAHOO.util.Dom.getStyle("acn-dropdown-menu-wrapper", "display") != "none") {
                                window.firstClick = true;
                                thisComponent.openLatest(instance);
                            }
                            YEvent.on('acn-dropdown-toggler', 'click', function() {
                                if(!window.firstClick && YAHOO.util.Dom.getStyle("acn-dropdown-menu-wrapper", "display") != "none") {
                                    window.firstClick = true;
                                    thisComponent.openLatest(instance);
                                }
                                this.blur();
                            });

                            Self.wireUpCannedSearches();

                        }
                        else {
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
                var parentFolderEl = document.createElement("div");
                var parentFolderLinkEl = document.createElement("a");
                parentFolderLinkEl.id = instance.label.toLowerCase() + "-tree"; // should be part of class no?
                var label = instance.label.toLowerCase();
                label = label.replace(/ /g, '');
                var labelLangBundle = CMgs.format(siteDropdownLangBundle, (label));
                label = labelLangBundle == label ?
                    instance.label : labelLangBundle;

                //add custom icon class
                var key = instance.label;
                key = key.replace(/\s/g,'');

                // create spans for icons
                var moduleIcons = Self.customIcons[key].moduleIcons,
                    moduleClosed = CStudioAuthoring.Utils.createIcon(moduleIcons.closed, "", "on-closed"),
                    moduleOpen = CStudioAuthoring.Utils.createIcon(moduleIcons.open, "", "on-open");

                parentFolderLinkEl.appendChild(moduleClosed);
                parentFolderLinkEl.appendChild(moduleOpen);

                parentFolderLinkEl.innerHTML += label;
                parentFolderLinkEl.onclick = Self.onRootFolderClick;
                parentFolderLinkEl.componentInstance = instance;

                var treeEl = document.createElement("div");
                folderListEl.appendChild(parentFolderEl);
                parentFolderEl.appendChild(parentFolderLinkEl);
                parentFolderEl.appendChild(treeEl);

                YDom.addClass(parentFolderLinkEl, "acn-parent-folder");
                parentFolderLinkEl.style.cursor = "pointer";
                YDom.addClass(parentFolderEl, "acn-parent " + instance.label.toLowerCase() + "-tree");

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
                var pathToOpen = (path != undefined) ? path : null;
                var pathFlag = true;

                var tree = instance.tree = new YAHOO.widget.TreeView(treeEl);
                tree.setDynamicLoad(this.onLoadNodeDataOnClick);
                /*tree.subscribe("collapse", function(node) {this.collapseTree});
                tree.subscribe("expand", function(node) {this.expandTree});*/

                tree.FOCUS_CLASS_NAME = null;

				var label = treeEl.previousElementSibling;
				YDom.addClass(label, "loading");

				// reduce call if not necessary
				if (this.pathOnlyHasCannedSearch(rootPath, instance)) {
					var dummy = new Object();
					dummy.path = rootPath;
					var items = new Array();
					items.push(dummy);
					Self.drawTree(items, tree, path, instance, pathFlag);
					YDom.removeClass(label, "loading");
					//add hover effect to nodes
					Self.nodeHoverEffects(this);
				} else {
                    var pathLength;
                    if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                        pathLength = rootPath.length ? rootPath.length : 1;
                    } else {
                        pathLength = 1;
                    }

                    var ind=0;
                    var servPath;
                    if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                        servPath = rootPath[ind];
                    } else {
                        servPath = rootPath;
                    }

                    (function (ind) {
                        function treePrint(servPath) {
                            CStudioAuthoring.Service.lookupSiteContent(site, servPath, 1, "default", {
                                openToPath: pathToOpen,
                                success: function (treeData) {

                                    YDom.removeClass(label, "loading");
                                    //if(servPath == "/site/website")
                                    window.treeData = treeData;

                                    var items = treeData.item.children;
                                    if (instance.showRootItem) {
                                        items = new Array(treeData.item);
                                    }
                                    Self.drawTree(items, tree, path, instance, pathFlag);
                                    pathFlag = false;
                                    //add hover effect to nodes
                                    Self.nodeHoverEffects(this);

                                    ind++;
                                    if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                                        servPath = rootPath[ind];
                                    } else {
                                        servPath = rootPath;
                                    }
                                    if(servPath && Object.prototype.toString.call(rootPath) === '[object Array]'){
                                        treePrint(servPath);
                                    }
                                },

                                failure: function () {
                                    YDom.removeClass(label, "loading");
                                }
                            })
                        }
                        treePrint(servPath);
                    })(ind);
				}
            },

            refreshDashboard: function(inst){
                var instace = WcmDashboardWidgetCommon.dashboards[inst];
                var filterByTypeEl = YDom.get('widget-filterBy-'+instace.widgetId);
                var filterByTypeValue = 'all';
                if(filterByTypeEl && filterByTypeEl.value != '') {
                    filterByTypeValue = filterByTypeEl.value;
                }

                var searchNumberEl = YDom.get('widget-showitems-'+instace.widgetId);
                var searchNumberValue =  instace.defaultSearchNumber;
                if(searchNumberEl && searchNumberEl.value != '') {
                    searchNumberValue = searchNumberEl.value;
                }

                WcmDashboardWidgetCommon.loadFilterTableData(
                    instace.defaultSortBy,
                    YDom.get(instace.widgetId),
                    instace.widgetId,
                    searchNumberValue,filterByTypeValue);
            },

            refreshAllDashboards: function(){
                if (typeof WcmDashboardWidgetCommon != 'undefined') {
                    Self.refreshDashboard("MyRecentActivity");
                    Self.refreshDashboard("recentlyMadeLive");
                    Self.refreshDashboard("approvedScheduledItems");
                    Self.refreshDashboard("GoLiveQueue");
                }
            },

            /**
             * to check, if extra ajax call can be reduced
             */
			pathOnlyHasCannedSearch: function(path, instance) {
				if (!instance.showRootItem && instance.cannedSearchCache && instance.cannedSearchCache[path])
					return true;
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
                    var pathParts = pathToOpenTo.split("/");

                    if (pathParts.length >= 2) {
                        currentLevelPath = "/" + pathParts[1];
                        remainingPath = pathToOpenTo.substring(currentLevelPath.length + 1);
                    }
                }

                if(instance.mods) {
                    for(var m=0; m<instance.mods.length; m++) {
                        var mod = instance.mods[m];
                        if(mod.sortTreeItems) {
                            treeItems = mod.sortTreeItems(treeItems);
                        }
                    }
                }

                for (var i = 0; i < treeItems.length; i++) {
                    var exclude = false;
                    if(instance.excludeCache[treeItems[i].path]) {
                        exclude = true;
                    }

                    if(instance.mods) {
                        for(var m=0; m<instance.mods.length; m++) {
                            var mod = instance.mods[m];
                            exclude = mod.filterItem(treeItems[i]);
                        }
                    }


                    var cannedSearches = instance.cannedSearchCache[treeItems[i].path];
                    var isSearch = false;
                    var linkSearch = false;

                    if (cannedSearches) {
                        for (var l = 0; l < cannedSearches.length; l++) {
                            if (cannedSearches[l].insertAs == "replace") {
                                this.drawCannedSearch(cannedSearches[l], tree.getRoot());
                                isSearch = true;
                            } else if (cannedSearches[l].insertAs == "append") {
                                this.drawCannedSearch(cannedSearches[l], tree.getRoot());
                                isSearch = false;
							}
                        }
                    }

                    if(!treeItems[i].hideInAuthoring){
                        if (!isSearch && exclude == false) {
                            var treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);

                            var treeNode = this.drawTreeItem(treeNodeTO, tree.getRoot(), instance);

                            treeNode.instance = instance;

                            if (pathToOpenTo != null && treeNode != null) {
                                if (treeNodeTO.pathSegment == "index.xml") {
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

                document.addEventListener("setContentDone", function(){

                    var checkRenderingTemplates = function(renderingTemplates) {
                        var noTemplate = true;
                        for(var x = 0; x < renderingTemplates.length; x++){
                            if (renderingTemplates[x].uri != "") {
                                noTemplate = false;
                            }
                        }
                        return noTemplate;
                    };

                    var icePanel = document.getElementById("ice-tools-panel-elem"),
                        editTemplateEl;

                    if( icePanel ) {
                        editTemplateEl = icePanel.getElementsByClassName("edit-code template")[0].firstChild;

                        if(checkRenderingTemplates(CStudioAuthoring.SelectedContent.getSelectedContent()[0].renderingTemplates)) {
                            editTemplateEl.setAttributeNode(document.createAttribute("disabled"));
                            editTemplateEl.style.pointerEvents = "none";
                        }else {
                            editTemplateEl.removeAttribute("disabled");
                            editTemplateEl.style.pointerEvents = "";
                        }
                    }
                }, false);

                for(var i=0; i<treeNodesLabels.length; i++){
                    Self.labelsMenu.push(treeNodesLabels[i]);
                }

                new YAHOO.widget.Tooltip("acn-context-tooltipWrapper", {
                    context: Self.labelsMenu,
                    hidedelay:0,
                    showdelay:1000,
                    container: "acn-context-tooltip"
                });

                tree.subscribe('clickEvent', function(args) {
                    var idTree = tree.id.toString().replace(/-/g,'');
                    Self.myTree = Self.myTreePages[idTree];
                    Self.onTreeNodeClick(args.node);

                    // Prevent the default behavior (i.e. expand/collapse) of links that should take the user to preview
                    if (args.node.data.linkToPreview) {
                        return false;
                    }
                });

                tree.subscribe("dblClickEvent", function(node) {
                    return false;
                });

                tree.subscribe("expand", function(node) {
                    var id = node.labelElId;
                    var nodeId = YDom.get(id);

                    if (nodeId != null) {
                        var expandedNodeStyle = nodeId.className;
                        expandedNodeStyle = expandedNodeStyle.replace(" acn-collapsed-tree-node-label", "");
                        nodeId.className = expandedNodeStyle + " acn-expanded-tree-node-label";
                    }
                    self.expandTree(node);

                    if (Object.prototype.toString.call(instance.path) === '[object Array]') {
                            var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                            for (var i = 0; i < treeChild.length; i++) {
                                treeChild[i].setAttribute("num", instance.path[i].replace(/\//g, "").toLowerCase());
                            }
                    }else{
                        var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                        treeChild[0].setAttribute("num", instance.path.replace(/\//g, "").toLowerCase());
                    }

                    return true;
                });

                tree.subscribe("collapse", function(node) {
                    var id = node.labelElId;
                    var nodeId = YDom.get(id);
                    var collapsedNodeStyle = nodeId.className;
                    collapsedNodeStyle = collapsedNodeStyle.replace(" acn-expanded-tree-node-label", "");
                    nodeId.className = collapsedNodeStyle + " acn-collapsed-tree-node-label";

                    self.collapseTree(node);

                    if (Object.prototype.toString.call(instance.path) === '[object Array]') {
                            var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                            for (var i = 0; i < treeChild.length; i++) {
                                treeChild[i].setAttribute("num", instance.path[i].replace(/\//g, "").toLowerCase());
                            }
                    }else{
                        var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                        treeChild[0].setAttribute("num", instance.path.replace(/\//g, "").toLowerCase());
                    }

                    return true;
                });

				instance.contextMenuId = ("ContextmenuWrapper" + (counter++))
                var oContextMenu = new YAHOO.widget.ContextMenu(instance.contextMenuId, {
                    container: "acn-context-menu",
                    trigger: YDom.get(instance.label.toLowerCase() + "-tree").parentNode,
                    shadow: true,
                    lazyload: true,
                    hidedelay: 700,
					showdelay: 0,
					classname: "wcm-root-folder-context-menu",
					zIndex: 100
                });

                oContextMenu.subscribe('beforeShow', function() {
                		Self.onTriggerContextMenu(tree, this);
                }, tree, false);

                if(uniquePath) {
                    nodeOpen = true;
                    self.treePaths.push(tree.id);
                    (function (t, inst) {
                        document.addEventListener('crafter.refresh', function (e) {
                            eventCM.typeAction = e.typeAction;
                            document.dispatchEvent(eventCM);
                            try {
                                if(e.data && e.data.length) {
                                    for (var i = 0; i < e.data.length; i++){
                                        var changeStructure = (e.data[i] && e.data[i].children && e.data[i].children.length > 0 || e.changeStructure) ? true : false;
                                        Self.refreshNodes(e.data[i] ? e.data[i] : (oCurrentTextNode != null ? oCurrentTextNode : CStudioAuthoring.SelectedContent.getSelectedContent()[0]), true, e.parent == false? false : true, t, inst, changeStructure, e.typeAction, e.oldPath, e.dependencies);
                                     }
                                }else{
                                    var changeStructure = (e.data && e.data.children && e.data.children.length > 0 || e.changeStructure) ? true : false;
                                    Self.refreshNodes(e.data ? e.data : (oCurrentTextNode != null ? oCurrentTextNode : CStudioAuthoring.SelectedContent.getSelectedContent()[0]), true, e.parent == false? false : true, t, inst, changeStructure, e.typeAction, e.oldPath, e.dependencies);
                                }
                            } catch (er) {
                                var contentSelected = CStudioAuthoring.SelectedContent.getSelectedContent()[0];
                                if (contentSelected) {
                                    var changeStructure = (contentSelected && contentSelected.children && contentSelected.children.length > 0 || e.changeStructure) ? true : false;
                                    Self.refreshNodes(CStudioAuthoring.SelectedContent.getSelectedContent()[0], true, e.parent == false? false : true, t, inst, e.changeStructure, e.typeAction, e.oldPath, e.dependencies);
                                }
                            }

                            Self.refreshAllDashboards();

                        }, false);

                    })(tree, instance);
                }

                tree.draw();
               if (Object.prototype.toString.call(instance.path) === '[object Array]') {
                       var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                       for (var i = 0; i < treeChild.length; i++) {
                           treeChild[i].setAttribute("num", instance.path[i].replace(/\//g, "").toLowerCase());
                       }
               }else{
                   var treeChild = tree.getEl().querySelectorAll(".acn-parent > div > div > .ygtvchildren > .ygtvitem");
                   treeChild[0].setAttribute("num", instance.path.replace(/\//g, "").toLowerCase());
               }
                instance.pathNumber++;
                if(instance.path.length - 1 < instance.pathNumber){instance.pathNumber = 0;}

				Self.wireUpCannedSearches();

                if (nodeToOpen != null) {
                    // opening to a specific path
                    nodeToOpen.expand();
                    nodeToOpen.openToPath = remainingPath;
                }

				instance.firstDraw = true;

                var treeId = tree.id.toString().replace(/-/g,'');
                Self.myTreePages[treeId] = tree;

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
                    var pathParts = pathToOpenTo.split("/");

                    if (pathParts.length >= 2) {
                        currentLevelPath = "/" + pathParts[0];
                        remainingPath = pathToOpenTo.substring(currentLevelPath.length);
                    }
                }

                var parentCannedSearch = instance.cannedSearchCache[root.treeNodeTO.path];
                var replaceChildren = new Array();

                if (parentCannedSearch) {
                    for (var j = 0; j < parentCannedSearch.length; j++) {
                        if (parentCannedSearch[j].insertAs == "replaceAllChildFolders") {
                            replaceAllChildFolders = true;
                            break;
                        }
                    }
                }


                if(instance.mods) {
                    for(var m=0; m<instance.mods.length; m++) {
                        var mod = instance.mods[m];
                        if(mod.sortTreeItems) {
                            treeItems = mod.sortTreeItems(treeItems);
                        }
                    }
                }

                for (var i = 0, l = treeItems.length, treeNodeTO, renderChild; i < l; i++) {
                    var exclude = false;

                    if(instance.mods) {
                        for(var m=0; m<instance.mods.length; m++) {
                            var mod = instance.mods[m];
                            exclude = mod.filterItem(treeItems[i]);
                        }
                    }

                    if(instance.excludeCache[treeItems[i].path]) {
                        exclude = true;
                    }

                    treeNodeTO = this.createTreeNodeTransferObject(treeItems[i]);
                    if (treeNodeTO.isLevelDescriptor || treeNodeTO.isComponent ||
                        treeNodeTO.container == false || treeNodeTO.name == 'index.xml' ||
                        (treeNodeTO.isContainer == true && treeNodeTO.pathSegment != 'index.xml') ||
                        treeNodeTO.previewable == false) {
                        treeNodeTO.style += " no-preview";
                    }else{
                        treeNodeTO.style += " preview";
                    }

                    renderChild = true;

                    if (replaceAllChildFolders && treeNodeTO.isContainer) {
                        renderChild = false;
                    }

                    if (renderChild && exclude == false) {
                        if(!treeItems[i].hideInAuthoring){
                            var itemCannedSearch = instance.cannedSearchCache[treeNodeTO.path];

                            if (itemCannedSearch && itemCannedSearch.length != 0 && itemCannedSearch[0].insertAs != "append") {
                                replaceChildren.push(treeNodeTO.path);
                            } else {
                                var treeNode = this.drawTreeItem(treeNodeTO, root, instance);
                                //nodes will not have collapse/expand icon if they do not have any children
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
                            if (itemCannedSearch[k].insertAs == "replace") {
                                this.drawCannedSearch(itemCannedSearch[k], root);
                            }
                        }
                    }
                }

                for(var i=0; i<treeNodesLabels.length; i++){
                    Self.labelsMenu.push(treeNodesLabels[i]);
                }

                new YAHOO.widget.Tooltip("acn-context-tooltipWrapper", {
                    context: Self.labelsMenu,
                    hidedelay:0,
                    showdelay:1000,
                    container: "acn-context-tooltip"
                });

                if (nodeToOpen) {
                    nodeToOpen.expand();
                    //nodeToOpen.openToPath = remainingPath;
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
                    	var label = "<a style='display: inline; padding-right:5px;' id='ID' href='#' class='canned-search-el'>LABEL</a><a style='display: inline; border-left: 1px solid grey; padding-left: 5px;' id='NEWID' href='#'>+add</a>";

                        label = label.replace("ID", searchId);
                        label = label.replace("LABEL",searchConfig.label);
                        label = label.replace("NEWID", newId);

                        searchConfig.label = label;

                    treeNode = new YAHOO.widget.TextNode(searchConfig, root, false);
                    Self.searchesToWire.push(treeNode);
                } else {
                    searchConfig.label = "<a style='display: inline;' id='" + searchId + "' href='#'>" +
                            searchConfig.label + "</a>";

                    treeNode = new YAHOO.widget.TextNode(searchConfig, root, false);

                    Self.searchesToWire.push(treeNode);
                }


                treeNode.nodeType = "SEARCH";
                treeNode.searchTO = searchConfig;
                treeNode.searchTO.newId = newId;
                treeNode.searchTO.searchId = searchId;
                treeNode.renderHidden = true;
                treeNode.nowrap = true;
                treeNode.isLeaf = true;
                treeNode.labelStyle = "acn-canned-search yui-resize-label";
				treeNode._yuiGetHtml = treeNode.getHtml();

                treeNode.getHtml = function() {
                    var markup = treeNode._yuiGetHtml;
                    markup = markup.replace(/\&gt;/g, ">");
                    markup = markup.replace(/\&lt;/g, "<");
                    markup = markup.replace(/\&amp;/g, "&");
                    markup = markup.replace(/\&#x27;/g, "'");
                    markup = markup.replace(/\&#x2F;/g, "/");

                    return markup;
                };
                return treeNode;
            },
            /**
             * render a tree item
             */
            drawTreeItem: function(treeNodeTO, root, instance) {

                if (treeNodeTO.container == true || treeNodeTO.name != 'index.xml') {

                    var nodeSpan = document.createElement("span");

                    if (!treeNodeTO.style.match(/\bfolder\b/)) {
                        treeNodeTO.linkToPreview = true;
                        
                        var icon = CStudioAuthoring.Utils.getContentItemIcon(treeNodeTO);
                        nodeSpan.appendChild(icon);

                    }else{
                        var key = instance.label;
                        key = key.replace(/\s/g,'');

                        //create spans for icons
                        var childIcons = Self.customIcons[key].childIcons,
                            childClosed = CStudioAuthoring.Utils.createIcon(childIcons.closed, "", "on-closed"),
                            childOpen = CStudioAuthoring.Utils.createIcon(childIcons.open, "", "on-open");

                        nodeSpan.appendChild(childClosed);
                        nodeSpan.appendChild(childOpen);
                    }

                    nodeSpan.innerHTML += treeNodeTO.label;
                    nodeSpan.setAttribute("title", treeNodeTO.title);
                    nodeSpan.className = treeNodeTO.style + " yui-resize-label treenode-label over-effect-set";

                    treeNodeTO.html = nodeSpan;
                    var treeNode = new YAHOO.widget.HTMLNode(treeNodeTO, root, false);

                    treeNode.html.id = "ygtvlabelel" + treeNode.index;
                    treeNode.labelElId = "ygtvlabelel" + treeNode.index;
                    treeNode.nodeType = "CONTENT";
                    treeNode.treeNodeTO = treeNodeTO;
                    // treeNode.initContent = treeNodeTO;
                    treeNode.renderHidden = true;
                    treeNode.nowrap = true;

                    if (!treeNodeTO.isContainer) {
                        treeNode.isLeaf = true;
                    }
                }

                if(instance.mods) {
                    for(var m=0; m<instance.mods.length; m++) {
                        var mod = instance.mods[m];
                        treeNode = mod.drawTreeItem(treeNodeTO, root, treeNode);
                    }
                }

                return treeNode;
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
                            Self.save(instance, Self.ROOT_OPENED, null, "root-folder");
						}

                        $el = $('#' + instance.rootFolderEl.id).parent().find('>a');
                        $el.removeClass('closed');
                        $el.addClass('open');
                    } else {
                        instance.rootFolderEl.style.display = 'none';
                        instance.state = WcmRootFolder.ROOT_CLOSED;
                        storage.eliminate( Self.getStoredPathKey(instance) );

                        $el = $('#' + instance.rootFolderEl.id).parent().find('>a');
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
                return (CStudioAuthoringContext.site + "-"+ instance.label.replace(" ", "").toLowerCase() + '-opened');
			},

            getNumKey: function(nodes, key, callback) {
                var num;
                for(n = 0; nodes.length > n;  n++) {
                    var el = nodes[n].getEl(), num;
                    num = el.getAttribute('num');
                    if(!num){
                        while ((el = el.parentElement) && !el.hasAttribute("num"));
                    }
                    try{
                        num = el.getAttribute('num') ? el.getAttribute('num') : null;
                    }catch (e){
                        num = null;
                    }
                    if(num == key) {
                        callback(nodes[n]);
                    }
                }
                return num;
            },

			openLatest: function(instance){

                var latestStored = instance.openArray;
                var index = instance.indexPath;

				if(Object.keys(latestStored).length >= 1){
                    var pathFlag = true;
					var treeEl = instance.rootFolderEl,
						site = treeEl.rootFolderSite,
						rootPath = treeEl.rootFolderPath,
						tree = instance.tree = new YAHOO.widget.TreeView(treeEl),
						paths = {},
						counter = {},
						recursiveCalls = {},
                        tmp = {},
                        k = {},
                        pathTrace = {},
                        rooth = {},
						updatePathTrace = function(j, key){
                            var appendedPath = (paths[key] && paths[key][j]) ? paths[key][j][counter[key][j]++] : "";
                            appendedPath = (appendedPath !== "") ? ("/" + appendedPath) : "";
                            return (pathTrace[key][j] = (pathTrace[key][j] + appendedPath));
                        },
                        nextPathTrace = function(j, key){
                            var cont = j == 0 ? 0 : counter[key][j] + 1;
                            return (pathTrace[key][j] + "/" + paths[key][j][counter[key][j]]); }
						YSelector = YAHOO.util.Selector.query;
					var label = instance.rootFolderEl.previousElementSibling;
					YDom.addClass(label, "loading");
					var doCall = function(n, j, key){
						Self.onLoadNodeDataOnClick(n, function(){
							n.loadComplete();

                            if(n.expanded && n.data.style.match(/\bfolder\b/)){
                                var iconsKey = n.instance.label;
                                iconsKey = iconsKey.replace(/\s/g,'');

                                var $el = $('#' + n.labelElId);
                                $el.removeClass('closed');
                                $el.addClass('open');
                            }

							if (counter[key][j] < recursiveCalls[key][j]) {
								updatePathTrace(j, key);
								var node = tree.getNodesByProperty("path", pathTrace[key][j]);
								if (node != null) {
                                    Self.getNumKey(node, key, function(currentNode) {
                                        var loadEl = YSelector(".ygtvtp", currentNode.getEl(), true);
                                        loadEl == null && (loadEl = YSelector(".ygtvlp", currentNode.getEl(), true));
                                        YDom.addClass(loadEl, "ygtvloading");
                                        doCall(currentNode, j, key);
                                    });

								} else {
									YDom.removeClass(label, "loading");
									YDom.removeClass(YSelector(".ygtvloading", treeEl), "ygtvloading");
									// Add hover effect to nodes
									Self.nodeHoverEffects(this);
                                    Self.firePathLoaded(instance);
								}
							} else {
                                k[key]++;
                                if (latestStored[key].length > k[key]) {
                                    pathTrace[key][k[key]] = rooth[key];
                                    counter[key][k[key]] = 0;
                                    (function () {
                                        tmp[key][k[key]] = latestStored[key][k[key]].replace(rooth[key], "");
                                        paths[key][k[key]] = tmp[key][k[key]].length ? (tmp[key][k[key]].charAt(0) == "/" ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split("/") : null;
                                        recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                                    })();
                                    var node, loadEl;
                                    for (var i = 0; recursiveCalls[key][k[key]] > i; i++) {
                                        if (tree.getNodeByProperty("path", nextPathTrace(k[key], key)) != null) {
                                            updatePathTrace(k[key], key);
                                        }
                                    }
                                    node = tree.getNodesByProperty("path", pathTrace[key][k[key]]);
                                    if (node == null) {
                                        node = tree.getNodesByProperty("path", updatePathTrace(k[key], key));
                                    }

                                    if (node != null) {
                                        Self.getNumKey(node, key, function(currentNode) {
                                            var loadEl = YSelector(".ygtvtp", currentNode.getEl(), true);
                                            loadEl == null && (loadEl = YSelector(".ygtvlp", currentNode.getEl(), true));
                                            YDom.addClass(loadEl, "ygtvloading");
                                            doCall(currentNode, k[key], key);
                                        });
                                    }
                                } else {
                                    //YDom.removeClass(label, "loading");
                                    //Self.firePathLoaded(instance);
                                }

                                YDom.removeClass(label, "loading");
                                YDom.removeClass(YSelector(".ygtvloading", treeEl), "ygtvloading");
                                // Add hover effect to nodes
                                Self.nodeHoverEffects(this);
                                Self.firePathLoaded(instance);
							}
						});
					}
					tree.setDynamicLoad(this.onLoadNodeDataOnClick);
					if (this.pathOnlyHasCannedSearch(rootPath, instance)) {
						var dummy = new Object();
						dummy.path = rootPath;
						var items = new Array();
						items.push(dummy);
						Self.drawTree(items, tree, null, instance, pathFlag);
						YDom.removeClass(label, "loading");
						Self.firePathLoaded(instance);
					} else {

                        var ind=0;
                        var servPath;
                        if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                            servPath = rootPath[ind];
                        } else {
                            servPath = rootPath;
                        }

                        (function (ind) {
                            function treePrint(servPath){
                                CStudioAuthoring.Service.lookupSiteContent(site, servPath, 1, "default", {
                                    success: function (treeData) {
                                        var key = treeData.item.path.replace(/\//g, "").toLowerCase();
                                        paths[key] = [],
                                            counter[key] = [],
                                            recursiveCalls[key] = [],
                                            tmp[key] = {}
                                        k[key] = 0,
                                            pathTrace[key] = [],
                                            rooth[key] = treeData.item.path;

                                        //if(servPath == "/site/website")
                                        window.treeData = treeData;

                                        var items = treeData.item.children;
                                        if (instance.showRootItem) {
                                            items = new Array(treeData.item);

                                            //add custom icon class
                                            var keyId = instance.label;
                                            keyId = keyId.replace(/\s/g,'');
                                            
                                            var $el = $('#' + instance.rootFolderEl.id).parent().find('>a');
                                            $el.removeClass('closed');
                                            $el.addClass('open');
                                        }
                                        instance.state = Self.ROOT_OPEN;
                                        Self.drawTree(items, tree, null, instance, pathFlag);
                                        pathFlag = false;

                                        if (latestStored[key] && latestStored[key][[key]] != Self.ROOT_OPENED) {
                                            pathTrace[key][k[key]] = treeData.item.path;
                                            counter[key][k[key]] = 0;
                                            (function () {
                                                tmp[key][k[key]] = latestStored[key][k[key]].replace(treeData.item.path, "");
                                                paths[key][k[key]] = tmp[key][k[key]].length ? (tmp[key][k[key]].charAt(0) == "/" ? tmp[key][k[key]].substr(1) : tmp[key][k[key]]).split("/") : null;
                                                recursiveCalls[key][k[key]] = tmp[key][k[key]].length ? paths[key][k[key]].length : 0;
                                            })();
                                            var nodes, node, loadEl;
                                            nodes = tree.getNodesByProperty("path", treeData.item.path);
                                            if (nodes != null) {
                                                Self.getNumKey(nodes, key, function(currentNode) {
                                                    node = currentNode;
                                                });
                                            }
                                            if (node == null) {
                                                node = tree.getNodeByProperty("path", updatePathTrace(k[key], key));
                                                if (node != null) {
                                                    loadEl = YAHOO.util.Selector.query(".ygtvtp", node.getEl(), true);
                                                }
                                            } else {
                                                loadEl = YAHOO.util.Selector.query(".ygtvlp", node.getEl(), true);
                                            }
                                            if (node == null) {
                                                YDom.removeClass(label, "loading");
                                                Self.firePathLoaded(instance);
                                            } else {
                                                YDom.addClass(loadEl, "ygtvloading");
                                                //YDom.setAttribute ( node , "index" ,instance.pathNumber  );
                                                doCall(node, k[key], key);
                                            }
                                        } else {
                                            YDom.removeClass(label, "loading");
                                            Self.firePathLoaded(instance);
                                        }
                                        index = instance.indexPath++;

                                        ind++;
                                        if (Object.prototype.toString.call(rootPath) === '[object Array]') {
                                            servPath = rootPath[ind];
                                        } else {
                                            servPath = rootPath;
                                        }
                                        if(servPath && Object.prototype.toString.call(rootPath) === '[object Array]'){
                                            treePrint(servPath);
                                        }
                                    },
                                    failure: function () {
                                    }
                                })

                            }
                            treePrint(servPath);
                        })(ind);

					}
				} else {
                    Self.firePathLoaded(instance);
                }
			},
            firePathLoaded: function(instance) {
                ++(Self.treePathOpenedEvt.fireCount);
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

						failure: function() {
						},

						callingWindow: window
					};

					if (newEl) {
						newEl.onclick = function() {
							CStudioAuthoring.Operations.createNewContent(
									CStudioAuthoringContext.site,
									this.searchTO.newPath,
									false,
									createCb);

							return false;
						};
					}

					searchEl.onclick = function() {

						var url = CStudioAuthoringContext.authoringAppBaseUri + "/search?site=" + CStudioAuthoringContext.site +"&s=";

						var queryParams = this.searchTO.queryParams.queryParam;

						for (var i = 0; i < queryParams.length; i++) {
							url += "&" + encodeURIComponent(queryParams[i].name) +
									"=" + encodeURIComponent(queryParams[i].value);
						}

						window.location = url;
					}
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
					return ;
				}

				var plainpath = node.treeNodeTO.path,
					path = encodeURI(plainpath),
                	site = node.treeNodeTO.site,
                	pathToOpenTo = node.openToPath;

				//Self.save(node.instance, plainpath);


				var serviceCb = {

	                    success: function(treeData, args) {

		                	/**
							 * nodes will not have collapse/expand icon if they do not have any children
							 * after clicking them.
							 */
	                		if(treeData.item.children.length == 0) {
	                			node.isLeaf = true;
	                		}

	                		Self.drawSubtree(treeData.item.children, args.node, args.pathToOpenTo, args.instance);

	            			args.fnLoadComplete();

	            			/* wire up new to search items */

	    					Self.wireUpCannedSearches();

	    					//add hover effect to nodes
	    					Self.nodeHoverEffects(this);

	    					//add blur effect for cut items
	    					Self.setChildrenStyles(args.node);
	            	    },

	                    failure: function(err, args) {
	                        args.fnLoadComplete();
	                    },

	                    argument: {
	                        "node": node,
	                        "instance": node.instance,
	                        "fnLoadComplete": fnLoadComplete,
	                        pathToOpenTo: pathToOpenTo
	                    }
	           	}

	            CStudioAuthoring.Service.lookupSiteContent(site, path, 1, "default", serviceCb);
    },

    expandTree: function(node, fnLoadComplete) {
        if(node) {
            var iniPath;
            try {
                iniPath = node.treeNodeTO.path;
            } catch (er) {
                iniPath = node.path;
            }
            var fileName = iniPath.split('/')[node.treeNodeTO.path.split('/').length - 1],
                roothpath = iniPath.replace("/" + fileName, ""),
                plainpath = iniPath,
                el = node.getEl(),
                num = el.getAttribute('num');
            plainpath = roothpath == '/site' ? "root-folder" : plainpath;
            if (!num) {
                while ((el = el.parentElement) && !el.hasAttribute("num"));
            }
            if(el) {
                Self.save(node.instance, plainpath, null, el.getAttribute('num') ? el.getAttribute('num') : "root-folder", "expand");
            }

            var id = node.labelElId,
                key = node.instance.label;
            key = key.replace(/\s/g,'');

            var $el = $('#' + id);
            $el.removeClass('closed');
            $el.addClass('open');
        }
    },

    collapseTree: function(node, fnLoadComplete) {
        var iniPath;
        try{
            iniPath = node.treeNodeTO.path;
        }catch(er){
            iniPath = node.path;
        }
        var path = iniPath.replace(/\//g, "").toLowerCase();
            fileName = iniPath.split('/')[node.treeNodeTO.path.split('/').length - 1],
            plainpath = iniPath.replace("/" + fileName, ""),
            el = node.getEl(),
            num = el.getAttribute('num');
        plainpath = (plainpath == '/site') || path == num ? "root-folder" : plainpath;
        if(!num){
            while ((el = el.parentElement) && !el.hasAttribute("num"));
        }
        //Self.remove(node.instance, plainpath);
        Self.save(node.instance, plainpath, fileName, el.getAttribute('num') ? el.getAttribute('num') : "root-folder", "collapse");

        var id = node.labelElId,
            key = node.instance.label;
        key = key.replace(/\s/g,'');

        var $el = $('#' + id);
        $el.removeClass('open');
        $el.addClass('closed');
    },

    save: function(instance, path, fileName, num, mode) {
        var flag = true;
        if(!instance.openArray[num]){
            instance.openArray[num] = [];
        }
        for(var i=0; i < instance.openArray[num].length; i++){
            if(path.indexOf(instance.openArray[num][i]) > -1){
                instance.openArray[num].splice(i, 1);
                i--;
                continue;
            }else{
                var aux = path;
                if(fileName){aux = aux + '/' + fileName;}
                if(instance.openArray[num][i].indexOf(aux) > -1){
                    instance.openArray[num].splice(i, 1);
                    i--;
                    continue;
                }
                if(instance.openArray[num].length > 0 && instance.openArray[num][i]){
                    if(instance.openArray[num][i].indexOf(path) > -1)
                        flag = false;
                }
            }
        }
        if(flag) {
            if(path == "root-folder"){
                instance.openArray[num] = [];
            }
            instance.openArray[num].push(path);
        }
        for(var i=0; i < instance.openArray[num].length; i++){

            if (instance.openArray[num].length > 1 && instance.openArray[num][i].indexOf("root-folder") > -1) {
                instance.openArray[num].splice(i, 1);
            }

            if (instance.openArray[num].length < 2 && instance.openArray[num][i].indexOf("root-folder") > -1 &&
                num != "root-folder" && mode != "expand") {
                delete instance.openArray[num];
                break;
            }
        }
        //storage.write(Self.getStoredPathKey(instance, path), path, 360);
        storage.write(Self.getStoredPathKey(instance), JSON.stringify(instance.openArray), 360);
    },

    remove: function (instance, path) {
       storage.eliminate( Self.getStoredPathKey(instance) );
    },

    findAncestor:function (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    },

    updateNote:function (note, treeData) {
        note.browserUri != treeData.browserUri && treeData.browserUri != undefined ?
            note.browserUri = treeData.browserUri : null;
        note.contentType != treeData.contentType && treeData.contentType != undefined ?
            note.contentType = treeData.contentType : null;
        note.editedDate != treeData.editedDate && treeData.editedDate != undefined ?
            note.editedDate = treeData.editedDate : null;
        note.fileName != treeData.fileName && treeData.fileName != undefined ?
            note.fileName = treeData.fileName : null;
        note.formId != treeData.formId && treeData.formId != undefined ?
            note.formId = treeData.formId  : null;
        note.formPagePath != treeData.formPagePath && treeData.formPagePath != undefined ?
            note.formPagePath = treeData.formPagePath : null;
        note.inFlight != treeData.inFlight && treeData.inFlight != undefined ?
            note.inFlight = treeData.inFlight : null;
        note.inProgress != treeData.inProgress && treeData.inProgress != undefined ?
            note.inProgress = treeData.inProgress : null;
        note.internalName != treeData.internalName && treeData.internalName != undefined ?
            note.internalName = treeData.internalName : null;
        note.isComponent != treeData.isComponent && treeData.isComponent != undefined ?
            note.isComponent = treeData.isComponent : null;
        note.isContainer != treeData.isContainer && treeData.isContainer != undefined ?
            note.isContainer = treeData.isContainer : null;
        note.isLevelDescriptor != treeData.isLevelDescriptor && treeData.isLevelDescriptor != undefined ?
            note.isLevelDescriptor = treeData.isLevelDescriptor : null;
        note.link != treeData.link && treeData.link != undefined ?
            note.link = treeData.link : null;
        note.linkToPreview != treeData.linkToPreview && treeData.linkToPreview != undefined ?
            note.linkToPreview = treeData.linkToPreview : null;
        note.lockOwner != treeData.lockOwner && treeData.lockOwner != undefined ?
            note.lockOwner = treeData.lockOwner : null;
        note.modifier != treeData.modifier && treeData.modifier != undefined ?
            note.modifier = treeData.modifier : null;
        note.nodeRef != treeData.nodeRef && treeData.nodeRef != undefined ?
            note.nodeRef = treeData.nodeRef : null;
        note.path != treeData.path && treeData.path != undefined ?
            note.path = treeData.path : null;
        note.pathSegment != treeData.pathSegment && treeData.pathSegment != undefined ?
            note.pathSegment = treeData.pathSegment : null;
        note.previewable != treeData.previewable && treeData.previewable != undefined ?
            note.previewable = treeData.previewable : null;
        note.site != treeData.site && treeData.site != undefined ?
            note.site = treeData.site : null;
        note.status != treeData.status && treeData.status != undefined ?
            note.status = treeData.status : null;
        note.uri != treeData.uri && treeData.uri != undefined ?
            note.uri = treeData.uri : null;
    },

    /**
	* methos that fires when new items added to tree.
	*/
	refreshNodes: function(treeNode, status, parent, tree, instance, changeStructure, typeAction, oldPath, dependencies) {
        var refresh = typeAction == "edit" ? (instance && ( treeNode.path.indexOf(instance.path) == 0 )) : true;
        if(refresh){
            var WcmAssetsFolder = CStudioAuthoring.ContextualNav.WcmAssetsFolder;
            var tree = tree ? tree : Self.myTree,
                isMytree = false,
                currentPath = treeNode.data ? treeNode.data.path : treeNode.path,
                currentUri = treeNode.data ? treeNode.data.uri : treeNode.uri,
                treePathsLocal = self.treePaths ? self.treePaths : WcmAssetsFolder.treePaths;
            if(tree &&  Self.myTree) {
                for (var i = 0; i < treePathsLocal.length; i++) {
                    if (treePathsLocal[i] == Self.myTree.id) {
                        isMytree = true;
                    }
                }
                if (!isMytree) {
                    tree = Self.myTree;
                }
            }
            if(tree) {
                var copiedItemNode = Self.copiedItem;
                var node = [];

                if(currentPath == '/site/website' && typeAction == "createContent"){
                    var auxNodes = tree.getNodesByProperty("path", currentPath);
                    if(auxNodes.length){
                        for(var i=0; i < auxNodes.length; i++){
                            if(auxNodes[i].data.path == '/site/website'){
                                node[0] = auxNodes[i];
                            }
                        }
                    }
                }else{
                    if(oldPath && currentUri != oldPath && tree.getNodesByProperty("uri", oldPath)) {
                        node = tree.getNodesByProperty("uri", oldPath) ? tree.getNodesByProperty("uri", oldPath) : null;
                    }else{
                        node = tree.getNodesByProperty("path", currentPath) ? tree.getNodesByProperty("path", currentPath) : null;
                    }

                }

                if (copiedItemNode != null && (currentPath == copiedItemNode.data.path) && treeNode.parent) {
                    if(treeNode.parent.data.path) {
                        node = tree.getNodesByProperty("path", treeNode.parent.data.path);
                        Self.copiedItem = null;
                    }
                }

                if (node) {
                    for(var i=0; i<node.length; i++) {
                        node[i] = parent ? node[i].parent : node[i];
                        if (node[i].isLeaf) node[i].isLeaf = false;
                    }
                }
                else {
                    node = parent ? treeNode.parent : treeNode;
                }

                if(!changeStructure){

                    if(instance){
                        //Self.initializeContentTree(instance.rootFolderEl, null, instance);
                        var nodeToChange;
                        if(parent){
                            nodeToChange = tree.getNodesByProperty("path", currentPath);
                        }else{
                            nodeToChange = node;
                        }

                        /* Updating the tree Url if the path has been change. */
                        if(oldPath && currentPath != oldPath && tree.getNodesByProperty("uri", oldPath)) {
                            var treeToUpdate = tree.getNodesByProperty("uri", oldPath);
                            for(var i=0; i<treeToUpdate.length;i++) {
                                Self.updateNote(treeToUpdate[i].data, treeNode.data ? treeNode.data : treeNode);
                                treeToUpdate[i].label = treeNode.data ? treeNode.data.internalName : treeNode.internalName;
                                treeToUpdate[i].treeNodeTO.path = treeNode.data ? treeNode.data.path : treeNode.path;
                                treeToUpdate[i].treeNodeTO.uri = treeNode.data ? treeNode.data.uri : treeNode.uri;
                            }
                            nodeToChange = treeToUpdate;
                        }

                        if(nodeToChange){
                            for(var i=0; i<nodeToChange.length;i++) {
                                (function (nodeToChange,i) {
                                    lookupSiteContent(nodeToChange[i], currentUri);
                                    nodeOpen = true;
                                })(nodeToChange,i);
                            }
                        }

                        if(dependencies){
                            var treeToUpdateDependencies;
                            for(var i=0; i<dependencies.length;i++) {
                                if(dependencies[i] != currentUri){
                                    treeToUpdateDependencies = tree.getNodesByProperty("uri", dependencies[i]);
                                    if(treeToUpdateDependencies) {
                                        for (var j = 0; j < treeToUpdateDependencies.length; j++) {
                                            if(treeToUpdateDependencies[j].data.contentType != "folder"){
                                                (function (treeToUpdateDependencies, j) {
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
                                CStudioAuthoring.Service.lookupSiteContent(CStudioAuthoringContext.site, curNode.data.uri, 1, "default", {
                                    success: function (treeData) {
                                        if (currentUri.replace(/ /g,"%20") == treeData.item.uri) {
                                            var style = "",
                                                cont = paramCont ? paramCont : 0,
                                                currentInternalName = (treeData.item.internalName != "" ? treeData.item.internalName  : treeData.item.name),
                                                curElt = YDom.get(curNode.labelElId);
                                            // curElt ? curElt.innerHTML = currentInternalName : null;
                                            curNode.data = Self.createTreeNodeTransferObject(treeData.item);
                                            if(typeAction === "publish" && (treeData.item.inProgress && !treeData.item.scheduled)){
                                                treeData.item.inFlight = true;
                                            }
                                            style = CStudioAuthoring.Utils.getIconFWClasses(treeData.item);
                                            if (treeData.item.isPreviewable) {
                                                style = style + " preview";
                                            } else {
                                                style = style + " no-preview";
                                            }
                                            if (treeData.item.contentType == "asset") {
                                                style = style + " component";
                                            }
                                            style = style + " treenode-label";
                                            treeData.item.style = style;
                                            if(curElt){
                                                curElt.className = style;
                                                if(curNode.data.title && curElt.title != curNode.data.title) {
                                                    curElt.title = curNode.data.title;
                                                }
                                            }
                                            if (style.indexOf("deleted") != -1 || treeData.item.isDeleted) {
                                                var tempSplit = curNode.labelElId.split("labelel");
                                                var parentNode = YDom.get(tempSplit[0] + tempSplit[1]);
                                                parentNode.style.display = 'none';
                                                tree.removeNode(curNode);
                                                if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                                    CStudioAuthoring.SelectedContent.getSelectedContent()[0] ?
                                                        CStudioAuthoring.SelectedContent.unselectContent(CStudioAuthoring.SelectedContent.getSelectedContent()[0]) : null;
                                                }
                                                eventCM.typeAction = typeAction;
                                                document.dispatchEvent(eventCM);
                                                Self.refreshAllDashboards();
                                            }
                                            else {
                                                if (style.indexOf("in-flight") != -1) {
                                                    setTimeout(function () {
                                                        lookupSiteContent(curNode, currentUri);
                                                    }, 300);
                                                } else {
                                                    cont++;

                                                    var indexOfFolder = -1;
                                                    if (curNode.labelStyle){
                                                        indexOfFolder = curNode.labelStyle.indexOf("folder");
                                                    }else{
                                                        indexOfFolder = curNode.html.className.indexOf("folder");
                                                    }

                                                    if ((indexOfFolder != -1 && cont < 25) || (indexOfFolder == -1 && cont < 2)) {
                                                        setTimeout(function () {
                                                            lookupSiteContent(curNode, currentUri, cont);
                                                            if (typeof WcmDashboardWidgetCommon != 'undefined' && (eventNS.typeAction =="edit" && !eventNS.draft)) {
                                                                CStudioAuthoring.SelectedContent.getSelectedContent()[0] ?
                                                                    CStudioAuthoring.SelectedContent.unselectContent(CStudioAuthoring.SelectedContent.getSelectedContent()[0]) : null;
                                                            }
                                                            if((indexOfFolder == -1) && (typeAction != "edit")) {
                                                                eventCM.typeAction = typeAction;
                                                                document.dispatchEvent(eventCM);
                                                                Self.refreshAllDashboards();
                                                            }
                                                        }, 300);
                                                    }
                                                }
                                            }

                                            var icon = CStudioAuthoring.Utils.getContentItemIcon(treeData.item);
                                            curElt.innerHTML = "";
                                            curElt.appendChild(icon);
                                            curElt ? curElt.innerHTML += currentInternalName : null;
                                        }
                                    },
                                    failure: function () {
                                    }
                                })
                            }
                        }

                    }
                }else {
                    if(node) {
                        nodeOpen = true;
                        for(var i=0; i<node.length; i++) {
                            var curNode = node[i];
                            if (curNode.nodeType == "CONTENT") {
                                var itemStore = instance ? storage.read(Self.getStoredPathKey(instance)) : null;
                                //console.log(itemStore);
                                if(YDom.get(curNode.labelElId)) {
                                    tree.removeChildren(curNode);
                                    var loadEl = YAHOO.util.Selector.query(".ygtvtp", curNode.getEl(), true);
                                    loadEl == null && (loadEl = YAHOO.util.Selector.query(".ygtvlp", curNode.getEl(), true));
                                    YDom.addClass(loadEl, "ygtvloading");
                                    curNode.renderChildren();
                                    curNode.refresh();
                                    //console.log(itemStore);
                                    if (instance) storage.write(Self.getStoredPathKey(instance), itemStore, 360);
                                    self.expandTree ? self.expandTree(curNode) : WcmAssetsFolder.expandTree;
                                    Self.refreshAllDashboards();
                                }

                            } else {
                                var root = false;
                                if (Object.prototype.toString.call(instance.path) === '[object Array]') {
                                    var path;
                                    try {
                                        path = curNode.data ? curNode.data.path ? curNode.data.path : treeNode.treeNodeTO.path : treeNode.treeNodeTO.path;
                                    } catch (er) {
                                        path = curNode.data ? curNode.data.path ? curNode.data.path : treeNode.path ? treeNode.path : null : treeNode.path ? treeNode.path : null;
                                    }
                                    for (var i = 0; i <= instance.path.length; i++) {
                                        if (path == instance.path[i]) {
                                            root = true;
                                        }
                                    }
                                }
                                if (root && instance) {
                                    Self.initializeContentTree(instance.rootFolderEl, null, instance);
                                    Self.toggleFolderState(instance, "open");
                                }
                                Self.refreshAllDashboards();
                            }
                            if(i >= (node.length - 1)){
                                eventYS.parent = null;
                                eventNS.parent = null;
                            }
                        }
                    }
                    if (root && instance) {
                        var __self = this;
                        setTimeout(function () {
                            __self.openLatest(instance);
                        }, 100);
                    }
                }

                var treeInner = YDom.get('acn-dropdown-menu-inner');
                var previousCutEl = YDom.getElementsByClassName("status-icon", null, treeInner);

                for (var i = 0; i < previousCutEl.length; i++) {

                    if (previousCutEl[i].style.color == Self.CUT_STYLE_RGB || previousCutEl[i].style.color == Self.CUT_STYLE) {

                        if (status) {
                            var tempSplit = previousCutEl[i].id.split("labelel");
                            var parentNode = YDom.get(tempSplit[0] + tempSplit[1]);
                            parentNode.style.display = 'none';
                            if (Self.cutItem != null) {
                                var parNode = tree.getNodeByProperty("path", Self.cutItem.parent.data.path);
                                //if parent have single child and we did cut and paste the child,
                                //we should refresh the parent node to remove expand collapse icon
                                if (parNode && parNode.children && parNode.children.length == 1) {
                                    tree.removeChildren(parNode);
                                    var parLoadEl = YSelector(".ygtvtp", parNode.getEl(), true);
                                    parLoadEl == null && (parLoadEl = YSelector(".ygtvlp", parNode.getEl(), true));
                                    YDom.addClass(parLoadEl, "ygtvloading");
                                    parNode.renderChildren();
                                    parNode.refresh();
                                } else if (parNode) {
                                    //remove the only item from parent node.
                                    tree.removeNode(Self.cutItem);
                                }
                                Self.cutItem = null;
                            }
                        } else {
                            previousCutEl[i].removeAttribute("style");
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
		if (node.nodeType == "CONTENT") {
			if (node.data.previewable == true && node.instance.onClickAction == "preview") {

				if(node.data.isContainer == true && node.data.pathSegment != 'index.xml') {
					// this is a false state coming from the back-end
				} else /*if (node.data.isLevelDescriptor == false)*/ {
                    CStudioAuthoring.Operations.openPreview(node.data, "", false, false);
				}
			}
		}  else if (node.nodeType == "SEARCH") {
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
                retTransferObj.link = "UNSET";
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
                retTransferObj.editedDate = "";
                retTransferObj.modifier = "";
                retTransferObj.pathSegment = treeItem.name;
                retTransferObj.lockOwner = treeItem.lockOwner;
                retTransferObj.inProgress = treeItem.inProgress;
                retTransferObj.previewable = treeItem.previewable;
                retTransferObj.mimeType = treeItem.mimeType;
                retTransferObj.contentType = treeItem.contentType;
                var itemNameLabel = "Page";
                
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
                retTransferObj.style = CStudioAuthoring.Utils.getIconFWClasses(treeItem); //, treeItem.container

                //spilt status and made it as comma seperated items.
                var statusStr = retTransferObj.status;
                if (retTransferObj.status.indexOf(" and ") != -1) {
                    var statusArray = retTransferObj.status.split(" and ");
                    if (statusArray &&  statusArray.length >= 2) {
                        statusStr = "";
                        for (var statusIdx=0; statusIdx<statusArray.length; statusIdx++) {
                            if (statusIdx == (statusArray.length - 1)) {
                                statusStr += statusArray[statusIdx];
                            } else {
                                statusStr += statusArray[statusIdx] + ", ";
                            }
                        }
                    }
                }

                if (treeItem.component) {
                    itemNameLabel = "Component";
                } else if (treeItem.document) {
                    itemNameLabel = "Document";
                }

                if (retTransferObj.internalName == "") {
                    retTransferObj.internalName = treeItem.name;
                }

                if (retTransferObj.internalName == "crafter-level-descriptor.level.xml") {
                    retTransferObj.internalName = "Section Defaults";
                }

                retTransferObj.label = retTransferObj.internalName;
                
                if (treeItem.previewable == false) {
                    retTransferObj.style += " no-preview";
                }else{
                    retTransferObj.style += " preview";
                }

                if (treeItem.disabled == true) {
                    retTransferObj.style += " disabled";
                }

                if (treeItem.container == true) {
                    retTransferObj.fileName = treeItem.name;
                } else {
                    retTransferObj.fileName = "";
                }

                if (treeItem.userFirstName != undefined && treeItem.userLastName != undefined) {
                    retTransferObj.modifier = treeItem.userFirstName + " " + treeItem.userLastName;
                }

                var ttFormattedEditDate = "";
                if (treeItem.eventDate != "" && treeItem.eventDate != undefined) {
                    var formattedEditDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.eventDate, studioTimeZone);
                    retTransferObj.editedDate = formattedEditDate;
                    ttFormattedEditDate = CStudioAuthoring.Utils.formatDateFromUTC(treeItem.eventDate, studioTimeZone);
                }
                
                var icon = treeItem.folder ? CStudioAuthoring.Utils.createIcon("", Self.defaultIcons.childClosed )
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
                            icon);
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
                            "",
                            icon);
                }
                return retTransferObj;
            },
            /**
             * build the HTML for the scheduled tool tip.
             *
             */
            buildToolTipRegular: function(label, contentType, style, status, editedDate, modifier, lockOwner, itemNameLabel, nan, icon) {
                if (!itemNameLabel) {
                    itemNameLabel = "Page";
                }

                label = CStudioAuthoring.Utils.replaceWithASCIICharacter(label);

                return CStudioAuthoring.Utils.buildToolTip(itemNameLabel, label, contentType, style, status, editedDate, modifier, lockOwner, "", icon)
            },

            /**
             * build the HTML for the scheduled tool tip.
             *
             */
            buildToolTipScheduled: function(label, contentType, style, status, editedDate, modifier, lockOwner, itemNameLabel, schedDate, icon) {
                var toolTip = "";
                if (!itemNameLabel) {
                    itemNameLabel = "Page";
                }

                label = CStudioAuthoring.Utils.replaceWithASCIICharacter(label);

                try {
                    toolTip = CStudioAuthoring.Utils.buildToolTip(itemNameLabel, label, contentType, style, status, editedDate, modifier, lockOwner, schedDate, icon);
                }
                catch(err) {
                    //console.log(err);
                }
                return toolTip;
            },


			/**
			 * render the context menu
			 */
			_renderContextMenu: function(target, p_aArgs, component, menuItems, oCurrentTextNode, isWrite) {
				    var aMenuItems;
                	var menuWidth = "auto";

                	component.lastSelectedTextNode = target.parentNode.parentNode.parentNode.parentNode;
                    var menuId = YDom.get(p_aArgs.id);
                    p_aArgs.clearContent();
					var d = document.createElement("div");
					d.className = "bd context-menu-load-msg";
					d.innerHTML = CMgs.format(siteDropdownLangBundle, "loading");
					menuId.appendChild(d);

                    var formPath = oCurrentTextNode.data.formPagePath,
                        isContainer = oCurrentTextNode.data.isContainer,
                        isComponent = oCurrentTextNode.data.isComponent,
                        isTaxonomy = (oCurrentTextNode.data.contentType).toLowerCase().indexOf("taxonomy") !== -1 ? true : false,
                        isLevelDescriptor = oCurrentTextNode.data.isLevelDescriptor,
                        isLocked = (oCurrentTextNode.data.lockOwner != "" && oCurrentTextNode.data.lockOwner != CStudioAuthoringContext.user),
                        isInProgress = oCurrentTextNode.data.inProgress,
                        isLevelDescriptor = oCurrentTextNode.data.isLevelDescriptor,
                        isFolder = (isContainer && oCurrentTextNode.data.fileName != 'index.xml') ? true : false,
                        isOpen = null;


                    //Get user permissions to get read write operations
					var checkPermissionsCb = {
                        success: function(results) {
                            var isCreateFolder = CStudioAuthoring.Service.isCreateFolder(results.permissions);
                            var isCreateContentAllowed = CStudioAuthoring.Service.isCreateContentAllowed(results.permissions);
                            var isChangeContentTypeAllowed = CStudioAuthoring.Service.isChangeContentTypeAllowed(results.permissions);
                            // check if the user is allowed to edit the content
                            var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(results.permissions);
                            var isDeleteAllowed = CStudioAuthoring.Service.isDeleteAllowed(results.permissions) && !isOpen;
                            var dependenciesAllowed = function (){
                                    //dependencies dialog
                                    p_aArgs.addItems([
                                        {
                                            text: CMgs.format(siteDropdownLangBundle, "wcmContentDependencies"),
                                            onclick: { fn: function(){
                                                var callback = {
                                                    success: function(contentTO) {
                                                        var selectedContent = [];
                                                        selectedContent.push(contentTO.item);

                                                        CStudioAuthoring.Operations.viewDependencies(
                                                            CStudioAuthoringContext.site,
                                                            selectedContent,
                                                            false
                                                        );
                                                    },
                                                    failure: function() {

                                                    }
                                                }

                                                CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, callback, false, false);
                                            } }
                                        }
                                    ]);
                            };
                            var publishAllowed = function (){
                                //add publish/request
                                var isRelevant = !(oCurrentTextNode.data.lockOwner != "") && !(oCurrentTextNode.data.status.toLowerCase().indexOf("live") !== -1);

                                if(isRelevant) {

                                    if( CStudioAuthoring.Service.isPublishAllowed(results.permissions)){
                                        p_aArgs.addItems([
                                            {
                                                text: CMgs.format(siteDropdownLangBundle, "wcmContentApprove"),
                                                onclick: { fn: function(){
                                                    var callback = {
                                                        success: function(contentTO) {
                                                            var selectedContent = [];
                                                            selectedContent.push(contentTO.item);

                                                            CStudioAuthoring.Operations.approveCommon(
                                                                CStudioAuthoringContext.site,
                                                                selectedContent,
                                                                false
                                                            );
                                                        },
                                                        failure: function() {

                                                        }
                                                    }

                                                    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, callback, false, false);
                                                } }
                                            }
                                        ]);
                                    }else {
                                        if(((oCurrentTextNode.data.status.toLowerCase().indexOf(CStudioAuthoring.Constants.STATUS.submittedStatus) === -1) &&
                                            (oCurrentTextNode.data.status.toLowerCase().indexOf(CStudioAuthoring.Constants.STATUS.scheduledStatus) === -1)) &&
                                            (oCurrentTextNode.data.status.toLowerCase().indexOf(CStudioAuthoring.Constants.STATUS.inWorkflowStatus) === -1)){
                                            p_aArgs.addItems([
                                                {
                                                    text: CMgs.format(siteDropdownLangBundle, "wcmContentSubmit"),
                                                    onclick: { fn: function(){
                                                        var callback = {
                                                            success: function(contentTO) {
                                                                var selectedContent = [];
                                                                selectedContent.push(contentTO.item);

                                                                CStudioAuthoring.Operations.submitContent(
                                                                    CStudioAuthoringContext.site,
                                                                    selectedContent
                                                                );
                                                            },
                                                            failure: function() {

                                                            }
                                                        }

                                                        CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, callback, false, false);
                                                    } }
                                                }
                                            ]);
                                        }
                                    }
                                }
                            };

		                    if(isLocked == true && isWrite == true) {
		                    	p_aArgs.addItems([ menuItems.viewOption ]);

                        		if (isContainer == true) {
                                    if (isCreateContentAllowed) {
                                        p_aArgs.addItems([ menuItems.newContentOption ]);
                                    }
		                        	p_aArgs.addItems([ menuItems.newFolderOption ]);
		                        }
	                        	p_aArgs.addItems([ menuItems.separator ]);
	                        	//The item is locked
								//p_aArgs.addItems([ menuItems.cutOption ]);
	                        	p_aArgs.addItems([ menuItems.copyOption ]);

                                if((oCurrentTextNode.data.lockOwner != ""
                                    && ((CStudioAuthoringContext.role === "admin") || (CStudioAuthoringContext.role === "site_admin")))
                                    || oCurrentTextNode.data.lockOwner === CStudioAuthoringContext.user ) {
                                    p_aArgs.addItems([ menuItems.separator ]);
                                    p_aArgs.addItems([ menuItems.unlockOption ]);
                                }

								var checkClipboardCb = {
			                        success: function(collection) {
										var contextMenuItems = [];
										contextMenuItems = this.menuItems;
			                            this.args.addItems(contextMenuItems);

                                        var idTree = oCurrentTextNode.tree.id.toString().replace(/-/g,'');
                                        Self.myTree = Self.myTreePages[idTree];

                                        if ((collection.count > 0 && isContainer) && collection.item[0].uri.replace(/\/\//g,"/") != oCurrentTextNode.data.uri) {
                                            if(Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/"))){
                                                if(Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/")).parent.contentElId != oCurrentTextNode.contentElId){
                                                    this.args.addItems([ menuItems.pasteOption ]);
                                                }
                                            }
                                            Self.copiedItem = Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/"));
                                        }

			                            this.args.render();
										menuId.removeChild(d);
			                        },
			                        failure: function() { },
			                        args: p_aArgs,
			                        menuItems: aMenuItems,
			                        menuEl: menuId,
			                        menuWidth: menuWidth,
			                        itemInProgress: isInProgress,
			                        item: oCurrentTextNode.data
			                    };

                                CStudioAuthoring.Clipboard.getClipboardContent(checkClipboardCb);
                    
			                    p_aArgs.render();
								menuId.removeChild(d);
		                    }
		                   	else if(!isWrite) {
		                   		p_aArgs.addItems([ menuItems.viewOption ]);

                                if (isComponent == true || isLevelDescriptor == true) {
                                    if (formPath == "" || formPath == undefined) {
                                    } else {
                                        if (!isUserAllowed) {
                                            if (isCreateContentAllowed) {
                                                p_aArgs.addItems([ menuItems.newContentOption ]);
                                            }
                                        } else {
                                            if (!isFolder && isChangeContentTypeAllowed) {
                                                p_aArgs.addItems([ menuItems.separator ]);
                                                p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                            }
                                        }
                                    }
                                } else {
                                    if (formPath == "" || formPath == undefined) {
                                        if (isUserAllowed) {
                                            if (isContainer == true) {
                                                if (isCreateContentAllowed) {
                                                    p_aArgs.addItems([ menuItems.newContentOption ]);
                                                }
                                            }
                                            if (!isFolder && isChangeContentTypeAllowed) {
                                                p_aArgs.addItems([ menuItems.separator ]);
                                                p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                            }
                                        }
                                    } else {
                                        if (isContainer == true) {
                                            if (isCreateContentAllowed) {
                                                p_aArgs.addItems([ menuItems.newContentOption ]);
                                            }
                                            if (isUserAllowed) {
                                                if (!isFolder && isChangeContentTypeAllowed) {
                                                    p_aArgs.addItems([ menuItems.separator ]);
                                                    p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                                }
                                            }
                                        }
                                    }
                                }
                                p_aArgs.addItems([ menuItems.separator ]);
                                p_aArgs.addItems([ menuItems.copyOption ]);

                                if((oCurrentTextNode.data.lockOwner != ""
                                    && ((CStudioAuthoringContext.role === "admin") || (CStudioAuthoringContext.role === "site_admin")))
                                    || oCurrentTextNode.data.lockOwner === CStudioAuthoringContext.user ) {
                                    p_aArgs.addItems([ menuItems.separator ]);
                                    p_aArgs.addItems([ menuItems.unlockOption ]);
                                }

                                if(oCurrentTextNode.data.contentType != "folder") {
                                    p_aArgs.addItems([ menuItems.separator ]);
                                    publishAllowed();
                                    dependenciesAllowed();
                                }

		                   		p_aArgs.render();
								menuId.removeChild(d);
		                   	}
		                   	else {
			                    if (isComponent == true || isLevelDescriptor == true || isTaxonomy == true) {
			                        if (formPath == "" || formPath == undefined) {
			                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                        p_aArgs.addItems([ menuItems.separator ]);
			                        	if (isUserAllowed) {
                                            if (isDeleteAllowed) {
			                        		    p_aArgs.addItems([ menuItems.deleteOption ]);
			                        		}
			                        	}
                                        p_aArgs.addItems([ menuItems.copyOption ]);
                                        

			                        } else {
			                        	if (isUserAllowed) {
				                        	p_aArgs.addItems([ menuItems.editOption ]);
				                        	p_aArgs.addItems([ menuItems.viewOption ]);

				                        	if(isDeleteAllowed ||!isFolder && isChangeContentTypeAllowed ){
                                                p_aArgs.addItems([ menuItems.separator ]);
                                            }
				                        	if (isDeleteAllowed) {
				                        	    p_aArgs.addItems([ menuItems.deleteOption ]);
				                        	}
                                            if (!isFolder && isChangeContentTypeAllowed) {
                                                p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                            }

				                        	p_aArgs.addItems([ menuItems.separator ]);
				                        	p_aArgs.addItems([ menuItems.cutOption ]);
				                        	p_aArgs.addItems([ menuItems.copyOption ]);
			                        	} else {
				                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                            if (isCreateContentAllowed) {
                                                p_aArgs.addItems([ menuItems.newContentOption ]);
                                            }
                                            p_aArgs.addItems([ menuItems.separator ]);
                                            p_aArgs.addItems([ menuItems.copyOption ]);
			                        	}
			                        }
			                    } else {
			                        if (formPath == "" || formPath == undefined) {
			                        	if (isCreateFolder == true) {
			                        		if (isContainer == true) {
                                                if (isCreateContentAllowed) {
                                                    p_aArgs.addItems([ menuItems.newContentOption ]);
                                                }
                                                p_aArgs.addItems([ menuItems.newFolderOption ]);
                                                p_aArgs.addItems([ menuItems.renameFolderOption ]);
                                                
					                        }
				                        	if (isUserAllowed) {

                                                if (isDeleteAllowed || !isFolder && isChangeContentTypeAllowed){
                                                    p_aArgs.addItems([ menuItems.separator ]);
                                                }
				                        		if (isDeleteAllowed) {
					                        	    p_aArgs.addItems([ menuItems.deleteOption ]);
					                        	}
                                                if (!isFolder && isChangeContentTypeAllowed) {
                                                    p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                                }

					                        	p_aArgs.addItems([ menuItems.separator ]);
					                        	p_aArgs.addItems([ menuItems.cutOption ]);
					                        	p_aArgs.addItems([ menuItems.copyOption ]);
					                        }
				                        }
			                        	else {
			                        		if (isContainer == true) {
                                                if (isCreateContentAllowed) {
                                                    p_aArgs.addItems([ menuItems.newContentOption ]);
                                                }
				                        	} else if (isUserAllowed) {
					                        	p_aArgs.addItems([ menuItems.separator ]);
				                        		p_aArgs.addItems([ menuItems.deleteOption ]);
				                        	}
			                        	}
			                        } else {
			                        	if (isContainer == true) {
				                        	if (isCreateFolder == true) {
				                        		if (isUserAllowed) {
						                        	p_aArgs.addItems([ menuItems.editOption ]);
						                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                                    if (isCreateContentAllowed) {
                                                        p_aArgs.addItems([ menuItems.newContentOption ]);
                                                    }
						                        	p_aArgs.addItems([ menuItems.newFolderOption ]);

                                                    if (isDeleteAllowed || !isFolder && isChangeContentTypeAllowed) {
                                                        p_aArgs.addItems([ menuItems.separator ]);
                                                    }

						                        	if (isDeleteAllowed) {
						                        	    p_aArgs.addItems([ menuItems.deleteOption ]);
						                        	}
						                        	if (!isFolder && isChangeContentTypeAllowed) {
                                                        p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                                    }

						                        	p_aArgs.addItems([ menuItems.separator ]);
						                        	p_aArgs.addItems([ menuItems.cutOption ]);
                                                    p_aArgs.addItems([ menuItems.copyOption ]);
						                        } else {
						                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                                    if (isCreateContentAllowed) {
                                                        p_aArgs.addItems([ menuItems.newContentOption ]);
                                                    }
						                        	p_aArgs.addItems([ menuItems.newFolderOption ]);
                                                    p_aArgs.addItems([ menuItems.separator ]);
                                                    p_aArgs.addItems([ menuItems.copyOption ]);
						                        }
					                        } else {
				                        		if (isUserAllowed) {
						                        	p_aArgs.addItems([ menuItems.editOption ]);
						                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                                    if (isCreateContentAllowed) {
                                                        p_aArgs.addItems([ menuItems.newContentOption ]);
                                                    }

						                        	if (!isFolder && isChangeContentTypeAllowed) {
                                                        p_aArgs.addItems([ menuItems.separator ]);
                                                        p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                                    }
                                                    p_aArgs.addItems([ menuItems.separator ]);
                                                    p_aArgs.addItems([ menuItems.copyOption ]);
						                        } else {
						                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                                    if (isCreateContentAllowed) {
                                                        p_aArgs.addItems([ menuItems.newContentOption ]);
                                                    }
                                                    p_aArgs.addItems([ menuItems.separator ]);
                                                    p_aArgs.addItems([ menuItems.copyOption ]);
						                        }
					                        }
					                    } else {
				                        	if (isUserAllowed) {
					                        	p_aArgs.addItems([ menuItems.editOption ]);
					                        	p_aArgs.addItems([ menuItems.viewOption ]);

					                        	p_aArgs.addItems([ menuItems.separator ]);
					                        	if (isDeleteAllowed) {
					                        	    p_aArgs.addItems([ menuItems.deleteOption ]);
					                        	}
					                        	if (!isFolder && isChangeContentTypeAllowed) {
                                                    p_aArgs.addItems([ menuItems.changeTemplateOption ]);
                                                }

					                        	p_aArgs.addItems([ menuItems.separator ]);
					                        	p_aArgs.addItems([ menuItems.cutOption ]);
					                        	p_aArgs.addItems([ menuItems.copyOption ]);
					                        } else {
					                        	p_aArgs.addItems([ menuItems.viewOption ]);
                                                p_aArgs.addItems([ menuItems.separator ]);
                                                p_aArgs.addItems([ menuItems.copyOption ]);
					                        }
					                    }
			                        }
			                    }

			                    var checkClipboardCb = {
			                        success: function(collection) {
										var contextMenuItems = [];
										contextMenuItems = this.menuItems;
			                            this.args.addItems(contextMenuItems);

                                        var idTree = oCurrentTextNode.tree.id.toString().replace(/-/g,'');
                                        Self.myTree = Self.myTreePages[idTree];

                                        if ((collection.count > 0 && isContainer) && collection.item[0].uri.replace(/\/\//g,"/") != oCurrentTextNode.data.uri) {
			                            	if(Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/"))){

                                                if(Self.cutItem){
                                                    if(Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/")).parent.contentElId != oCurrentTextNode.contentElId){
                                                        var elementItem = Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/")).index,
                                                            currentItem = oCurrentTextNode.parent,
                                                            isChild = false;

                                                        while(!isChild && currentItem){
                                                            if(currentItem.index == elementItem){
                                                                isChild = true;
                                                            }else{
                                                                currentItem = currentItem.parent;
                                                            }
                                                        }

                                                        !isChild && this.args.addItems([ menuItems.pasteOption ]);
                                                    }
                                                }else if(Self.copiedItem) {
                                                    if(Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/")).parent.contentElId != oCurrentTextNode.contentElId){
                                                        this.args.addItems([ menuItems.pasteOption ]);
                                                    }else {
                                                        this.args.addItems([ menuItems.pasteOption ]);
                                                    }
                                                }

                                            }
                                            Self.copiedItem = Self.myTree.getNodeByProperty("uri", collection.item[0].uri.replace(/\/\//g,"/"));
                                        }
                                        
                                        if(isWrite && ("/site/website/index.xml" != oCurrentTextNode.data.uri) && ("folder" != oCurrentTextNode.data.contentType)){
                                            p_aArgs.addItems([ menuItems.duplicateOption ]);
                                        }

                                        if((oCurrentTextNode.data.lockOwner != ""
                                            && ((CStudioAuthoringContext.role === "admin") || (CStudioAuthoringContext.role === "site_admin")))
                                            || oCurrentTextNode.data.lockOwner === CStudioAuthoringContext.user ) {
                                            p_aArgs.addItems([ menuItems.separator ]);
                                            p_aArgs.addItems([ menuItems.unlockOption ]);
                                        }

                                        if(oCurrentTextNode.data.contentType != "folder") {
                                            p_aArgs.addItems([ menuItems.separator ]);
                                            publishAllowed();
                                            dependenciesAllowed();
                                        }

			                            if(isUserAllowed) {
			                            	this.args.addItems([ menuItems.separator ]);
			                            	this.args.addItems([ menuItems.revertOption ]);
		                   	            }

                                        menuId.removeChild(d);  // Remove the "Loading ..." message

                                        if(Self.mods) {
                                            for(var m=0; m<Self.mods.length; m++) {
                                                var mod = Self.mods[m];
                                                treeNode = mod._renderContextMenu(Self.myTree, target, p_aArgs, component, menuItems, oCurrentTextNode, isWrite);
                                            }
                                        }

			                            this.args.render();     // Render the site dropdown's context menu
			                        },
			                        failure: function() { },
			                        args: p_aArgs,
			                        menuItems: aMenuItems,
			                        menuEl: menuId,
			                        menuWidth: menuWidth,
			                        itemInProgress: isInProgress,
			                        item: oCurrentTextNode.data
			                    };

			                    CStudioAuthoring.Clipboard.getClipboardContent(checkClipboardCb);

		                   	} // end of else
                        },
                        failure: function() { }
                    };

                    checkPermissionsCb.isComponent = isComponent;
                    checkPermissionsCb.isLevelDescriptor = isLevelDescriptor;
                    checkPermissionsCb.aMenuItems = aMenuItems;
                    checkPermissionsCb.menuItems = menuItems;
                    checkPermissionsCb.menuWidth = menuWidth;
                    checkPermissionsCb.menuId = menuId;
                    checkPermissionsCb.p_aArgs = p_aArgs;
                    checkPermissionsCb.formPath = formPath;
                    checkPermissionsCb.d = d;
                    checkPermissionsCb.oCurrentTextNode = oCurrentTextNode;

                    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, {
                        success: function (itemTO) {
                            isOpen = itemTO.item.lockOwner !== "";
                            CStudioAuthoring.Clipboard.getPermissions.call({}, (oCurrentTextNode.data.uri), checkPermissionsCb);
                        },
                        failure: function () {
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "lookUpItemError-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                CMgs.format(siteDropdownLangBundle, "notification"),
                                CMgs.format(siteDropdownLangBundle, "lookUpItemError"),
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                "studioDialog"
                            );
                        }
                    }, false, false);
			},

			/**
			 * load context menu
			 */
            onTriggerContextMenu: function(tree, p_aArgs) {
                var target = p_aArgs.contextEventTarget;

                /* Get the TextNode instance that that triggered the display of the ContextMenu instance. */
                oCurrentTextNode = tree.getNodeByElement(target);
                Self.menuOn = true;

                /* If item is being processed (inFlight) dont display right context menu */
                if (oCurrentTextNode != null &&
                    oCurrentTextNode.data &&
                    oCurrentTextNode.data.inFlight) {
                    oCurrentTextNode = null;
                }

                var menuItems = {
                	separator: { text: "<div>&nbsp;</div>", disabled:true, classname:"menu-separator" },

					newContentOption: { text: CMgs.format(siteDropdownLangBundle, "newContent"), onclick: { fn: Self.createContent } },

                    newFolderOption: { text: CMgs.format(siteDropdownLangBundle, "newFolder"), onclick: { fn: Self.createContainer } },
                    
                    renameFolderOption: { text: CMgs.format(siteDropdownLangBundle, "renameFolder"), onclick: { fn: Self.renameContainer } },

					editOption: { text: CMgs.format(siteDropdownLangBundle, "edit"), onclick: { fn: Self.editContent } },

					viewOption: { text: CMgs.format(siteDropdownLangBundle, "view"), onclick: { fn: Self.viewContent } },

					changeTemplateOption: { text: CMgs.format(siteDropdownLangBundle, "changeTemplate"), onclick: { fn: Self.changeTemplate, obj:tree } },

					deleteOption: { text: CMgs.format(siteDropdownLangBundle, "delete"), onclick: { fn: Self.deleteContent, obj:tree } },

					cutOption: { text: CMgs.format(siteDropdownLangBundle, "cut"), onclick: { fn: Self.cutContent, obj:tree } },

					copyOption: { text: CMgs.format(siteDropdownLangBundle, "copy"), onclick: { fn: Self.copyTree, obj:tree } },

                    pasteOption: { text: CMgs.format(siteDropdownLangBundle, "paste"), onclick: { fn: Self.pasteContent} },
                    
                    duplicateOption: { text: CMgs.format(siteDropdownLangBundle, "duplicate"), onclick: { fn: Self.duplicateContent} },

					revertOption: { text: CMgs.format(siteDropdownLangBundle, "history"), onclick: { fn: Self.revertContent, obj:tree } },

					unlockOption: { text: CMgs.format(siteDropdownLangBundle, "Unlock"), onclick: { fn: Self.unlockContent } }
				};
                p_aArgs.clearContent();

				var permsCallback = {
					success: function(response) {
						var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);

						if(isWrite) {
							this._self._renderContextMenu(
								target,
								p_aArgs,
								this.component,
								menuItems,
								oCurrentTextNode,
								true);
						}
						else {
							this._self._renderContextMenu(
								target,
								p_aArgs,
								this.component,
								menuItems,
								oCurrentTextNode,
								false);
						}
					},

					failure: function() {
						this._self._renderContextMenu(
							target,
							p_aArgs,
							this.component,
							menuItems,
							oCurrentTextNode,
							false);
					},

					_self: this,
					component: Self
				};

                if (oCurrentTextNode != null) {

					CStudioAuthoring.Service.getUserPermissions(
						CStudioAuthoringContext.site,
						oCurrentTextNode.data.uri,
						permsCallback);

                }else{
                	p_aArgs.clearContent();
                	p_aArgs.cancel();
                }

            },

            /**
             * unlock a content item
             */
            unlockContent: function() {
                var unlockCb = {
                    success: function() {
                        eventNS.data = oCurrentTextNode;
                        eventNS.typeAction = "";
                        eventNS.oldPath = null;
                        document.dispatchEvent(eventNS);
                    },
                    failure: function() { },
                    callingWindow: window
                };
                CStudioAuthoring.Service.unlockContentItem(
                        CStudioAuthoringContext.site,
                        oCurrentTextNode.data.uri,
                        unlockCb);
            },
            /**
             * Creates new content. Opens the form to create content
             */
            createContent: function() {
                var createCb = {
                    success: function(contentTO, editorId, name, value, draft) {
                        var page =  CStudioAuthoring.Utils.getQueryParameterURL("page");
                        var currentPage = page.split("/")[page.split("/").length - 1];
                        eventYS.data = oCurrentTextNode;
                        eventYS.typeAction = "createContent";
                        eventYS.oldPath = null;
                        eventYS.parent = oCurrentTextNode.data.path == "/site/website" ? null : false;
                        document.dispatchEvent(eventYS);

                        if(contentTO.item.isPage){
                            CStudioAuthoring.Operations.refreshPreview(contentTO.item);
                        }else{
                            CStudioAuthoring.Operations.refreshPreview();
                        }
                    },
                    failure: function() { },
                    callingWindow: window
                };
                CStudioAuthoring.Operations.createNewContent(
                        CStudioAuthoringContext.site,
                        oCurrentTextNode.data.path,
                        false,
                        createCb);
            },
            /**
             * Edits the label of the TextNode that was the target of the
             * "contextmenu" event that triggered the display of the
             * ContextMenu instance.
             */

            editContent: function() {
                var path = (oCurrentTextNode.data.uri);

                this.element.firstChild.style.pointerEvents = "none";
                if (typeof CStudioAuthoring.editDisabled === 'undefined') {
                    CStudioAuthoring.editDisabled = []
                }
                CStudioAuthoring.editDisabled.push(this.element.firstChild);

                var editCb = {
                    success: function(contentTO, editorId, name, value, draft) {
                        eventNS.oldPath = oCurrentTextNode.data.uri;
                        var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
                        if(oCurrentTextNode.data.browserUri != contentTO.item.browserUri){
                            var oCurrentTextNodeOldPath = oCurrentTextNode.data.browserUri;
                            oCurrentTextNode.data.browserUri = contentTO.item.browserUri;
                            oCurrentTextNode.data.path = contentTO.item.path;
                            oCurrentTextNode.data.uri = contentTO.item.uri;
                            oCurrentTextNode.label = contentTO.item.internalName;
                            oCurrentTextNode.treeNodeTO.path = contentTO.item.path;
                            oCurrentTextNode.treeNodeTO.uri = contentTO.item.uri;
                            if(oCurrentTextNodeOldPath.split(".")[0] == pageParameter.split(".")[0]){
                                var currentURL = CStudioAuthoring.Utils.replaceQueryParameterURL(window.location.href, "page",
                                        contentTO.item.browserUri.indexOf(".xml") > 0 ? contentTO.item.browserUri.split(".")[0]+".html" :
                                        contentTO.item.browserUri);
                                window.location.href = currentURL;
                            }
                        }
                        if(CStudioAuthoringContext.isPreview){
                            try{
                                var currentContentTO,
                                    URLBrowseUri = pageParameter,
                                    contentTOBrowseUri = contentTO.item.browserUri == "" ? "/" : contentTO.item.browserUri;
                                
                                if (URLBrowseUri == contentTOBrowseUri){
                                    currentContentTO = null;
                                } else{
                                    currentContentTO = contentTO.item;
                                }

                                if(contentTO.item.isPage){
                                    CStudioAuthoring.Operations.refreshPreview(currentContentTO);
                                }else{
                                    CStudioAuthoring.Operations.refreshPreview();
                                }
                            }catch(err) {
                                if(!draft) {
                                    this.callingWindow.location.reload(true);
                                }
                            }
                        }
                        else {
                            if(!draft) {
                                //this.callingWindow.location.reload(true);
                            }
                        }


                        //if placeInNav has changed

                        if(contentTO.updatedModel && contentTO.initialModel &&
                        contentTO.updatedModel.orderDefault_f != contentTO.initialModel.orderDefault_f){

                            if(CStudioAuthoring.ContextualNav.WcmRootFolder) {
                                var tree = CStudioAuthoring.ContextualNav.WcmRootFolder.myTree
    
                                var tmpNode = tree.getNodesByProperty("uri", contentTO.item.uri);
                                var parentNode = tmpNode[0].parent.data;
    
                                eventYS.data = contentTO.item;
                                eventYS.typeAction = "edit";
                                eventYS.draft = draft;
                                document.dispatchEvent(eventYS);
                            }else{
                                eventNS.data = contentTO.item;
                                eventNS.typeAction = "edit";
                                eventNS.draft = draft;
                                document.dispatchEvent(eventNS);
                            }
                        
                        }else{
                            eventNS.data = contentTO.item;
                            eventNS.typeAction = "edit";
                            eventNS.draft = draft;
                            document.dispatchEvent(eventNS);
                        }

                        if(!CStudioAuthoringContext.isPreview) {
                            if(draft) {
                                CStudioAuthoring.Utils.Cookies.createCookie("dashboard-checked", JSON.stringify(CStudioAuthoring.SelectedContent.getSelectedContent()));
                            }else{
                                CStudioAuthoring.Utils.Cookies.eraseCookie("dashboard-checked");
                            }
                        }
                    },

                    failure: function() {
                    },

                    callingWindow: window
                };
                CStudioAuthoring.Operations.editContent(
                    oCurrentTextNode.data.formId,
                    CStudioAuthoringContext.site,path,
                    oCurrentTextNode.data.nodeRef, path, false, editCb);
            },

            /**
             * View the label of the TextNode that was the target of the
             * "contextmenu" event that triggered the display of the
             * ContextMenu instance.
             */

            viewContent: function() {
                var path = (oCurrentTextNode.data.uri);

                var viewCb = {
                    success: function() {
                        this.callingWindow.location.reload(true);
                    },

                    failure: function() {
                    },

                    callingWindow: window
                };

                CStudioAuthoring.Operations.viewContent(
                    oCurrentTextNode.data.formId,
                    CStudioAuthoringContext.site,path,
                    oCurrentTextNode.data.nodeRef, path, false, viewCb);
            },

			/**
			 * Creates new container, Opens a dialog box to enter folder name
			 */
			createContainer: function() {
				var createCb = {
					success: function() {
                        Self.refreshNodes(this.currentNode,false, false, null, null, true);
					},
					failure: function() { },
					callingWindow: window,
					currentNode: oCurrentTextNode
				};

				CStudioAuthoring.Operations.createFolder(
							CStudioAuthoringContext.site,
							oCurrentTextNode.data.uri,
							window,
							createCb);
            },
            
            /**
			 * Rename a container, Opens a dialog box to enter new folder name
			 */
			renameContainer: function() {
				var createCb = {
					success: function() {
                        Self.refreshNodes(this.currentNode.parent,false, false, null, null, true);
					},
					failure: function() { },
					callingWindow: window,
					currentNode: oCurrentTextNode
                };

				CStudioAuthoring.Operations.renameFolder(
							CStudioAuthoringContext.site,
							oCurrentTextNode.data.uri,
							window,
							createCb);
			},

            /**
             * Revert the content item
             */
            revertContent: function(p_sType, p_aArgs, tree) {
				CStudioAuthoring.Operations.viewContentHistory(oCurrentTextNode.data);
            },

            /**
             * Deletes the TextNode that was the target of the "contextmenu"
             * event that triggered the display of the ContextMenu instance.
             */
            deleteContent: function(p_sType, p_aArgs, tree) {
                CStudioAuthoring.Operations.deleteContent(
                        [oCurrentTextNode.data], false);
            },
            /**
             * copy content
             */
            copyContent: function(sType, args, tree) {

                var copyCb = {
                    success: function() {
                    },

                    failure: function() {
                    }
                };

                CStudioAuthoring.Clipboard.copyContent(oCurrentTextNode.data, copyCb);
            },
            /**
             * cut content
             */
            cutContent: function(sType, args, tree) {

                var params = { site: (CStudioAuthoringContext.site), path: oCurrentTextNode.data.uri };
                var doCut = function (){
                    var parentTreeNode = oCurrentTextNode.getEl();
                    var getChildNodeClass = YDom.getElementsByClassName("ygtvlp", null, parentTreeNode);
                    var isExpandableNode = YDom.getElementsByClassName("ygtvtp", null, parentTreeNode);

                    if(oCurrentTextNode.hasChildren() || getChildNodeClass.length > 0 || isExpandableNode.length > 0){
                        // alert("The page and its child pages have been cut to the clipboard");
                    }

                    var uri = oCurrentTextNode.data.uri;
                    Self.copiedItem = null;
                    Self.cutItem = oCurrentTextNode;

                    if(uri.lastIndexOf("index.xml")==-1){
                        var serviceUri = CStudioAuthoring.Service.getPagesServiceUrl + "?site=" + CStudioAuthoringContext.site + "&path=" + uri + "&depth=-1&order=default";

                    }
                    else {
                        var folderPath = uri.substring(0, uri.lastIndexOf("index.xml"));

                        var serviceUri = CStudioAuthoring.Service.getPagesServiceUrl + "?site=" + CStudioAuthoringContext.site + "&path=" + folderPath + "&depth=-1&order=default";
                    }

                    var getTreeItemReuest = CStudioAuthoring.Service.createServiceUri(serviceUri);

                    try {

                        var treeInner = YDom.get('acn-dropdown-menu-inner');
                        var previousCutEl = YDom.getElementsByClassName("status-icon", null, treeInner);
                        for(var i=0; i<previousCutEl.length; i++){
                            if(previousCutEl[i].style.color == Self.CUT_STYLE_RGB || previousCutEl[i].style.color == Self.CUT_STYLE ){
                                previousCutEl[i].style.color = '';
                            }
                        }

                        document.getElementById(oCurrentTextNode.labelElId).style.cssText += "color: " + Self.CUT_STYLE +  " !important";

                        if(oCurrentTextNode.hasChildren()){
                            var getTextNodes = YDom.getElementsByClassName("status-icon", null, parentTreeNode);
                            for(var i=0; i<getTextNodes.length; i++){
                                getTextNodes[i].style.cssText += "color: " + Self.CUT_STYLE +  " !important";
                            }
                        }

                    } catch (ex) {  }

                    //CStudioAuthoring.Operations.openCopyDialog(CStudioAuthoringContext.site, oCurrentTextNode.data.uri, assignTemplateCb, args);
                    var cutCb = {
                        success: function(response) {

                            var content = YAHOO.lang.JSON.parse(response.responseText);

                            var item = content.item;
                            var jsonString= YAHOO.lang.JSON.stringify(item);
                            var jsonArray="{\"item\":["+jsonString+"]}";
                            var cutRequest = CStudioAuthoringContext.baseUri + "/api/1/services/api/1/clipboard/cut-item.json?site=" + CStudioAuthoringContext.site;

                            var onComplete = {
                                success:function(response) {

                                },
                                failure: function() {
                                }

                            };

                            YAHOO.util.Connect.setDefaultPostHeader(false);
                            YAHOO.util.Connect.initHeader("Content-Type", "application/json; charset=utf-8");
                            YAHOO.util.Connect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
                            YAHOO.util.Connect.asyncRequest('POST', cutRequest, onComplete, jsonArray);

                        },
                        failure:function(response) {

                        }

                    };

                    YConnect.asyncRequest('GET', getTreeItemReuest, cutCb);
                }

                CStudioAuthoring.Operations.getWorkflowAffectedFiles(params, {
                    success: function (content) {
                        if (content && content.length) {

                            CStudioAuthoring.Operations._showDialogueView({
                                controller: 'viewcontroller-cancel-workflow',
                                fn: function (oAjaxCfg) {
                                    // because _showDialogueView was designed to load the body from a
                                    // webscript, must simulate the ajax process here
                                    oAjaxCfg.success({ responseText: '' });
                                },
                                callback: function () {
                                    var view = this;
                                    view.setContent(content);
                                    view.on('continue', function () {
                                        doCut();
                                    });
                                }
                            });

                        } else {
                            doCut();
                        }
                    }
                });

            },
            /**
             * paste content to selected location
             */
            pasteContent: function(sType, args, tree) {
                //Check source and destination paths.
                if ((Self.cutItem != null && Self.cutItem.contentElId == oCurrentTextNode.contentElId) ||
                    (Self.copiedItem != null && (Self.copiedItem.contentElId == oCurrentTextNode.contentElId) || Self.copiedItem == oCurrentTextNode.data.uri)){
                    CStudioAuthoring.Operations.showSimpleDialog(
                        "pathSameError-dialog",
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(siteDropdownLangBundle, "notification"),
                        CMgs.format(siteDropdownLangBundle, "pathSameError"),
                        [{ text: "OK",  handler:function(){
                            this.hide();
                            return false;
                        }, isDefault:false }],
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        "studioDialog"
                    );
                }

                window.pasteFlag = true;
                var pasteCb = {
                    success: function(result) {
                        try {
                            var errorMsgExist=false;
                            var errorMsg='';
                            var cutItem = Self.cutItem;
                            if(!result.success){
                                if(typeof result.message!= 'undefined' && typeof result.message.paths != 'undefined') {
                                    errorMsg = result.message.paths[0];
                                    if(errorMsg!='') {
                                        errorMsgExist=true;
                                    }
                                }
                            }

                            Self.refreshNodes(this.tree,!errorMsgExist, false, null, null, true);

                            var isPreview = CStudioAuthoringContext.isPreview;

                            if(cutItem && isPreview){
                                var current = CStudioAuthoring.SelectedContent.getSelectedContent()[0];

                                if(current.uri == cutItem.data.uri){
                                    var browserUri = result.status[0].split("/site/website").pop();
                                    browserUri = browserUri.split("/index.xml")[0];

                                    cutItem.data.browserUri = browserUri;
                                    cutItem.data.uri = result.status[0];

                                    CStudioAuthoring.Operations.refreshPreview(cutItem.data);
                                }
                            }

                            Self.refreshDashboard("MyRecentActivity");

                            //code below to alert user if destination node url already exist during cut/paste
                            if (errorMsgExist && errorMsg=='DESTINATION_NODE_EXIST'){
                                CStudioAuthoring.Operations.showSimpleDialog(
                                    "pageExistError-dialog",
                                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                    CMgs.format(siteDropdownLangBundle, "notification"),
                                    CMgs.format(siteDropdownLangBundle, "pageExistError"),
                                    null, // use default button
                                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                    "studioDialog"
                                );
                            }else{
                                Self.cutItem = null;
                                Self.copiedItem = null;
                            }
                        } catch(e) { }
                    },

                    failure: function() {
                        YDom.removeClass(oCurrentTextNode.getLabelEl().parentNode.previousSibling, "ygtvloading");
                    },

                    tree: oCurrentTextNode
                };

                try{
					YDom.addClass(oCurrentTextNode.getLabelEl().parentNode.previousSibling, "ygtvloading");
				}catch(e){}

				CStudioAuthoring.Clipboard.pasteContent(oCurrentTextNode.data, pasteCb);
            },
            duplicateContent: function(sType, args, tree) {

                var duplicateContentCallback = {
                    success : function() {
                        if(YDom.get("duplicate-loading")){
                            YDom.get("duplicate-loading").style.display = "none";
                        }
                    },
                    failure: function() {
                        if(YDom.get("duplicate-loading")) {
                            YDom.get("duplicate-loading").style.display = "none";
                        }
                    }
                };

                CStudioAuthoring.Operations.showSimpleDialog(
                    "duplicate-dialog",
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    "Duplicate",
                    "A new copy of this item and all of it's item specific content will be created. Are you sure you wish to proceed?",
                    [{ text:"Duplicate", handler: function() {
                        this.hide();
                        CStudioAuthoring.Operations.duplicateContent(
                            CStudioAuthoringContext.site,
                            oCurrentTextNode.data.uri,
                            duplicateContentCallback);
                    }, isDefault:false },
                    { text:CMgs.format(formsLangBundle, "cancel"),  handler:function(){this.hide();}, isDefault:true }],
                    YAHOO.widget.SimpleDialog.ICON_WARN,
                    "studioDialog"
                );
            },
            copyTree:function(sType, args, tree) {

                var assignTemplateCb = {
                    success: function(selectedType) {

                    },

                    failure: function() {
                    },

                    activeNode: oCurrentTextNode
                };

                var idTree = oCurrentTextNode.tree.id.toString().replace(/-/g,'');
                Self.myTree = Self.myTreePages[idTree];

                Self.cutItem = null;
                Self.copiedItem = Self.myTree.getNodeByProperty("path", oCurrentTextNode.data.path);
                Self.copiedItem ? null : Self.copiedItem = oCurrentTextNode;


                // if the tree does not have child do not open the copy dialoge
                // only call the copy content function
                if (oCurrentTextNode.isLeaf) {

                	var copyContext = {
                    	"heading":"Copy",
                    	"description":"Please select any of the sub-pages you would like to batch copy.<br/> When pasting, any selected sub-pages and their positional heirarchy will be retained",
                    	"actionButton":"Copy"
                	};

                	var site = CStudioAuthoringContext.site;

                	var context = copyContext;
                	context.request = CStudioAuthoringContext.baseUri + CStudioAuthoring.Service.copyServiceUrl + "?site=" + site;

                	var uri = oCurrentTextNode.data.uri;

                	var folderPath = uri;
                    if (uri.indexOf("index.xml") != -1) {
                        folderPath = uri.substring(0, uri.lastIndexOf("index.xml"));
                    }

                	var openCopyDialog = {
        				success:function(response) {
        				   var copyTree= eval("(" + response.responseText + ")");
        				   this.copyTree = copyTree;
	        				var newItem = {};
	       	                newItem.uri = this.copyTree.item.uri;//Fixed for EMO-8742
	       	                var rootItem = newItem;
	       	                var pasteFormatItem = {};
	       	                pasteFormatItem.item = [];
	       	                pasteFormatItem.item.push(rootItem);

	       	                var myJSON = YAHOO.lang.JSON.stringify(pasteFormatItem);
	       	                var oncomplete = {
	       	                    success:function() {
	       	                        CStudioAuthoring.ContextualNav.WcmRootFolder.resetNodeStyles();
	       	                    },
	       	                    failure:function() {

	       	                    }
	       	                };
	       	                var request = this.args['request'];
	       	                YAHOO.util.Connect.setDefaultPostHeader(false);
                            YAHOO.util.Connect.initHeader("Content-Type", "application/json; charset=utf-8");
                            YAHOO.util.Connect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
	       	                YAHOO.util.Connect.asyncRequest('POST', request, oncomplete, myJSON);
        				},
        				failure:function() {

        				},
        				args : context
        			};
        			var serviceUri = CStudioAuthoring.Service.getPagesServiceUrl + "?site=" + site + "&path=" + folderPath + "&depth=-1&order=default";
        			var getCopyTreeItemReuest = CStudioAuthoring.Service.createServiceUri(serviceUri);
        			YConnect.asyncRequest('GET', getCopyTreeItemReuest, openCopyDialog);
                } else {
                	CStudioAuthoring.Operations.openCopyDialog(
                        CStudioAuthoringContext.site,
                        oCurrentTextNode.data.uri,
                        assignTemplateCb, args);
                }

            },
			cutTree:function(sType, args, tree){
				args.cut=true;
                var serviceUri = CStudioAuthoring.Service.getPagesServiceUrl + "?site=" + site + "&path=" + folderPath + "&depth=-1&order=default";
				var getCopyTreeItemReuest = CStudioAuthoring.Service.createServiceUri(serviceUri);
				YConnect.asyncRequest('GET', getCopyTreeItemReuest, openCopyDialog);
                CStudioAuthoring.Operations.openCopyDialog(sType,args,tree);

			},
            /**
             * change template for given item
             */
            changeTemplate: function(sType, args, tree) {

                var modalBody = YDom.get("cstudio-wcm-popup-div");
                if (modalBody === null) {
                    modalBody = document.createElement("div");
                    modalBody.setAttribute("id", "cstudio-wcm-popup-div");
                    document.body.appendChild(modalBody);
                }

                var continueFn = function continueFn (e) {
                    e.preventDefault();

                    var assignTemplateCb = {
                        success: function(selectedType) {
                            var path = (this.activeNode.data.uri);

                            var editCb = {
                                success: function(contentTO, editorId, name, value, draft) {

                                    eventNS.oldPath = oCurrentTextNode.data.uri;
                                    var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
                                    if(oCurrentTextNode.data.browserUri != contentTO.item.browserUri){
                                        var oCurrentTextNodeOldPath = oCurrentTextNode.data.browserUri;
                                        oCurrentTextNode.data.browserUri = contentTO.item.browserUri;
                                        oCurrentTextNode.data.path = contentTO.item.path;
                                        oCurrentTextNode.data.uri = contentTO.item.uri;
                                        if(oCurrentTextNodeOldPath == pageParameter){
                                            var currentURL = CStudioAuthoring.Utils.replaceQueryParameterURL(window.location.href, "page", oCurrentTextNode.data.browserUri);
                                            window.location.href = currentURL;
                                        }
                                    }
                                    if(CStudioAuthoringContext.isPreview){
                                        try{
                                            CStudioAuthoring.Operations.refreshPreview();
                                        }catch(err) {
                                            if(!draft) {
                                                this.callingWindow.location.reload(true);
                                            }
                                        }
                                    }
                                    else {
                                        if(!draft) {
                                            //this.callingWindow.location.reload(true);
                                        }
                                    }
                                    eventNS.data = oCurrentTextNode;
                                    eventNS.typeAction = "edit";
                                    eventNS.draft = draft;
                                    document.dispatchEvent(eventNS);
                                },

                                failure: function() {
                                },

                                callingWindow: window
                            };
                            /* reload dashboard is heavy, to reflect changed content-type */
                            //window.location.reload(true);
                            //this.activeNode.data.formId = selectedType;
                            var auxParams = new Array();
                            var param1 = {};
                            param1['name'] = "draft";
                            param1['value'] = "true";
                            var param2 = {};
                            param2['name'] = "changeTemplate";
                            param2['value'] = selectedType;
                            auxParams.push(param1);
                            auxParams.push(param2);
                            CStudioAuthoring.Operations.editContent(
                                    selectedType,
                                    CStudioAuthoringContext.site,
                                    path,
                                    this.activeNode.data.nodeRef, path, false, editCb,auxParams);
                        },
                        failure: function() { },
                        activeNode: oCurrentTextNode
                    };
                    dialog.destroy();
                    CStudioAuthoring.Operations.assignContentTemplate(
                            CStudioAuthoringContext.site,
                            CStudioAuthoringContext.user,
                            oCurrentTextNode.data.uri,
                            assignTemplateCb,
                            oCurrentTextNode.data.formId);
                };

                var cancelFn = function cancelFn (e) {
                    e.preventDefault();
                    dialog.destroy();
                }

                modalBody.innerHTML = '<div class="contentTypePopupInner changeContent-type-dialog" style="width:460px;height:140px;">' +
                                        '<div class="contentTypePopupContent">' +
                                            '<form name="contentFromWCM">' +
                                            '<div class="contentTypePopupHeader">' + CMgs.format(formsLangBundle, "changeTemplateDialogTitle")+ '</div> ' +
                                            '<div class="contentTypeOuter">'+
                                                '<div>' + CMgs.format(formsLangBundle, "changeTemplateDialogBody")+ '</div>' +
                                            '</div>' +
                                            '<div class="contentTypePopupBtn">' +
                                                '<input type="submit" class="btn btn-primary ok" id="acceptCTChange" value="' +CMgs.format(formsLangBundle, 'yes')+ '" />' +
                                                '<input type="submit" class="btn btn-default cancel" id="cancelCTChange" value="' +CMgs.format(formsLangBundle, 'no')+ '" />' +
                                            '</div>' +
                                            '</form> ' +
                                        '</div>' +
                                      '</div>';

                var dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div",
                                { fixedcenter : true,
                                  effect:{
                                    effect: YAHOO.widget.ContainerEffect.FADE,
                                    duration: 0.25
                                  },
                                  visible : false,
                                  modal:true,
                                  close:false,
                                  constraintoviewport : true,
                                  underlay:"none",
                                  zIndex: 100000
                                });

                dialog.render();

                YAHOO.util.Event.addListener("acceptCTChange", "click", continueFn);
                YAHOO.util.Event.addListener("cancelCTChange", "click", cancelFn);

                dialog.show();
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
            nodeHoverEffects: function(e) {
                var YDom = YAHOO.util.Dom,
                        highlightWrpClass = "highlight-wrapper",
                        highlightColor = "#e2e2e2",
                        overSetClass = "over-effect-set", // class to identify elements that have their over/out effect initialized
                        spanNodes = YAHOO.util.Selector.query("span.yui-resize-label:not(." + overSetClass + ")", "acn-dropdown-menu-wrapper"),
                        moverFn = function(evt) {
                            var el = this,
                                    wrapEl = function(table) {
                                        var wrp = document.createElement('div');
                                        wrp.setAttribute('style', 'background-color:' + highlightColor);
                                        wrp.setAttribute('class', highlightWrpClass);
                                        YDom.insertBefore(wrp, table);
                                        wrp.appendChild(table);
                                        return wrp;
                                    };
                            if (YDom.hasClass(el, highlightWrpClass)) {
                                YDom.setStyle(el, 'background-color', highlightColor)
                            } else if (YDom.hasClass(el, 'ygtvitem')) {
                                var firstChild = YDom.getFirstChild(el);
                                YDom.hasClass(firstChild, highlightWrpClass)
                                        ? YDom.setStyle(firstChild, 'background-color', highlightColor)
                                        : wrapEl(firstChild)
                            } else {
                                var parent = el.parentNode;
                                YDom.hasClass(parent, highlightWrpClass)
                                        ? YDom.setStyle(parent, 'background-color', highlightColor)
                                        : wrapEl(el);
                            }
                            if(Self.lastSelectedTextNode != null) {
                            	var currentlySelectedTextNode = el
                            	if(currentlySelectedTextNode == Self.lastSelectedTextNode) return;
                            	(YDom.hasClass(Self.lastSelectedTextNode, highlightWrpClass)
                                        ? Self.lastSelectedTextNode
                                        : (YDom.hasClass(Self.lastSelectedTextNode, 'ygtvitem')
                                        ? YDom.getFirstChild(Self.lastSelectedTextNode)
                                        : Self.lastSelectedTextNode.parentNode))
                                        .style.backgroundColor = "";

                            	Self.lastSelectedTextNode = null;
                            }
                        },
                        moutFn = function(evt) {
                        	if(Self.lastSelectedTextNode != null) return;
                            var el = this;
                            (YDom.hasClass(el, highlightWrpClass)
                                    ? el
                                    : (YDom.hasClass(el, 'ygtvitem')
                                    ? YDom.getFirstChild(el)
                                    : el.parentNode))
                                    .style.backgroundColor = "";
                        };
                for (var i = 0,
                        l = spanNodes.length,
                        span = spanNodes[0],
                        barItem;
                     i < l;
                     i++,span = spanNodes[i]
                        ) {
                    // span -> td -> tr -> tbody -> table
                    barItem = span.parentNode.parentNode.parentNode.parentNode;
                    if (barItem) {
                        YEvent.addListener(barItem, "mouseover", moverFn);
                        YEvent.addListener(barItem, "mouseout", moutFn);
                        YDom.addClass(span, overSetClass);
                    }
                }
            },

            setChildrenStyles: function(treeNode) {
                var parentNode = treeNode.getContentEl();
                if (parentNode.children[0] &&
                    (parentNode.children[0].style.color == Self.CUT_STYLE_RGB ||
                     parentNode.children[0].style.color == Self.CUT_STYLE)) {
                    for (var chdIdx = 0; chdIdx < treeNode.children.length; chdIdx++) {
                        var chdEl = treeNode.children[chdIdx].getContentEl();
                        if (chdEl && chdEl.children[0]) {
                            chdEl.children[0].style.color = Self.CUT_STYLE
                        }
                    }
                }
            },

            resetNodeStyles: function() {
                var treeInner = YDom.get('acn-dropdown-menu-inner');
                var previousCutEl = YDom.getElementsByClassName("status-icon", null, treeInner);
                for(var i=0; i<previousCutEl.length; i++) {
                    if(previousCutEl[i].style.color == Self.CUT_STYLE_RGB || previousCutEl[i].style.color == Self.CUT_STYLE ) {
                        previousCutEl[i].removeAttribute("style");
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

        ++(CStudioAuthoring.ContextualNav.WcmRootFolder.instanceCount);

        this._self = this;
        this._toggleState = CStudioAuthoring.ContextualNav.WcmRootFolder.ROOT_CLOSED;
        this.rootFolderEl = null;
        //this.instanceId = ++(CStudioAuthoring.ContextualNav.WcmRootFolder.instanceCount);

        this.type = config.name;
        this.label = config.params["label"];
        this.path = (config.params["path"]) ? config.params["path"] : config.params["paths"].path;
        this.showRootItem = (config.params["showRootItem"]) === "true" ? true : false;
        this.onClickAction = (config.params["onClick"]) ? config.params["onClick"] : "";
        this.config = config;
        this.mods = [];
    }
    CStudioAuthoring.Module.moduleLoaded("wcm-root-folder", CStudioAuthoring.ContextualNav.WcmRootFolder);
})();