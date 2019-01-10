/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function ($, window, amplify, CStudioAuthoring) {
    'use strict';

    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

    var cstopic = crafter.studio.preview.cstopic;
    var Topics = crafter.studio.preview.Topics;
    var previewAppBaseUri = CStudioAuthoringContext.previewAppBaseUri || "";
    var origin = previewAppBaseUri; // 'http://127.0.0.1:8080';
    var communicator = new crafter.studio.Communicator(origin);
    var previewWidth;
    // CStudioAuthoring.Utils.Cookies.readCookie('crafterSite')

    communicator.subscribe(Topics.GUEST_CHECKIN, function (url) {
        var site = CStudioAuthoring.Utils.Cookies.readCookie('crafterSite');
        var params = {
            page: url,
            site: site
        };
        setHash(params);
        amplify.publish(cstopic('GUEST_CHECKIN'), params);
    });

    communicator.subscribe(Topics.GUEST_CHECKOUT, function () {
        // console.log('Guest checked out');
    });

    communicator.subscribe(Topics.ICE_ZONE_ON, function (message, scope) {

        var isWrite = false;
        var par = [];
        var currentPath = (message.itemId) ? message.itemId : CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri;
        var cachePermissionsKey = CStudioAuthoringContext.site+'_'+currentPath+'_'+CStudioAuthoringContext.user+'_permissions',
            isPermissionCached = cache.get(cachePermissionsKey),
            cacheContentKey = CStudioAuthoringContext.site+'_'+currentPath+'_'+CStudioAuthoringContext.user+'_content',
            isContentCached = cache.get(cacheContentKey);
        var isLockOwner = function (lockOwner){
            if (lockOwner != '' && lockOwner != null && CStudioAuthoringContext.user != lockOwner) {
                par = [];
                isWrite = false;
                par.push({name: "readonly"});
            }
        }
        var editCb = {
            success:function(contentTO, editorId, name, value, draft) {
                if(CStudioAuthoringContext.isPreview){
                    try{
                        CStudioAuthoring.Operations.refreshPreview();
                    }catch(err) {
                        if(!draft) {
                            this.callingWindow.location.reload(true);
                        }
                    }
                }
                if(CStudioAuthoringContext.isPreview || (!CStudioAuthoringContext.isPreview && !draft)) {
                    eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
                    eventNS.typeAction = "";
                    document.dispatchEvent(eventNS);
                }
            },
            failure: function() {
            }
        };
        var editPermsCallback = {
            success: function (response) {
                if(!isPermissionCached){
                    cache.set(cachePermissionsKey, response.permissions, CStudioAuthoring.Constants.CACHE_TIME_PERMISSION);
                }
                isWrite = CStudioAuthoring.Service.isWrite(response.permissions);
                if (!isWrite) {
                    par.push({name: "readonly"});
                }

                if (!message.itemId) {
                    // base page edit
                    isLockOwner(CStudioAuthoring.SelectedContent.getSelectedContent()[0].lockOwner);
                    CStudioAuthoring.Operations.performSimpleIceEdit(
                        CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                        message.iceId, //field
                        isWrite,
                        editCb,
                        par);

                } else {
                    var getContentItemsCb = {
                        success: function (contentTO) {
                            if(!isContentCached){
                                cache.set(cacheContentKey, contentTO.item, CStudioAuthoring.Constants.CACHE_TIME_GET_CONTENT_ITEM);
                            }
                            isLockOwner(contentTO.item.lockOwner);
                            CStudioAuthoring.Operations.performSimpleIceEdit(
                                contentTO.item,
                                this.iceId, //field
                                isWrite,
                                this.editCb,
                                par);
                        },
                        failure: function () {
                            callback.failure();
                        },
                        iceId: message.iceId,
                        editCb: editCb
                    };

                    if(isContentCached){
                        var contentTO = {};
                        contentTO.item = isContentCached;
                        getContentItemsCb.success(contentTO);
                    }else {
                        CStudioAuthoring.Service.lookupContentItem(
                            CStudioAuthoringContext.site,
                            message.itemId,
                            getContentItemsCb,
                            false, false);
                    }

                }
            }, failure: function () {}
        }

        if(isPermissionCached){
            var response = {};
            response.permissions = isPermissionCached;
            editPermsCallback.success(response);
        }else {
            CStudioAuthoring.Service.getUserPermissions(
                CStudioAuthoringContext.site,
                currentPath,
                editPermsCallback);
        }

    });

    communicator.subscribe(Topics.ICE_ZONES, function (message) {

        var params = {
            iceRef: message.iceRef,
            position: message.position
        }
        var currentPath = (message.path) ? message.path : CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri;
        var isLockOwner = function (lockOwner){
            if (lockOwner != '' && lockOwner != null && CStudioAuthoringContext.user != lockOwner) {
                params.class = 'lock';
            }
        }
        var cachePermissionsKey = CStudioAuthoringContext.site+'_'+currentPath+'_'+CStudioAuthoringContext.user+'_permissions',
            isPermissionCached = cache.get(cachePermissionsKey),
            cacheContentKey = CStudioAuthoringContext.site+'_'+currentPath+'_'+CStudioAuthoringContext.user+'_content',
            isContentCached = cache.get(cacheContentKey);

        var permsCallback = {
            success: function (response) {
                if(!isPermissionCached){
                    cache.set(cachePermissionsKey, response.permissions, CStudioAuthoring.Constants.CACHE_TIME_PERMISSION);
                }
                var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);

                if (!message.path) {
                    if (isWrite) {
                        isLockOwner(CStudioAuthoring.SelectedContent.getSelectedContent()[0].lockOwner);
                    }else {
                        params.class = 'read';
                    }
                    communicator.publish(Topics.ICE_TOOLS_INDICATOR, params);
                } else {
                    var itemCallback = {
                        success: function (contentTO) {
                            if(!isContentCached){
                                cache.set(cacheContentKey, contentTO.item, CStudioAuthoring.Constants.CACHE_TIME_GET_CONTENT_ITEM);
                            }
                            isLockOwner(contentTO.item.lockOwner);
                            communicator.publish(Topics.ICE_TOOLS_INDICATOR, params);
                        },failure: function () {}
                    }

                    if (isWrite) {
                        if(isContentCached){
                            var contentTO = {};
                            contentTO.item = isContentCached;
                            itemCallback.success(contentTO);
                        }else {
                            CStudioAuthoring.Service.lookupContentItem(
                                CStudioAuthoringContext.site,
                                currentPath,
                                itemCallback,
                                false, false);
                        }
                    } else {
                        params.class = 'read';
                    }
                }

            },failure: function () {}
        }

        if(isPermissionCached){
            var response = {};
            response.permissions = isPermissionCached;
            permsCallback.success(response);
        }else {
            CStudioAuthoring.Service.getUserPermissions(
                CStudioAuthoringContext.site,
                currentPath,
                permsCallback);
        }

    });

    // Listen to the guest site load
    communicator.subscribe(Topics.GUEST_SITE_LOAD, function (message, scope) {

        if (message.url) {
            var params = {
                page:message.url,
                site: CStudioAuthoring.Utils.Cookies.readCookie('crafterSite')
            };
            setHash(params);
            amplify.publish(cstopic('GUEST_SITE_LOAD'), params);
        }

        // Once the guest window notifies that the page as successfully loaded,
        // add the guest window as a target of messages sent by this window
        communicator.addTargetWindow({
            origin: origin,
            window: getEngineWindow().contentWindow
        });

    });

    communicator.subscribe(Topics.STOP_DRAG_AND_DROP, function () {
        CStudioAuthoring.PreviewTools.panel.element.style.visibility = "visible" ;
        $(CStudioAuthoring.PreviewTools.panel.element).show('slow', function(){

            if(!previewWidth || previewWidth == 0 || previewWidth == "0px") {
                previewWidth = 265;
            }
            $('.studio-preview').css('right', previewWidth);
            YDom.replaceClass('component-panel-elem', 'expanded', 'contracted');
        });
    });

    amplify.subscribe(cstopic('DND_COMPONENTS_PANEL_OFF'), function (config) {
        sessionStorage.setItem('pto-on', "");
        /*var PreviewToolsOffEvent = new YAHOO.util.CustomEvent("cstudio-preview-tools-off", CStudioAuthoring);
        PreviewToolsOffEvent.fire();*/
        var el = YDom.get("acn-preview-tools-container");
        YDom.removeClass(el.children[0], "icon-light-blue");
        YDom.addClass(el.children[0], "icon-default");
        communicator.publish(Topics.DND_COMPONENTS_PANEL_OFF, {});
    });

    amplify.subscribe(cstopic('DND_COMPONENTS_PANEL_ON'), function (config) {
        sessionStorage.setItem('pto-on', "on");
        var el = YDom.get("acn-preview-tools-container");
        YDom.removeClass(el.children[0], "icon-default");
        YDom.addClass(el.children[0], "icon-light-blue");
        amplify.publish(cstopic('START_DRAG_AND_DROP'), {
            components: config.components
        });
    });

    communicator.subscribe(Topics.COMPONENT_DROPPED, function (message) {
        message.model = initialContentModel;
        amplify.publish(cstopic('COMPONENT_DROPPED'),
            message.type,
            message.path,
            message.isNew,
            message.trackingNumber,
            message.zones,
            message.compPath,
            message.conComp,
            message.model
        );
    });

    communicator.subscribe(Topics.START_DIALOG, function (message) {
        var newdiv = document.createElement("div");

        newdiv.setAttribute("id", "cstudio-wcm-popup-div");
        newdiv.className = "yui-pe-content";
        newdiv.innerHTML = '<div class="contentTypePopupInner" id="warning">' +
            '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
            '<div class="contentTypePopupHeader">Notification</div> ' +
            '<div class="contentTypeOuter">'+
            '<div>'+message.message+'</div> ' +
            '<div>' +
            '</div>' +
            '</div>' +
            '<div class="contentTypePopupBtn"> ' +
            '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="cancelButton" value="OK" />' +
            '</div>' +
            '</div>';

        document.body.appendChild(newdiv);

        var dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div", {
            width: "400px",
            height: message.height ? message.height : "222px",
            fixedcenter: true,
            visible: false,
            modal: true,
            close: false,
            constraintoviewport: true,
            underlay: "none",
            autofillheight: null,
            buttons: [{ text:"Cancel", handler: function() { $(this).destroy(); }, isDefault:true }]
        });

        dialog.render();
        dialog.show();
        dialog.cfg.setProperty("zIndex", 100001); // Update the z-index value to make it go over the site content nav

        YAHOO.util.Event.addListener("cancelButton", "click", function() {
            dialog.destroy();
            var masks = YAHOO.util.Dom.getElementsByClassName("mask");
            for (var i =0; i < masks.length; i++){
                YAHOO.util.Dom.getElementsByClassName("mask")[0].parentElement.removeChild(YAHOO.util.Dom.getElementsByClassName("mask")[0]);
            }
        });

        return dialog;
    });

    communicator.subscribe(Topics.OPEN_BROWSE, function (message) {
        CStudioAuthoring.Operations.openBrowse("", CStudioAuthoring.Operations.processPathsForMacros(message.path, initialContentModel ), 1, "select", true, {
            success: function (searchId, selectedTOs) {

                for (var i = 0; i < selectedTOs.length; i++) {
                    var item = selectedTOs[i];
                    communicator.publish(Topics.DND_CREATE_BROWSE_COMP, {
                        component: selectedTOs[i],
                        initialContentModel: initialContentModel
                    });
                }
            },
            failure: function () {
            }
        });
    });

    communicator.subscribe(Topics.SAVE_DRAG_AND_DROP, function (message) {
        amplify.publish(cstopic('SAVE_DRAG_AND_DROP'),
            message.isNew,
            message.zones,
            message.compPath,
            message.conComp
        );
    });

    communicator.subscribe(Topics.INIT_DRAG_AND_DROP, function (message) {
        amplify.publish(cstopic('INIT_DRAG_AND_DROP'),
            message.zones);
    });

    communicator.subscribe(Topics.DND_ZONES_MODEL_REQUEST, function (message) {
        amplify.publish(cstopic('DND_ZONES_MODEL_REQUEST'),
            message.aNotFound
        );

    });

    communicator.subscribe(Topics.LOAD_MODEL_REQUEST, function (message) {
        amplify.publish(cstopic('LOAD_MODEL_REQUEST'),
            message.aNotFound
        );

    });

    amplify.subscribe(cstopic('REFRESH_PREVIEW'), function () {
        communicator.publish(Topics.REFRESH_PREVIEW);
    });

    var initialContentModel;
    amplify.subscribe(cstopic('START_DRAG_AND_DROP'), function (config) {
        previewWidth = $('.studio-preview').css('right');
        $('.studio-preview').css('right', 0);
        $(CStudioAuthoring.PreviewTools.panel.element).hide('fast', function(){
            var data, dataBrowse;
            if (config.components.category){
                data = config.components.category;
            }else{
                data = config.components;
            }

            if (config.components.browse){
                dataBrowse = config.components.browse;
            }

            var categories = [], browse = [];

            if(data) {
                if ($.isArray(data)) {
                    $.each(data, function (i, c) {
                        if (c.component) {
                            categories.push({ label: c.label, components: c.component });
                        } else {
                            categories.push({ label: c.label, components: c.components });
                        }

                    });
                } else {
                    if (data.component) {
                        categories.push({ label: data.label, components: data.component });
                    } else {
                        categories.push({ label: data.label, components: data.components });
                    }
                }
            }

            if(dataBrowse) {
                if ($.isArray(dataBrowse)) {
                    $.each(dataBrowse, function (i, c) {
                        browse.push({ label: c.label, path: c.path });
                    });
                } else {
                    browse.push({ label: dataBrowse.label, path: dataBrowse.path });
                }
            }

            var text = {};
            text.done = CMgs.format(previewLangBundle, "done");
            text.components = CMgs.format(previewLangBundle, "components");
            text.addComponent = CMgs.format(previewLangBundle, "addComponent");

            communicator.publish(Topics.START_DRAG_AND_DROP, {
                components: categories,
                contentModel: initialContentModel,
                translation: text,
                browse: browse
            });
        });
    });

    amplify.subscribe(cstopic('CHANGE_GUEST_REQUEST'), function (url) {
        // console.log(arguments);
    });

    amplify.subscribe(cstopic('DND_COMPONENT_MODEL_LOAD'), function (data) {
        communicator.publish(Topics.DND_COMPONENT_MODEL_LOAD, data);
    });

    amplify.subscribe(cstopic('DND_COMPONENTS_MODEL_LOAD'), function (data) {
        initialContentModel = data;
        communicator.publish(Topics.DND_COMPONENTS_MODEL_LOAD, data);
    });

    amplify.subscribe(cstopic('ICE_TOOLS_OFF'), function (){
        communicator.publish(Topics.ICE_TOOLS_OFF);
    });

    communicator.subscribe(Topics.ICE_CHANGE_PENCIL_OFF, function (message) {
        $("#acn-ice-tools-container img").attr("src", CStudioAuthoringContext.authoringAppBaseUri + "/static-assets/themes/cstudioTheme/images/edit_off.png")
    });

    communicator.subscribe(Topics.ICE_CHANGE_PENCIL_ON, function (message) {
        $("#acn-ice-tools-container img").attr("src", CStudioAuthoringContext.authoringAppBaseUri + "/static-assets/themes/cstudioTheme/images/edit.png")
    });

    amplify.subscribe(cstopic('ICE_TOOLS_ON'), function (){
        communicator.publish(Topics.ICE_TOOLS_ON);
    });

    amplify.subscribe(cstopic('ICE_TOOLS_REGIONS'), function (data){
        communicator.publish(Topics.ICE_TOOLS_REGIONS, data);
    });

    communicator.subscribe(Topics.IS_REVIEWER, function (resize) {

        var callback = function(isRev) {
            if(!isRev){
                if(resize){
                    communicator.publish(Topics.RESIZE_ICE_REGIONS);
                }else{
                    communicator.publish(Topics.INIT_ICE_REGIONS);
                }
            }
        }

        CStudioAuthoring.Utils.isReviewer(callback);
    });

    function setHashPage(url) {
        window.location.hash = '#/?page=' + url;
    }

    function setHash(params) {
        var hash = [];
        for (var key in params) {
            hash.push(key + '=' + params[key]);
        }
        CStudioAuthoringContext && (CStudioAuthoringContext.previewCurrentPath = params.page);
        window.location.hash = '#/?' + hash.join('&');
    }

    function getEngineWindow() {
        return document.getElementById('engineWindow');
    }

    function goToHashPage() {

        var win = getEngineWindow();
        var hash = parseHash(window.location.hash);
        var site = CStudioAuthoring.Utils.Cookies.readCookie('crafterSite');
        var siteChanged = false;

        if (hash.site) {
            CStudioAuthoring.Utils.Cookies.createCookie('crafterSite', hash.site);
            siteChanged = (site !== hash.site);
        }

        setTimeout(function () {
            // TODO this thing doesn't work well if document domain is not set on both windows. Problem?
            try {
                if (siteChanged ||
                    win.contentWindow.location.href.replace(origin, '') !== hash.page) {
                    win.src = previewAppBaseUri + hash.page;
                }
            } catch (err) {
                if (siteChanged ||
                    win.src.replace(origin, '') !== hash.page) {
                    win.src = previewAppBaseUri + hash.page;
                }
            }

        });

        var path = hash.page,
            hashPage = hash.page;

        if (path && path.indexOf(".") != -1) {
            if (path.indexOf(".html") != -1 || path.indexOf(".xml") != -1) {
                path = ('/site/website/' + hashPage).replace('//', '/');
                path = path.replace('.html', '.xml')
            }
        }
        else {
            if (hash.page && hash.page.indexOf('?') != -1) {
                hashPage = hash.page.substring(0, hash.page.indexOf('?'));
            }
            if (hash.page && hash.page.indexOf('#') != -1) {
                hashPage = hash.page.substring(0, hash.page.indexOf('#'));
            }
            if (hash.page && hash.page.indexOf(';') != -1) {
                hashPage = hash.page.substring(0, hash.page.indexOf(';'));
            }

            path = ('/site/website/'+ hashPage+'/index.xml').replace('//','/');
        }

        path = path.replace('//', '/');

        CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, {
            success: function (content) {
                CStudioAuthoring.SelectedContent.setContent(content.item);
            }
        });

        new ResizeSensor($('.navbar-default'), function () {
            if ($('.navbar-default').height() > 55) {
                $('.studio-preview').css('top', 100 + "px");
            } else {
                $('.studio-preview').css('top', 50 + "px");
            }
        });

    }

    // TODO better URL support. Find existing lib, use angular or use backbone router?
    function parseHash(hash) {

        var str = hash.replace('#/', ''),
            params = {},
            param;

        str = str.substr(str.indexOf('?') + 1);
        if(str.indexOf('?') != -1){
            var strPage = str.split('?');
            var strPageParam = strPage[1].split('&');
            str = strPage[0] + '?';
            for (var i=0; i < strPageParam.length; i++){
                if((strPageParam[i].indexOf('site') != -1) && (i == strPageParam.length-1)){
                    str = str + '&' + strPageParam[i];
                }else{
                    str = str + strPageParam[i];
                    if(i != strPageParam.length-1){
                        str = str + '&';
                    }
                }
            }
            str = str.split('&&');
        }else{
            str = str.split('&');
        }

        for (var i = 0; i < str.length; ++i) {
            param = splitOnce(str[i], '=');
            params[param[0]] = param[1];
        }

        return params;

    }

    function splitOnce(input, splitBy) {
        var fullSplit = input.split(splitBy);
        var retVal = [];
        retVal.push( fullSplit.shift() );
        retVal.push( fullSplit.join( splitBy ) );
        return retVal;
    }

    window.addEventListener("hashchange", function (e) {
        e.preventDefault();
        goToHashPage();
    }, false);

    window.addEventListener('load', function () {

        if (window.location.hash.indexOf('page') === -1) {
            setHash({
                page: '/',
                site: CStudioAuthoring.Utils.Cookies.readCookie('crafterSite')
            });
        } else {
            goToHashPage();
        }

    }, false);

}) (jQuery, window, amplify, CStudioAuthoring);
