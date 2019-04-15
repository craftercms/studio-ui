/**
 * Active Content Plugin
 */
CStudioAuthoring.ContextualNav.WcmActiveContentMod = CStudioAuthoring.ContextualNav.WcmActiveContentMod || (function () {

    var filePermissions = { "fileLen" : 0 }, // Cache the file permissions for the files selected
        permissionAggregateCounter = {};     // Keep a counter of all the permissions from the selected files

    return {
        initialized: false,

        /**
         * initialize module
         */
        initialize: function(config) {
            if(!CStudioAuthoring.ContextualNav.WcmActiveContent) {
                this.renderActiveContent();
                CStudioAuthoring.ContextualNav.WcmActiveContent.init();
            }
        },

        renderActiveContent: function() {
            var YDom = YAHOO.util.Dom,
                YEvent = YAHOO.util.Event,
                navWcmContent,
                _this; // Reference to CStudioAuthoring.ContextualNav.WcmActiveContent

            contextPath = location.protocol + "//" + location.hostname + ":" + location.port;

            var CMgs = CStudioAuthoring.Messages;
            var contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);

            /**
             * WCM Site Dropdown Contextual Active Content
             */
            _this = CStudioAuthoring.register({
                "ContextualNav.WcmActiveContent": {
                    options: [
                        { name: CMgs.format(contextNavLangBundle, "wcmContentEdit"), allowAuthor: true, allowAdmin: true, allowBulk: false, renderId: "Edit" },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentSubmit"), allowAuthor: true, allowAdmin: true, allowBulk: true, renderId: "SimpleSubmit"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentDelete"), allowAuthor: true, allowAdmin: true, allowBulk: true, renderId: "Delete"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentRequestDelete"), allowAuthor: true, allowAdmin: false, allowBulk: true, renderId: "ScheduleForDelete"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentReject"), allowAuthor: true, allowAdmin: true, allowBulk: true, renderId: "Reject"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentSchedule"), allowAuthor: true, allowAdmin: true, allowBulk: true, renderId: "ApproveCommon"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentApprove"), allowAuthor: true, allowAdmin: true, allowBulk: true, renderId: "ApproveCommon"  },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentDuplicate"), allowAuthor: true, allowAdmin: true, allowBulk: false, renderId: "Duplicate" },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentHistory"), allowAuthor: true, allowAdmin: true, allowBulk: false, renderId: "VersionHistory" },
                        { name: CMgs.format(contextNavLangBundle, "wcmContentDependencies"), allowAuthor: true, allowAdmin: true, allowBulk: false, renderId: "ViewDependencies" }
                    ],

                    /**
                     * initialize widget
                     */
                    init: function() {
                        var me = this;

                        CStudioAuthoring.Events.contentSelected.subscribe(function(evtName, contentTO) {
                            var selectedContent,
                                callback;

                            if (contentTO[0] && contentTO[0].path) {
                                selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();

                                callback = {
                                    success: function(isWrite, perms) {
                                        var totalPerms,
                                            isWrite;

                                        this._self.addFilePermissions(this.filePath, perms, filePermissions, permissionAggregateCounter);
                                        totalPerms = this._self.getAgreggatePermissions(filePermissions.fileLen, permissionAggregateCounter);
                                        isWrite = this._self.hasWritePermission(totalPerms);
                                        this._self._drawNav(selectedContent, isWrite, totalPerms);

                                        if (CStudioAuthoringContext.isPreview == true && selectedContent[0].disabled == true) {
                                            var noticeEl = document.createElement("div");
                                            this._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                            YDom.addClass(noticeEl, "acnDisabledContent");
                                            noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentPageDisabled");
                                        }else{
                                            me.removeDisableMessage();
                                        }

                                        var thisContext = this;
                                        var saveDraftFlag = false;
                                        (function (saveDraftFlag) {
                                            for(var s=0; s<selectedContent.length; s++) {
                                                CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, selectedContent[s].uri, {
                                                    success: function (content) {
                                                        var noticeEls = YDom.getElementsByClassName("acnDraftContent", null, _this.containerEl.parentNode.parentNode);
                                                        if(content.item.savedAsDraft == true) {
                                                            saveDraftFlag = true;
                                                            if(noticeEls.length < 1) {
                                                                var noticeEl = document.createElement("div");
                                                                thisContext._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                                                YDom.addClass(noticeEl, "acnDraftContent");
                                                                noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentSavedAsDraft");
                                                            }
                                                        }else{
                                                            if(!saveDraftFlag) {
                                                                me.removeNotices(noticeEls);
                                                            }
                                                        }
                                                    }
                                                });
                                           }
                                        })(saveDraftFlag);
                                    },
                                    failure: function() {
                                        //TDOD: log error, not mute it
                                    },

                                    selectedContent: selectedContent,
                                    _self: _this,
                                    filePath: contentTO[0].path
                                };

                                _this.checkWritePermission(contentTO[0].uri, callback);
                            }
                        });

                        document.addEventListener('crafter.create.contenMenu', function (e) {
                            selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();
                            YDom.get("activeContentActions").innerHTML = "";
                            if(CStudioAuthoring.SelectedContent.getSelectedContent()[0]) {
                                CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri, {
                                    success: function (content) {
                                        if (typeof WcmDashboardWidgetCommon == 'undefined'){
                                            CStudioAuthoring.SelectedContent.setContent(content.item);
                                            _this.drawNav();
                                        }
                                    }
                                });
                            }
                        }, false);

                        document.addEventListener('crafter.refresh', function (e) {
                            if(!nodeOpen)
                            {
                                document.dispatchEvent(eventCM);
                                if (typeof WcmDashboardWidgetCommon != "undefined") {
                                    WcmDashboardWidgetCommon.refreshAllDashboards();
                                }
                                lookupSiteContent(CStudioAuthoring.SelectedContent.getSelectedContent()[0]);

                                function lookupSiteContent(curNode, paramCont) {
                                    if (curNode) {
                                        CStudioAuthoring.Service.lookupSiteContent(CStudioAuthoringContext.site, curNode.uri, 1, "default", {
                                            success: function (treeData) {
                                                var cont = paramCont ? paramCont : 0;

                                                if (treeData.item.isInFlight) {
                                                    setTimeout(function () {
                                                        lookupSiteContent(curNode);
                                                    }, 300);
                                                } else {
                                                    cont++;
                                                    if (cont < 2) {
                                                        setTimeout(function () {
                                                            lookupSiteContent(curNode, cont);
                                                        }, 300);
                                                    } else {
                                                        if (typeof WcmDashboardWidgetCommon != "undefined") {
                                                            WcmDashboardWidgetCommon.refreshAllDashboards();
                                                        }
                                                    }
                                                }
                                            },
                                            failure: function () {
                                            }
                                        })
                                    }
                                }
                            }

                        }, false);

                        CStudioAuthoring.Events.contentUnSelected.subscribe(function(evtName, contentTO) {
                            var selectedContent,
                                totalPerms,
                                noticeEl,
                                isWrite;

                            if (contentTO[0] && contentTO[0].path) {

                                selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();

                                var saveDraftFlag = false;
                                var noticeEls = YDom.getElementsByClassName("acnDraftContent", null, _this.containerEl.parentNode.parentNode);
                                (function (saveDraftFlag, noticeEls, selectedContent) {
                                    if(selectedContent.length > 0) {
                                        for (var s = 0; s < selectedContent.length; s++) {
                                            (function (s) {
                                                CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, selectedContent[s].uri, {
                                                    success: function (content) {
                                                        if (content.item.savedAsDraft == true && selectedContent.length > 0) {
                                                            saveDraftFlag = true;
                                                            noticeEls = YDom.getElementsByClassName("acnDraftContent", null, _this.containerEl.parentNode.parentNode);
                                                            if (noticeEls.length < 1) {
                                                                var noticeEl = document.createElement("div");
                                                                _this.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                                                YDom.addClass(noticeEl, "acnDraftContent");
                                                                noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentSavedAsDraft");
                                                            }
                                                        } else {
                                                            if (!saveDraftFlag /*|| (saveDraftFlag && selectedContent.length-1 == s )*/) {
                                                                me.removeNotices(noticeEls);
                                                            }
                                                        }
                                                    }
                                                });
                                            })(s);
                                        }
                                    }else{
                                        noticeEls = YDom.getElementsByClassName("acnDraftContent", null, _this.containerEl.parentNode.parentNode);
                                        me.removeNotices(noticeEls);
                                    }
                                })(saveDraftFlag, noticeEls, selectedContent);

                                _this.removeFilePermissions(contentTO[0].path, filePermissions, permissionAggregateCounter);

                                if (filePermissions.fileLen) {
                                    selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();
                                    totalPerms = _this.getAgreggatePermissions(filePermissions.fileLen, permissionAggregateCounter);
                                    isWrite = _this.hasWritePermission(totalPerms);
                                    _this._drawNav(selectedContent, isWrite, totalPerms);

                                    if(CStudioAuthoringContext.isPreview == true
                                        && selectedContent[0].disabled == true) {
                                        noticeEl = document.createElement("div");
                                        _this.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                        YDom.addClass(noticeEl, "acnDisabledContent");
                                        noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentPageDisabled");
                                    }else{
                                        me.removeDisableMessage();
                                    }
                                } else {
                                    _this.renderSelectNone();
                                }
                            }else {
                                _this.renderSelectNone();
                            }
                        });

                        for(var i = 0,
                                opts = this.options,
                                l = opts.length,
                                opt = opts[0]; i<l; opt = opts[++i]) {
                            opts[i].renderer = this["render" + opt.renderId];
                        }
                        navWcmContent = _this;
                        YEvent.onAvailable("activeContentActions", function(parentControl) {
                            parentControl.containerEl = YDom.get("activeContentActions");
                            navWcmContent.drawNav();
                            CStudioAuthoring.Events.moduleActiveContentReady.fire();
                        }, this);
                    },

                    /*
                     * Adds a file and its permissions to a hash map and adds its permissions to a permissionAggregator.
                     */
                    addFilePermissions : function addFilePermissions (fileId, perms, permissionsHash, permissionAgreggator) {
                        if (typeof fileId == 'string') {
                            permissionsHash.fileLen++;  // Increment file counter
                            permissionsHash[fileId] = perms;
                            perms.forEach( function (permObj) {
                                if (typeof permissionAgreggator[permObj] == 'number') {
                                    // Check if the permission already exists in the permission agreggator
                                    permissionAgreggator[permObj] = permissionAgreggator[permObj] + 1;
                                } else {
                                    // Add a new permission to the permission agreggator
                                    permissionAgreggator[permObj] = 1;
                                }
                            });
                        }
                    },

                    /*
                     * Removes a file and its permissions from a hash map and subtracts its permissions from a permissionAggregator.
                     */
                    removeFilePermissions : function removeFilePermissions (fileId, permissionsHash, permissionAgreggator) {
                        var perms;

                        if (typeof fileId == 'string' && permissionsHash.hasOwnProperty(fileId)) {
                            permissionsHash.fileLen--;  // Decrement file counter
                            perms = permissionsHash[fileId];

                            perms.forEach( function (permObj) {
                                if (typeof permissionAgreggator[permObj] == 'number') {
                                    // Check if the permission already exists in the permission agreggator
                                    permissionAgreggator[permObj] = permissionAgreggator[permObj] - 1;
                                }
                            });

                            // Remove file from hash map
                            delete permissionsHash[fileId];
                        }
                    },

                    getAgreggatePermissions : function getAgreggatePermissions (totalFiles, permissionAgreggator) {
                        var result = [];
                        var permObj;

                        for (var permission in permissionAgreggator) {
                            if (permissionAgreggator.hasOwnProperty(permission) && permissionAgreggator[permission] == totalFiles) {
                                // Permissions that are present for all files are added to permissions array
                                //permObj = {};
                                //permObj['permission'] = permission;

                                result.push(permission);
                            }
                        }
                        return result;
                    },

                    removeDisableMessage: function() {
                        var messages = YDom.getElementsByClassName('acnDisabledContent');

                        for(var x = 0; x < messages.length; x++) {
                            messages[x].remove();
                        }
                    },

                    removeNotices: function(noticeEls) {
                        for (var n = 0; n < noticeEls.length; n++) {
                            var curNode = noticeEls[n];
                            curNode.parentNode.removeChild(curNode);
                        }
                    },

                    /**
                     * render the navigation bar
                     */
                    drawNav: function() {
                        var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent(),
                            me = this;

                        var callback = {
                            success: function(isWrite, perms) {
                                this._self._drawNav(selectedContent, isWrite, perms);

                                if(CStudioAuthoringContext.isPreview == true
                                    && selectedContent[0].disabled == true) {
                                    var noticeEl = document.createElement("div");
                                    this._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                    YDom.addClass(noticeEl, "acnDisabledContent");
                                    noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentPageDisabled");
                                }else{
                                    me.removeDisableMessage();
                                }

                                var thisContext = this;
                                for(var s=0; s<selectedContent.length; s++) {
                                    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, selectedContent[s].uri, {
                                        success: function (content) {
                                            if(content.item.savedAsDraft == true) {
                                                var noticeEls = YDom.getElementsByClassName("acnDraftContent", null, _this.containerEl.parentNode.parentNode);
                                                if(noticeEls.length < 1) {
                                                    var noticeEl = document.createElement("div");
                                                    thisContext._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                                                    YDom.addClass(noticeEl, "acnDraftContent");
                                                    noticeEl.innerHTML = CMgs.format(contextNavLangBundle, "wcmContentSavedAsDraft");
                                                }
                                            }
                                        }
                                    });
                                }

                            },
                            failure: function() {
                                //TDOD: log error, not mute it
                            },

                            selectedContent: selectedContent,
                            _self: this
                        };

                        if(selectedContent.length != 0) {
                            this.checkWritePermission(selectedContent[0].uri, callback);
                        } else {
                            this.renderSelectNone();
                        }

                    },

                    /**
                     * draw navigation after security check on item
                     */
                    _drawNav: function(selectedContent, isWrite, perms) {
                        var icon = "",
                            isAdmin = (CStudioAuthoringContext.role == "admin"),
                            isBulk = true,
                            isRelevant = true,
                            state = "",
                            prevState = "",
                            auxIcon = "",
                            isInFlight = false,
                            isOneItemLocked = false,
                            itemLocked;

                        if(selectedContent.length == 0) {
                            this.renderSelectNone();
                        } else {
                            if(selectedContent.length > 1) {
                                var i,
                                    auxState,
                                    count = 0,
                                    iconsCount = 0,
                                    l = selectedContent.length,
                                    newFileFlag = true;

                                for(i=0; i< l; i++) {
                                    auxState = CStudioAuthoring.Utils.getContentItemStatus(selectedContent[i], true);
                                    auxIcon = CStudioAuthoring.Utils.getIconFWClasses(selectedContent[i]);
                                    itemLocked = CStudioAuthoring.Utils.isItemLocked(selectedContent[i]);

                                    // If there is at least one item locked, isOneItemLocked === true
                                    isOneItemLocked = isOneItemLocked || itemLocked;

                                    if (newFileFlag && !selectedContent[i].newFile) {
                                        newFileFlag = false;
                                    }
                                    if (i === 0) {
                                        // first iteration
                                        prevState = auxState;
                                        state += auxState;
                                        count++;
                                    } else {
                                        if (prevState != auxState) {
                                            prevState = auxState;
                                            state += "|" + auxState;
                                            count++;
                                        }
                                    }

                                    if (icon != auxIcon) {
                                        icon = auxIcon;
                                        iconsCount++;
                                    }
                                    if (selectedContent[i].deleted) {
                                        isRelevant = false;
                                    }
                                }

                                (count > 1) && (icon = "");
                                (iconsCount > 1) && (icon = "");
                                if (newFileFlag) {
                                    state += "*";
                                }
                            } else {
                                isBulk = false;
                                state = CStudioAuthoring.Utils.getContentItemStatus(selectedContent[0], true);
                                icon = CStudioAuthoring.Utils.getIconFWClasses(selectedContent[0]);
                                isInFlight = selectedContent[0].inFlight;
                                isOneItemLocked = CStudioAuthoring.Utils.isItemLocked(selectedContent[0]);

                                if(selectedContent[0].lockOwner != "") {
                                    if(selectedContent[0].lockOwner != CStudioAuthoringContext.user) {
                                        isWrite = false;
                                    } else {
                                        isWrite = true;
                                    }
                                }


                                if (selectedContent[0].deleted) {
                                    isRelevant = false;
                                }
                                if (selectedContent[0].newFile) {
                                    state += "*";
                                }
                            }

                            this.renderSelect(icon, state, isBulk, isAdmin, isRelevant, isInFlight, isWrite, perms, isOneItemLocked);
                        }
                        //add class to remove border from last item - would be more efficient using YUI Selector module, but it's currently not loaded
                        var itemContainer = document.getElementById('acn-active-content');
                        if (itemContainer.hasChildNodes()){
                            var lastItem = itemContainer.lastChild;
                            lastItem.className += ' acn-link-last';
                            // override background for first menu item
                            if (itemContainer.children.length > 0) {
                                var secondItem = itemContainer.children[1];
                                if (secondItem) {
                                    secondItem.style.background = 'none';
                                }
                            }
                        }
                    },

                    hasWritePermission : function hasWritePermission (permissions) {
                        var isWrite = CStudioAuthoring.Service.isWrite(permissions);
                        var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(permissions);

                        if (isWrite && isUserAllowed) {
                            return true;
                        } else {
                            return false;
                        }
                    },

                    /**
                     * check permissions on the given path
                     */
                    checkWritePermission: function(path, callback) {
                        //Get user permissions to get read write operations
                        var _this = this,
                            checkPermissionsCb = {
                                success: function(results) {
                                    var isWrite = _this.hasWritePermission(results.permissions);
                                    callback.success(isWrite, results.permissions);
                                },
                                failure: function() { }
                            };
                        CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, path, checkPermissionsCb);
                    },

                    /**
                     * select none
                     */
                    renderSelectNone: function() {
                        this.containerEl.innerHTML = "";
                    },

                    /**
                     * render many items
                     */
                    renderSelect: function(icon, state, isBulk, isAdmin, isRelevant, isInFlight, isWrite, perms, isOneItemLocked) {

                        this.containerEl.innerHTML = "";
                        var navLabelElContainer = document.createElement("li"),
                            navLabelEl = document.createElement("span"),
                            statSplit = state.split("|"),
                            hasOperations;

                        for(var i=0; i<this.options.length; i++) {
                            var option = this.options[i];
                            if (isInFlight != undefined && isInFlight != null) {
                                option.isInFlight = isInFlight;
                            }
                            if(!option.renderer) {
                                navWcmContent.createNavItem(option, isBulk, isAdmin, true, false, perms);
                            } else{
                                // The last parameter (isOneItemLocked) was added for renderDelete which needs to know if one of the
                                // content items is currently locked or not
                                option.renderer.render(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked);
                            }
                        }

                        hasOperations = YDom.getElementsByClassName("acn-link", null, this.containerEl).length;
                        YDom.addClass(navLabelEl, [icon, 'context-nav-title-element', 'navbar-text'].join(" "));

                        if(!isBulk || statSplit.length <= 1) {
                            var newIndicator = (state.indexOf("*") != -1) ? "*" : "";
                            navLabelEl.innerHTML = CMgs.format(contextNavLangBundle, state) + newIndicator;
                        } else if (statSplit.length >= 2) {
                            navLabelEl.innerHTML = CMgs.format(contextNavLangBundle, "mixedStates");
                            }

                        if (!isInFlight && hasOperations) {
                            navLabelEl.innerHTML += " :";
                        }

                        navLabelElContainer.appendChild(navLabelEl);
                        if (this.containerEl.children.length) {
                            YDom.insertBefore(navLabelElContainer, this.containerEl.firstChild);
                        } else {
                            this.containerEl.appendChild(navLabelElContainer);
                        }
                    },
                    /**
                     * render new option
                     */
                    renderNew: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                            option.onclick = function() {
                                CStudioAuthoring.Operations.createNewContent(
                                    CStudioAuthoringContext.site,
                                    CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri);
                            };
                            _this.createNavItem(option, isBulk, isAdmin, true, !isWrite);
                        }
                    },
                    /**
                     * handle edit
                     */
                    renderEdit: {
                        render: function(option, isBulk, isAdmin, state,  isRelevant, isWrite, perms, isOneItemLocked) {
                            var content = CStudioAuthoring.SelectedContent.getSelectedContent();

//                            for (var i = 0, l = content.length; i < l; ++i) {
//                                if (content[i].asset) return;
//                            }

                            var editCallback = {
                                success: function(contentTO, editorId, name, value, draft) {
                                    var oCurrentTextNodeOldPath = CStudioAuthoring.SelectedContent.getSelectedContent()[0].browserUri;
                                    var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
                                    if(CStudioAuthoring.SelectedContent.getSelectedContent()[0].browserUri != contentTO.item.browserUri){
                                        eventNS.oldPath = CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri;
                                        CStudioAuthoring.SelectedContent.getSelectedContent()[0] = contentTO.item;
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
                                                contentTOBrowseUri = contentTO.item.browserUri;

                                            if (URLBrowseUri == contentTOBrowseUri){
                                                currentContentTO = null;
                                            } else{
                                                currentContentTO = contentTO.item;
                                            }

                                            CStudioAuthoring.Operations.refreshPreview(currentContentTO);

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
                                        eventNS.data = contentTO.item;
                                        eventNS.typeAction = "edit";
                                        eventNS.draft = draft;
                                        document.dispatchEvent(eventNS);
                                        if(!CStudioAuthoringContext.isPreview) {
                                            if(draft) {
                                                console.log(CStudioAuthoring.Utils.Cookies.readCookie("dashboard-selected"));
                                                CStudioAuthoring.Utils.Cookies.createCookie("dashboard-checked", JSON.stringify(CStudioAuthoring.SelectedContent.getSelectedContent()));
                                            }else{
                                                CStudioAuthoring.Utils.Cookies.eraseCookie("dashboard-checked");
                                            }
                                        }
                                },
                                failure: function() { },
                                callingWindow : window
                            };

                            var viewCb = {
                                success: function() { },
                                failure: function() { },
                                callingWindow : window
                            };

                            content = content[0];
                            option.onclick = function() {
                                this.style.pointerEvents = "none";
                                if (typeof CStudioAuthoring.editDisabled === 'undefined') {
                                    CStudioAuthoring.editDisabled = []
                                }
                                CStudioAuthoring.editDisabled.push(this);

                                if (isWrite == false) {
                                        CStudioAuthoring.Operations.viewContent(
                                            content.form,
                                            CStudioAuthoringContext.siteId,
                                            content.uri,
                                            content.nodeRef,
                                            content.uri,
                                            false,
                                            viewCb);
                                    } else {
                                        CStudioAuthoring.Operations.editContent(
                                            content.form,
                                            CStudioAuthoringContext.siteId,
                                            content.uri,
                                            content.nodeRef,
                                            content.uri,
                                            false,
                                            editCallback);
                                    }
                            }; 

                            // relevant flag, allowing document & banner to be editable from Search result
                            // allowing banner type component
                            // alowing crafter-level-descriptor.xml
                            var rflag = ((isRelevant || content.document
                            || ( (content.component) && ( (content.contentType.indexOf("level-descriptor") !=-1 ) ) )) && (state.indexOf("Delete") == -1));
                            //if item is deleted and in the go live queue , enable edit.
                            if(state.indexOf("Submitted for Delete")>=0 || state.indexOf("Scheduled for Delete")>=0) {
                                rflag =  true;
                            }

                            /** for edit, if in read-only mode, it should display View, not Edit **/
                            if (isWrite == false) {
                                option.name = CMgs.format(contextNavLangBundle, "wcmContentView");
                            } else {
                                option.name =CMgs.format(contextNavLangBundle, "wcmContentEdit");
                            }

                            _this.createNavItem(option, isBulk, isAdmin, rflag, false, !isWrite);
                        }
                    },
                    /**
                     * handle duplicate
                     */
                    renderDuplicate: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                            if(isWrite) {
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
                                var content = CStudioAuthoring.SelectedContent.getSelectedContent()[0];
                                option.onclick = function() {
                                    //YDom.get("duplicate-loading").style.display = "block";
                                    CStudioAuthoring.Operations.showSimpleDialog(
                                        "duplicate-dialog",
                                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                        "Duplicate",
                                        "A new copy of this item and all of it's item specific content will be created. Are you sure you wish to proceed?",
                                        [{ text:"Duplicate", handler: function() {
                                            this.hide();
                                            CStudioAuthoring.Operations.duplicateContent(
                                                CStudioAuthoringContext.site,
                                                content.uri,
                                                duplicateContentCallback);
                                        }, isDefault:false },
                                        { text:CMgs.format(formsLangBundle, "cancel"),  handler:function(){this.hide();}, isDefault:true }],
                                        YAHOO.widget.SimpleDialog.ICON_WARN,
                                        "studioDialog"
                                    );
                                };

                                if(content.document || content.component) { // for doc and components disable dublicate link
                                    isRelevant = false;
                                }
                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                            }
                        }
                    },
                    /**
                     * render submit option
                     */
                    renderSimpleSubmit: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked) {

                            if(CStudioAuthoring.Service.isPublishAllowed(perms)) {
                                return;
                            }

                            if(isWrite) {
                                var isRelevant = false;
                                if (( state.indexOf("In Progress") >= 0
                                    || state.indexOf("Deleted") >= 0
                                    || state.indexOf("Submitted") != -1
                                    || state.indexOf("Submitted for Delete") >=0
                                    || state.indexOf("Scheduled for Delete") >=0 ) && !isOneItemLocked) {
                                    isRelevant = true;
                                }

                                //Check for live items
                                var content = CStudioAuthoring.SelectedContent.getSelectedContent();
                                if (isRelevant && content && content.length >= 1) {
                                    for (var conIdx=0; conIdx<content.length; conIdx++) {
                                        var auxState = CStudioAuthoring.Utils.getContentItemStatus(content[conIdx]);
                                        if (auxState == "Live") {
                                            isRelevant = false;
                                            break;
                                        }
                                    }
                                }

                                option.onclick = function() {
                                    CStudioAuthoring.Operations.submitContent(
                                        CStudioAuthoringContext.site,
                                        CStudioAuthoring.SelectedContent.getSelectedContent());
                                };
                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                            }
                        }
                    },

                    renderScheduleForDelete: {
                        render: function(option, isBulk, isAdmin, state, showFlag, isWrite) {
                            var isRelevant = false;

                            if(isWrite) {
                                //Schedule for Delete link should visible only from wcm search pages.
                                var isInSearchForm = YDom.getElementsByClassName("cstudio-search-result");
                                if (showFlag && isInSearchForm && isInSearchForm.length >= 1) {
                                    if (showFlag) {
                                        isRelevant = true;
                                    }

                                    if(state.indexOf("Submitted for Delete")>=0 || state.indexOf("Scheduled for Delete")>=0) {
                                        isRelevant = true;
                                    }
                                    option.onclick = function(){
                                        CStudioAuthoring.Operations.deleteContent(
                                            CStudioAuthoring.SelectedContent.getSelectedContent());
                                    }
                                }

                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                            }

                        }
                    },

                    renderDelete: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked) {
                            if(isWrite && CStudioAuthoring.Service.isDeleteAllowed(perms)) {
                                var isRelevant = true;
                                var isAdminFlag = isAdmin;

                                if(state.indexOf("Submitted for Delete")>=0 || state.indexOf("Scheduled for Delete")>=0 || isOneItemLocked) {
                                    isRelevant = false;
                                    isAdminFlag =  false;
                                }

                                option.onclick = function() {
                                    CStudioAuthoring.Operations.deleteContent(
                                        CStudioAuthoring.SelectedContent.getSelectedContent());
                                }
                                _this.createNavItem(option, isBulk, isAdminFlag, isRelevant, !isWrite);
                            }
                        }
                    },
                    renderVersionHistory: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                            if(isWrite){
                                option.onclick = function() {
                                    CStudioAuthoring.Operations.viewContentHistory(
                                        CStudioAuthoring.SelectedContent.getSelectedContent()[0]);
                                }
                                //Making this link false as this feature is not yet completed.
                                _this.createNavItem(option, isBulk, isAdmin, true, !isWrite);
                            }
                        }
                    },


                    renderApproveCommon: {
                        render: function(option, isBulk, isAdmin,
                                         state, isRelevant, isWrite, perms, isOneItemLocked) {

                            if (CStudioAuthoring.Service.isPublishAllowed(perms)) {

                                var isRelevant = (!(state.toLowerCase().indexOf("live") !== -1)
                                && !isOneItemLocked);

                                option.onclick = function() {
                                    CStudioAuthoring.Operations.approveCommon(
                                        CStudioAuthoringContext.site,
                                        CStudioAuthoring.SelectedContent.getSelectedContent(),
                                        (option.name == "Schedule") ? true : false
                                    );
                                };
                                
                                var renderFlag = true;
                                if(option.name == "Schedule") {
                                    var items = CStudioAuthoring.SelectedContent.getSelectedContent();
                                    for(var i=0; i<items.length; i++) {
                                        if(items[i].submittedForDeletion==true) {
                                            renderFlag = false;
                                            break;
                                        }
                                    }
                                }

                                if(renderFlag == true) {
                                    _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                                }

                            }
                        }
                    },

                    /**
                     * render approve / golive option
                     */
                    renderApprove: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked) {
                            if(CStudioAuthoring.Service.isPublishAllowed(perms)) {
                                var lowerstate = state.toLowerCase(),
                                    isRelevant = true;
                                if ( lowerstate.indexOf("live") != -1 || isOneItemLocked ) {
                                    isRelevant = false;
                                }
                                option.onclick = function() {
                                    CStudioAuthoring.Operations.approveContent(
                                        CStudioAuthoringContext.site,
                                        CStudioAuthoring.SelectedContent.getSelectedContent());
                                };
                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                            }
                        }
                    },
                    /**
                     * render approve-schedule option
                     */
                    renderApproveSchedule: {
                        render: function(option, isBulk, isAdmin, state,  isRelevant, isWrite, perms, isOneItemLocked) {
                            if(CStudioAuthoring.Service.isPublishAllowed(perms)) {
                                var lowerstate = state.toLowerCase(),
                                    isRelevant = true;
                                if ( lowerstate.indexOf("live") != -1 || isOneItemLocked ) {
                                    isRelevant = false;
                                }
                                option.onclick = function() {
                                    CStudioAuthoring.Operations.approveScheduleContent(
                                        CStudioAuthoringContext.site,
                                        CStudioAuthoring.SelectedContent.getSelectedContent() );
                                };
                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                            }
                        }
                    },
                    /**
                     * render reject option
                     */
                    renderReject: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms) {
                            if(CStudioAuthoring.Service.isPublishAllowed(perms)) {
                                 isRelevant = false;
                                if ( (state.indexOf("Submitted") != -1 
                                || state.indexOf("Scheduled") != -1 
                                || state.indexOf("Deleted") != -1)) {
                                    isRelevant = true;
                                }

                                //Check that all selected items are from go-live queue or not
                                /*var content = CStudioAuthoring.SelectedContent.getSelectedContent();
                                if (isRelevant && content && content.length >= 1) {
                                    for (var conIdx=0; conIdx<content.length; conIdx++) {
                                        var auxState = CStudioAuthoring.Utils.getContentItemStatus(content[conIdx]);
                                        if ( (auxState.indexOf("Submitted") != -1 || auxState.indexOf("Scheduled") != -1 || auxState.indexOf("Deleted") != -1) &&
                                            auxState != "Scheduled") {
                                            //Here is special case for sheduled for delted items.
                                            if ((auxState == "Submitted for Delete" || auxState == "Scheduled for Delete") && !content[conIdx].submitted && content[conIdx].scheduled) {
                                                isRelevant = false;
                                                break;
                                            } else {
                                                isRelevant = true;
                                            }
                                        } else {
                                            isRelevant = false;
                                            break;
                                        }
                                    }
                                }*/

                                option.onclick = function() {
                                    CStudioAuthoring.Operations.rejectContent(
                                        CStudioAuthoringContext.site,
                                        CStudioAuthoring.SelectedContent.getSelectedContent());
                                };
                                _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                            }
                        }
                    },
                    /**
                     * render Dependencies option
                     */
                    renderViewDependencies: {
                        render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked) {
                            isRelevant = true;

                            option.onclick = function() {

                                CStudioAuthoring.Operations.viewDependencies(
                                    CStudioAuthoringContext.site,
                                    CStudioAuthoring.SelectedContent.getSelectedContent(),
                                    false
                                );

                            };
                            _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);

                        }
                    },
                    /**
                     * copy paste needs to be dynamic.  if there are items on the clipboard
                     * it needs to say paste.  if there are no items on the cliploard it needs to
                     * say copy.
                     * question: how do you clear the clipboard or see whats on it?  I think we may want this to
                     * be a dropdown?
                     */
                    renderclipboard: {
                        render: function(option) {
                            option.name = "Copy";
                            _this.createNavItem(option, true, true);
                        }
                    },
                    /**
                     * create simple name item
                     */
                    createNavItem: function(item, isBulk, isAdmin, isRelevant, disableItem) {
                        var parentEl = this.containerEl;
                        var showItem = (!item.isInFlight && ((isAdmin && item.allowAdmin) || (!isAdmin && item.allowAuthor)));
                        if(showItem) {
                            /* Do not attach items if links are not relevant */
                            if(!isRelevant || (isBulk && !item.allowBulk))
                                return;

                            var linkContainerEl = document.createElement("li"),
                                linkEl = document.createElement("a");

                            YDom.addClass(linkContainerEl, "acn-link");
                            linkEl.innerHTML = item.name;
                            YDom.addClass(linkEl, "cursor");
                            linkEl.style.cursor = 'pointer';

                            if(disableItem == true) {
                                YDom.addClass(linkEl, "acn-link-disabled");
                                /* not setting onclick either*/
                            } else {
                                if(item.onclick) {
                                    linkEl.onclick = item.onclick;
                                } else {
                                    linkEl.onclick = function(){
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "noEventError-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            CMgs.format(contextNavLangBundle, "notification"),
                                            CMgs.format(contextNavLangBundle, "noEventError"),
                                            null, // use default button
                                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                            "studioDialog"
                                        );
                                    };
                                }
                            }

                            var dividerEl = document.createElement("div");
                            dividerEl.id = "acn-render";

                            parentEl.appendChild(linkContainerEl);
                            linkContainerEl.appendChild(linkEl);

                            /**
                             * adding ajax status image for item who has renderId
                             */
                            if(item.renderId != null) {
                                var loadingImageEl = document.createElement("img");
                                loadingImageEl.id = item.renderId.toLowerCase() + "-loading";
                                loadingImageEl.src = contextPath + CStudioAuthoringContext.baseUri + "/static-assets/themes/cstudioTheme/images/treeview-loading.gif";
                                linkContainerEl.appendChild(loadingImageEl);
                            }
                        }
                    },

                    isAllowedEditForSelection: function(){
                        var contentItem = CStudioAuthoring.SelectedContent.getSelectedContent()[0];

                        // Edits etc are not allowed on asset items.
                        if (contentItem.asset){
                            return false;
                        }

                        return true;

                    },

                    areSomeSelectedItemsLockedOut : function() {
                        var itemLockedOut = false;
                        var selectedItems = CStudioAuthoring.SelectedContent.getSelectedContent();
                        for (var i = 0; !itemLockedOut && i < selectedItems.length; i++) {
                            if (CStudioAuthoring.Utils.isLockedOut(selectedItems[i])) {
                                itemLockedOut = true;
                            }
                        }

                        return itemLockedOut;
                    }
                }
            });

        }
    }
}) ();

CStudioAuthoring.Module.moduleLoaded("wcm_content", CStudioAuthoring.ContextualNav.WcmActiveContentMod);