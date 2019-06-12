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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Branded Logo Plugin
 */
CStudioAuthoring.ContextualNav.WcmQuickCreate = CStudioAuthoring.ContextualNav.WcmQuickCreate || {

    initialized: false,

    /**
     * initialize module
     */
    initialize: function(config) {
        YAHOO.util.Event.onAvailable("quick-create", function() {
            CStudioAuthoring.Service.getQuickCreate( {
                success: function (response) {
                    var dropdown = $('#quick-create');
                    var quickCreateWrapper = $('.dropdown.quick-create');
                    var createCb = {
                        success: function(contentTO, editorId, name, value, draft) {
                            var page =  CStudioAuthoring.Utils.getQueryParameterURL("page");
                            var acnDraftContent = YDom.getElementsByClassName("acnDraftContent", null, parent.document)[0];
                            eventYS.data = contentTO.item;
                            eventYS.typeAction = "createContent";
                            eventYS.oldPath = null;
                            eventYS.parent = contentTO.item.path === "/site/website" ? null : false;
                            document.dispatchEvent(eventYS);

                            if(contentTO.item.isPage){
                                CStudioAuthoring.Operations.refreshPreview(contentTO.item);
                                if(page == contentTO.item.browserUri && acnDraftContent){
                                    CStudioAuthoring.SelectedContent.setContent(contentTO.item);
                                }
                            }else{
                                CStudioAuthoring.Operations.refreshPreview();
                            }
                        },
                        failure: function() { },
                        callingWindow: window
                    };
                    if (response.length > 0 && (CStudioAuthoringContext.isPreview || CStudioAuthoringContext.isDashboard)) {
                        $(quickCreateWrapper).removeClass('hide');
                        for (var i = 0; i < response.length; i++) {
                            (function (item) {
                                dropdown.append(
                                    $('<li>').append(
                                        $('<a>').append(response[i].label).click(function () {
                                            CStudioAuthoring.Operations.openContentWebForm(
                                                item.contentTypeId,
                                                null,
                                                null,
                                                CStudioAuthoring.Operations.processPathsForMacros(item.path, null, true),
                                                false,
                                                false,
                                                createCb,
                                                null
                                            );
                                        })
                                    ));
                            })(response[i]);
                        }
                    }
                },
                failure: function() {

                }
            });

        }, this);
    }
}

CStudioAuthoring.Module.moduleLoaded("quick-create", CStudioAuthoring.ContextualNav.WcmQuickCreate);