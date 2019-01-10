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

/**
 * File: history.js
 * Component ID: viewcontroller-history
 * @author: Roy Art
 * @date: 03.01.2011
 **/
(function () {

    var History,
        Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,

        TemplateAgent = CStudioAuthoring.Component.TemplateAgent,
        template = CStudioAuthoring.TemplateHolder.History;

    CStudioAuthoring.register('ViewController.History', function () {
        CStudioAuthoring.ViewController.History.superclass.constructor.apply(this, arguments);
    });

    History = CStudioAuthoring.ViewController.History;
    YAHOO.extend(History, CStudioAuthoring.ViewController.Base, {

        events: ['wipeAndRevert', 'view', 'restore', 'compare', 'revert', 'wipeRecent'],

        actions: ['.close-button', '.compare-button'],

        loadHistory: function (selection) {
            var _this = this,
                colspan = 5,
                loadFn,
                escaped = selection.escaped;

            _this.selection = selection;

            loadFn = function () {

                var tbody = _this.getComponent('table.item-listing tbody');
                tbody.innerHTML = '<tr><td colspan="5"><i>'+CMgs.format(formsLangBundle, "historyDialogLoadingWait")+'&hellip;</i></td></tr>';

                CStudioAuthoring.Service.getVersionHistory(
                    CStudioAuthoringContext.site,
                    selection, {
                        success: function (history) {

                            var versions = history.versions,
                                contentType = history.item.contentType;

                            var itemStateEl = _this.getComponent('span.show-for-item');
                            Dom.addClass(itemStateEl, CStudioAuthoring.Utils.getIconFWClasses(history.item));
                            itemStateEl.innerHTML = history.item.internalName;

                            if (versions.length == 0) {
                                tbody.innerHTML = '<tr><td colspan="5"><i>'+CMgs.format(formsLangBundle, "historyDialogNoVersionsFound")+'</i></td></tr>';
                            } else {

                                tbody.innerHTML = '';

                                if(contentType != "asset"){
                                    var actionWrapper = _this.getComponent(".history-view .action-wrapper"),
                                        compareButton = document.createElement('input');
                                    $('#historyCompareBtn').remove();
                                    compareButton.type = "button";
                                    Dom.addClass(compareButton, "compare-button btn btn-default");
                                    compareButton.value=CMgs.format(formsLangBundle, "historyDialogCompare"); 
                                    compareButton.setAttribute("disabled", "");
                                    compareButton.setAttribute("id", "historyCompareBtn");
                                    actionWrapper.appendChild(compareButton);

                                    (function () {
                                        Event.addListener(compareButton, "click", function () {
                                            // CStudioAuthoring.Operations.openDiff(CStudioAuthoringContext.site, this.path, this.version, this.version);
                                            _this.compareButtonActionClicked();
                                        });
                                    })();
                                }

                                for (var i = 0; i < versions.length; i++) {

                                    var version = versions[i],
                                        rowEl = document.createElement("tr"),
                                        tdEl,
                                        col2El,
                                        col3El,
                                        col4El,
                                        col5El,
                                        col6El,
                                        revertActionEl,
                                        checkboxEl;

                                    col2El = document.createElement('div');
                                    Dom.addClass(col2El, "c8");

                                    col2El.innerHTML = CStudioAuthoring.Utils.formatDateFromUTC(version.lastModifiedDate, studioTimeZone, 'full');

                                    var versionNumber = new Date(version.lastModifiedDate);
                                    versionNumber = versionNumber.toLocaleDateString() + 'T' + versionNumber.toLocaleTimeString().replace(' ', '');

                                    if(contentType != "asset"){
                                        checkboxEl = document.createElement('input');
                                        checkboxEl.maxLength = 300;
                                        checkboxEl.type = "checkbox";
                                        checkboxEl.name = "version";
                                        checkboxEl.value = version.versionNumber;
                                        checkboxEl.style.marginRight = '5px';
                                        col2El.insertBefore(checkboxEl, col2El.firstChild);
                                    }

                                    tdEl = document.createElement('td');
                                    tdEl.appendChild(col2El);
                                    rowEl.appendChild(tdEl);

                                    col4El = document.createElement('div');
                                    Dom.addClass(col4El, "c4");
                                    col4El.innerHTML = version.lastModifier;
                                    tdEl = document.createElement('td');
                                    tdEl.appendChild(col4El);
                                    rowEl.appendChild(tdEl);

                                    col6El = document.createElement('div');
                                    // Dom.addClass(col6El, "c6");
                                    col6El.innerHTML = (version.comment) ? version.comment : "&nbsp;";
                                    tdEl = document.createElement('td');
                                    tdEl.appendChild(col6El);
                                    rowEl.appendChild(tdEl);

                                    col5El = document.createElement('div');
                                    col5El.style.whiteSpace = "nowrap";
                                    Dom.addClass(col5El, "c5");
                                    tdEl = document.createElement('td');
                                    tdEl.appendChild(col5El);
                                    rowEl.appendChild(tdEl);

                                    if(contentType != "asset"){
                                        var viewActionEl = document.createElement("a");
                                        viewActionEl.innerHTML = '<span id="actionView'+ version.versionNumber +'" class="action fa fa-eye"></span>';
                                        viewActionEl.version = version.versionNumber;
                                        viewActionEl.path = selection.uri;
                                        col5El.appendChild(viewActionEl);
                                        new YAHOO.widget.Tooltip("tooltipView" + viewActionEl.version, {
                                            context: "actionView" + viewActionEl.version,
                                            text: CMgs.format(formsLangBundle, "historyDialogViewFileMessage"),
                                            zIndex: 104103
                                        });

                                        var compareActionEl = document.createElement("a");
                                        compareActionEl.innerHTML = '<span id="actionCompare' + version.versionNumber + '" class="action fa fa-files-o"></span>';
                                        compareActionEl.version = version.versionNumber;
                                        compareActionEl.path = selection.uri;
                                        col5El.appendChild(compareActionEl);
                                        new YAHOO.widget.Tooltip("tooltipCompare" + compareActionEl.version, {
                                            context: "actionCompare" + viewActionEl.version,
                                            text: CMgs.format(formsLangBundle, "historyDialogCompareFileMessage"),
                                            zIndex: 104103
                                        });
                                    }

                                    revertActionEl = document.createElement("a");
                                    revertActionEl.innerHTML = '<span id="actionRevert' + version.versionNumber + '" class="action fa fa-reply"></span>';
                                    revertActionEl.item = selection;
                                    revertActionEl.version = version.versionNumber;
                                    new YAHOO.widget.Tooltip("tooltipRevert"+ revertActionEl.version, {
                                        context: "actionRevert" + revertActionEl.version,
                                        text: CMgs.format(formsLangBundle, "historyDialogRevertFileMessage"),
                                        zIndex: 104103
                                    });

                                    col5El.appendChild(revertActionEl);
                                    (function (item) {
                                        Event.addListener(revertActionEl, "click", function () {
                                            CStudioAuthoring.Service.revertContentItem(
                                                CStudioAuthoringContext.site,
                                                this.item,
                                                this.version, {
                                                    success: function () {
                                                        if(CStudioAuthoringContext.isPreview){
                                                            CStudioAuthoring.Operations.refreshPreview();
                                                        }
                                                        eventNS.data = item;
                                                        document.dispatchEvent(eventNS);
                                                        _this.loadHistory(_this.selection);
                                                    },
                                                    failure: function () {
                                                        var CMgs = CStudioAuthoring.Messages;
                                                        var langBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
                                                        CStudioAuthoring.Operations.showSimpleDialog(
                                                            "revertError-dialog",
                                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                                            CMgs.format(langBundle, "notification"),
                                                            CMgs.format(langBundle, "revertError"),
                                                            null,
                                                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                                            "studioDialog"
                                                        );
                                                    }
                                                });
                                        });

                                        Event.addListener(viewActionEl, "click", function () {
                                            CStudioAuthoring.Operations.openDiff(CStudioAuthoringContext.site, this.path, this.version, this.version, escaped);
                                        });

                                        Event.addListener(compareActionEl, "click", function () {
                                            CStudioAuthoring.Operations.openDiff(CStudioAuthoringContext.site, this.path, this.version, null, escaped);
                                        });

                                        Event.addListener(checkboxEl, "change", function () {
                                            _this.validateDiffCheckboxes();
                                        });

                                    })(history.item);

                                    tbody.appendChild(rowEl);

                                }
                            }
                            //set focus on submit/delete button
                            var oSubmitBtn = _this.getComponent(_this.actions[0]);

                            if (oSubmitBtn) {
                                CStudioAuthoring.Utils.setDefaultFocusOn(oSubmitBtn);
                            }
                        },
                        failure: function () {
                            tbody.innerHTML = '<tr><td>'+CMgs.format(formsLangBundle, "historyDialogUnable")+' <a class="retry-dependency-load" href="javascript:">'+CMgs.format(formsLangBundle, "historyDialogTryAgain")+'</a></td></tr>';
                            Event.addListener(_this.getComponent("a.retry-dependency-load"), "click", loadFn);
                        }
                    });
            };
            loadFn();

            $(document).on("keyup", function(e) {
                if (e.keyCode === 27) {	// esc
                    _this.end();
                    $(document).off("keyup");
                }
            });
        },

        preFormatDate: function(dateTime) {
            var inZulu = new RegExp("Z$").test(dateTime),
                convertedDate = dateTime;
            if(inZulu){
                var convertedTimezone = new Date(dateTime),
                    year = convertedTimezone.getFullYear(),
                    month = convertedTimezone.getMonth() + 1,
                    day = convertedTimezone.getDate(),
                    hours = convertedTimezone.getHours(),
                    minutes = convertedTimezone.getMinutes(),
                    minutes = minutes < 10 ? "0" + minutes : minutes,
                    seconds = convertedTimezone.getSeconds();

                convertedDate = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds;
            }
            return convertedDate;
        },
        
        validateDiffCheckboxes: function () {
            var tbody = this.getComponent('table.item-listing tbody'),
                selectedCheckboxes = $(tbody).find('input[name="version"]:checked'),
                unselectedCheckboxes = $(tbody).find('input[name="version"]:not(:checked)');

            if(selectedCheckboxes.length >= 2) {
                unselectedCheckboxes.prop('disabled', true);
            }else{
                unselectedCheckboxes.prop('disabled', false);
            }

            if(selectedCheckboxes.length == 2){
                $("#historyCompareBtn").prop('disabled', false);
            }else {
                $("#historyCompareBtn").prop('disabled', true);
            }
        },

        wipeRecentEdits: function () {
            this.fire("wipeRecent");
        },

        revertToLive: function () {
            this.fire("revert");
        },
        wipeAndRevert: function () {
            this.fire("wipeAndRevert");
        },
        view: function () {
            this.fire("view");
        },
        restore: function () {
            this.fire("restore");
        },
        compare: function () {
            this.fire("compare");
        },
        closeButtonActionClicked: function () {
            this.end();
            $(document).off("keyup");
        },
        compareButtonActionClicked: function () {
            var tbody = this.getComponent('table.item-listing tbody'),
                selectedCheckboxes = $(tbody).find('input[name="version"]:checked'),
                diffArray = [],
                path = this.selection.uri;

            $.each(selectedCheckboxes, function(index) {
                diffArray[index] = this.value;
            });


            CStudioAuthoring.Operations.openDiff(CStudioAuthoringContext.site, path,diffArray[0], diffArray[1]);
        }
    });

    CStudioAuthoring.Env.ModuleMap.map("viewcontroller-history", History);

})();
