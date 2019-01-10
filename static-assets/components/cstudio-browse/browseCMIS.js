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

(function (window, $, Handlebars) {
    "use strict";

    var storage = CStudioAuthoring.Storage,
        repoPath;

    var CStudioBrowseCMIS = $.extend(
        {}, window.CStudioBrowse);

    CStudioBrowseCMIS.init = function() {
        var me = this;

        CStudioBrowseCMIS.bindEvents();

        var searchContext = this.determineSearchContextFromUrl();
        this.searchContext = searchContext;

        CStudioBrowseCMIS.getContent("browse", {
            success: function(response) {
                me.rootItems = response;
                me.renderSiteFolders(me.rootItems);
            },
            failure: function() {
            }
        });

        var CMgs = CStudioAuthoring.Messages,
            browseLangBundle = CMgs.getBundle("browse", CStudioAuthoringContext.lang);

        var cb = function(repositories){

            var repo = null,
                repoId = CStudioAuthoring.Utils.getQueryParameterByName("repoId");
            if(!repositories.length){
                repo = repositories;
            }else {
                for (var i = 0; i < repositories.length; i++) {
                    if (repoId === repositories[i].id) {
                        repo = repositories[i];
                    }
                }
            }

            repoPath = repo["download-url-regex"];

        }

        CStudioBrowseCMIS.getConfig(cb);
    };

    CStudioBrowseCMIS.bindEvents = function() {
        var me = this,
            $tree = $("#data");

        //tree related events

        $tree.on('ready.jstree', function(event, data){
            var tree = data.instance;
            var obj = tree.get_selected(true)[0];
            me.currentSelection = "";

            var openNodes = function(nodes, index){
                if(0 == index){
                    var $tree = $('#data');

                    var selectedId = $tree.jstree('get_selected')[0];
                    $("#" + selectedId + "_anchor").removeClass("jstree-clicked jstree-hovered");

                    $tree.jstree("select_node", "#" + nodes[index]);
                }else{
                    $("#" + nodes[index] + " > .jstree-ocl").click();
                    $("#data").one('open_node.jstree', function(event, node){
                        openNodes(nodes, index - 1);
                    });
                }
            };

            //get cookie - last browsed item
            if( storage.read( "cmis-browse-path" ) ){
                var nodes = storage.read( "cmis-browse-path" );
                nodes = nodes.split(",");

                if(nodes.length > 0){
                    openNodes(nodes, nodes.length - 1);
                }
            }else if (obj) {
                tree.trigger('select_node', { 'node' : obj, 'selected' : tree._data.core.selected, 'event' : event });
            }
        });

        $tree.on('select_node.jstree', function(event, data){
            var path = data.node.a_attr["data-path"];

            if(me.currentSelection != data.node.id){
                me.renderSiteContent(path);
                me.currentSelection = data.node.id;

                //create cookie with current selected node
                var nodes = [data.node.id],
                    currentNode = data.node,
                    finished = false,
                    parentNode,
                    parent;

                if("cmis-root" !== currentNode.id){
                    while(!finished){
                        parent = currentNode.parent,
                            parentNode = $('#data').jstree(true).get_node(parent);

                        if("cmis-root" === parent){
                            finished = true;
                        }else{
                            currentNode = parentNode;
                            nodes.push(parent);
                        }
                    }
                }

                storage.write("cmis-browse-path", nodes.join(), 360);
            }

        });

        $('.cstudio-browse-container').on('click', '.path span', function(){
            var path = $(this).attr('data-path');

            me.renderSiteContent(path);
        });

        $tree.on('open_node.jstree', function(event, node){
            $("#" + node.node.id + "_anchor").click();
        });

        $tree.on("click", ".jstree-ocl", function(event, node){

            if(!$(this).parent().attr("aria-expanded")){
                var $node = $('#data').jstree(true).get_node(this.parentElement.id),
                    path = "cmis-root" === $node.a_attr["data-path"] ? "": $node.a_attr["data-path"],
                    $resultsContainer = $('#cstudio-wcm-browse-result .results'),
                    $resultsActions = $('#cstudio-wcm-browse-result .cstudio-results-actions');

                if(me.currentSelection != $node.id){
                    $resultsContainer.empty();
                    $resultsActions.empty();
                }
            
                CStudioBrowseCMIS.getContent("browse", {
                    success: function(response) {
                        var subFolders = false;

                        if(response.total > 0){
                            $.each(response.items, function(index, value){
                                if( "folder" === value.mime_type ){
                                    $tree.jstree('create_node', $node,
                                        {
                                            "id": value.item_id,
                                            "text":value.item_name,
                                            "a_attr": {
                                                "data-path": value.item_path
                                            }
                                        },
                                        "last", false, false);

                                    subFolders = true;
                                }
                            });

                            if(subFolders) {
                                $("#" + $node.id + " > i").click();
                            }
                        }else{
                            $resultsContainer.empty();
                            $resultsActions.empty();
                            me.renderNoItems();
                        }

                        $("#" + $node.id + "_anchor").click();

                    },
                    failure: function() {

                    }
                }, path);
            }

        });

        $("#cstudio-wcm-search-filter-controls input[value='Search']").on("click", function(){
            var searchTerm = $("#searchInfo").val();

            me.renderSiteContent("", "search", searchTerm);
        });

        $("#searchForm input").keypress(function (e) {
            if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
                $("#cstudio-wcm-search-filter-controls input[value='Search']").click();
                return false;
            } else {
                return true;
            }
        });

        //results related events

        // $resultsContainer.on('change', 'input[name=result-select]', function(){
        //     var contentTO = $(this.parentElement.parentElement).data("item");
        //
        //     me.validateSelections();
        //
        //     if ($(this).prop("type") === "radio") { // just select one if its radio button
        //         CStudioAuthoring.SelectedContent.clear();
        //     }
        //
        //     if($(this).is(":checked")){
        //         CStudioAuthoring.SelectedContent.selectContent(contentTO);
        //     }else{
        //         CStudioAuthoring.SelectedContent.unselectContent(contentTO);
        //     }
        // });

        $('#cstudio-command-controls').on('click', '#formCancelButton', function(){
            window.close();
            $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove();
        });

        // $('#cstudio-command-controls').on('click', '#colExpButtonBtn', function(){
        //
        //
        //     if (top !== window) {
        //         $(window.frameElement.parentElement).closest('.studio-ice-dialog').height(60);
        //     }
        // })


        $('.cstudio-wcm-result .results').delegate( ".add-link-btn", "click", function() {
            var contentTO = $(this.parentElement).closest(".cstudio-search-result").data("item");
            CStudioAuthoring.SelectedContent.selectContent(contentTO);
            me.saveContent();
        });

        $('.cstudio-wcm-result .results').delegate( ".clone-btn", "click", function() {
            var contentTO = $(this.parentElement).closest(".cstudio-search-result").data("item"),
                studioPath = CStudioAuthoring.Utils.getQueryParameterByName("studioPath"),
                repoId = CStudioAuthoring.Utils.getQueryParameterByName("repoId"),
                site = CStudioAuthoring.Utils.getQueryParameterByName("site"),
                path = contentTO.browserUri,
                paramsJson = {"site_id" : site, "cmis_repo_id" : repoId, "cmis_path" : path, "studio_path" : studioPath};
            var callbackContent = {
                success: function(response) {
                    contentTO.clone = true;
                    CStudioAuthoring.SelectedContent.selectContent(contentTO);
                    me.saveContent();
                },
                failure: function(response){
                    var error = JSON.parse(response.responseText)
                    CStudioAuthoring.Operations.showSimpleDialog(
                        "error-dialog",
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(browseLangBundle, "notification"),
                        error.message,
                        null,
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        "studioDialog"
                    );
                }
            }
            CStudioAuthoring.Service.contentCloneCMIS(paramsJson, callbackContent);
        });

        $('.cstudio-wcm-result .results').delegate( ".magnify-icon", "click", function() {
            var path = $(this).attr('data-source');
            var type = $(this).attr('data-type');
            me.magnify(path, type);
        });

        var pathURL = CStudioAuthoring.Utils.getQueryParameterByName("path");
        pathURL = pathURL.slice(-1)=="/" ? pathURL.substring(0, pathURL.length - 1) : pathURL;
        var pathLabel = pathURL.replace(/\//g, " / ");
        $(".current-folder .path").html(pathLabel);

        $(".tabs .tab-links a").on("click", function (e) {
            var currentAttrValue = jQuery(this).attr("href");

            // Show/Hide Tabs
            $(".tabs " + currentAttrValue).show().siblings().hide();

            // Change/remove current tab to active
            $(this).parent("li").addClass("active").siblings().removeClass("active");

            e.preventDefault();
        });
    };

    CStudioBrowseCMIS.renderSiteFolders = function(items){

        var me = this;

        //Removes jstree cached state from localStorage
        localStorage.removeItem('jstree');
        //Tree - default closed
        $.jstree.defaults.core.expand_selected_onload = false;
        $('#data').jstree({
            'core' : {
                'check_callback': true,
                'data' : function (node, cb) {
                    var data = me.parseObjToFolders(items);
                    cb(data);
                }
            },
            "types" : {
                "default" : {
                    "icon" : "status-icon folder"
                }
            },
            "plugins" : [
                "state", "types"
            ]
        });
    };

    CStudioBrowseCMIS.parseObjToFolders = function(items){
        var path = CStudioAuthoring.Utils.getQueryParameterByName("path");
        path = path.slice(-1)=="/" ? path.substring(0, path.length - 1) : path;
        var parsed = {
                id: "cmis-root",
                text: path.includes("/") ?
                      path.split("/")[path.split("/").length - 1] : path ,
                state: {
                    opened : true,
                    selected: storage.read( "cmis-browse-path" ) ? false : true
                },
                a_attr: {
                    "data-path": "cmis-root"
                },
                children: []
            },
            object;

        $.each(items.items, function(index, value){
            if( "folder" === value.mime_type ){
                object = {
                    id: value.item_id,
                    text: value.item_name,
                    a_attr: {
                        "data-path": value.item_path
                    }
                };

                parsed.children.push(object);
            }
        });

        return parsed;
    };

    CStudioBrowseCMIS.parseItemObj = function(item) {
        var parsed = {
            itemId: item.item_id,
            selectMode: "",
            status: "",
            internalName: item.item_name,
            type: item.mime_type,
            browserUri: item.item_path,
            mimeType: item.mime_type
        };

        return parsed;
    };

    CStudioBrowseCMIS.renderSiteContent = function(path, type, searchTerm){
        var me = this,
            type = type ? type : "browse",
            $resultsContainer = "browse" === type ? $('#cstudio-wcm-browse-result .results') : $('#cstudio-wcm-search-result .results'),
            $resultsActions = "browse" === type ? $('#cstudio-wcm-browse-result .cstudio-results-actions') : $('#cstudio-wcm-search-result .cstudio-results-actions');


        $resultsContainer.empty();
        $resultsActions.empty();

        $resultsContainer.html('<span class="cstudio-spinner"></span>' + CMgs.format(browseLangBundle, "loading") + '...');

        if("cmis-root" === path && this.rootItems) {      //root - we already have the items

            var filesPresent = false,
                items = this.rootItems.items;

            $resultsContainer.empty();
            $resultsActions.empty();

            if(this.rootItems.total > 0){
                var $resultsWrapper = $('<div class="results-wrapper"/>');
                $resultsContainer.prepend($resultsWrapper);

                $.each(items, function(index, value){
                    if("folder" != value.mime_type){
                        me.renderItem(me.parseItemObj(value), $resultsWrapper, repoPath);
                        filesPresent = true;
                    }
                });

                if(!filesPresent){
                    me.renderNoItems();
                }
            }else{
                me.renderNoItems();
            }

        }else{

            this.getContent(type, {
                success: function(response) {
                    var filesPresent = false,
                        items = response.items;

                    $resultsContainer.empty();
                    $resultsActions.empty();

                    if(response.total > 0){
                        var $resultsWrapper = $('<div class="results-wrapper"/>');
                        $resultsContainer.prepend($resultsWrapper);

                        $.each(items, function(index, value){
                            if("folder" != value.mime_type){
                                me.renderItem(me.parseItemObj(value), $resultsWrapper, repoPath);
                                filesPresent = true;
                            }
                        });

                        if(!filesPresent){
                            me.renderNoItems(type);
                        }
                    }else{
                        me.renderNoItems(type);
                    }
                },
                failure: function() {

                }
            },path, searchTerm);

        }
    };

    CStudioBrowseCMIS.renderNoItems = function(type) {
        var $resultsContainer,
            msj;

        if("search" === type){
            $resultsContainer = $('#cstudio-wcm-search-result .results');
            msj = CMgs.format(browseLangBundle, 'noSearchResults');
        }else{
            $resultsContainer = $('#cstudio-wcm-browse-result .results');
            msj = CMgs.format(browseLangBundle, 'noBrowseResults');
        }

        $resultsContainer.append('<p style="text-align: center; font-weight: bold; display: block;">' + msj + '</p>');
    };

    CStudioBrowseCMIS.getContent = function(type, cb, cPath, searchTerm) {
        var pathURL = CStudioAuthoring.Utils.getQueryParameterByName("path"),
            path = cPath ? cPath : pathURL.slice(-1)=="/" ? pathURL.substring(0, pathURL.length - 1) : pathURL,
            repoId = CStudioAuthoring.Utils.getQueryParameterByName("repoId"),
            site = CStudioAuthoring.Utils.getQueryParameterByName("site");


        var callbackContent = {
            success: function(response) {
                cb.success(response);
            },
            failure: function(response){
                var message = (CMgs.format(browseLangBundle, "" + response.status + ""));
                var error = JSON.parse(response.responseText)
                
                message += "</br></br><div id='errorCode' style='display: none; padding-left: 26px; width: calc(100% - 26px);'>" + error.message + "</div>";

                message += "<div style='margin-left: 26px;'><a style='color: #4F81A0;' href='#' data-open='false' class='show-more-toggle'>Show More" + 
                "<i class='fa fa-chevron-right' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>";

                CStudioAuthoring.Operations.showSimpleDialog(
                    "error-dialog",
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    CMgs.format(browseLangBundle, "notification"),
                    message,
                    null,
                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                    "studioDialog"
                );

                $("#error-dialog").on("click", ".show-more-toggle", function(){
                    var code = $("#errorCode"),
                        toggle = $(".show-more-toggle");

                    if(!("true" === toggle.attr("data-open"))){
                        toggle.attr("data-open", true);
                        toggle.html("Show Less <i class='fa fa-chevron-left' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>");

                        code.show();
                    }else{
                        toggle.attr("data-open", false);
                        toggle.html("Show More <i class='fa fa-chevron-right' aria-hidden='true' style='font-size: 10px;margin-left: 5px;'></i></span></div>");

                        code.hide();
                    }
                });
            }
        }

        if(type === "browse"){
            CStudioAuthoring.Service.getCMISContentByBrowser(site, repoId, path, callbackContent);
        }else{
            if(!searchTerm || "" === searchTerm){       //TODO: ask if this is correct
                searchTerm = "*";
            }

            CStudioAuthoring.Service.getCMISContentBySearch(site, repoId, path, searchTerm, callbackContent);
        }


    };

    CStudioBrowseCMIS.getConfig= function(callback){
        CStudioAuthoring.Service.getConfiguration(
            CStudioAuthoringContext.site,
            "/data-sources/cmis-config.xml",
            {
                success: function(config) {
                    callback(config.repositories.repository);
                }
            });
    },


    window.CStudioBrowseCMIS = CStudioBrowseCMIS;

}) (window, jQuery, Handlebars);