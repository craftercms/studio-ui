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
 * File: request-publish.js
 * Component ID: viewcontroller-requestpublish
 * @author: Roy Art
 * @date: 2015.04.15
 **/
(function(CStudioAuthoring){

    var Base = CStudioAuthoring.ViewController.Base,
        $ = jQuery,
        currentItems,
        tpl = [
            '<tr>',
            '<td class="small">' +
                '<input type="checkbox" class="select-all-check" data-item-id="_URI_" checked/>' +
            '</td> ' +
            '<td class="large">' +
                '<div class="in"> ' +
                    '<span id="_INDEX_" class="toggleDependencies ttOpen parent-div-widget" style="margin-right:17px; margin-bottom: -2px; float: left;" ' +
                    'data-loaded="false" data-path="_PATH_"></span>' + 
                    '<span style="overflow:hidden; display: block;">_INTERNALNAME_ _URI_</span>' +
                '</div>' +
            '</td>' +
            ' <td class="medium">_SCHEDULE_</td> ' +
            '</tr>'].join(),
        depTpl = [
            '<tr class="_INDEX_" style="display:none;">',
                '<td style="width:5%;"></td>',
                // '<td class="text-center small" style="padding-left: 25px;width: 1%;"><input type="checkbox" class="item-checkbox" data-item-id="{uri}" checked/></td>', //TODO: checkbox to remove dependencies publish
                '<td class="text-center small" style="padding-left: 25px;width: 5%;"></td>',
                '<td class="name large"><div class="in">_URI_</div></div></td>',
            '</tr>'
        ].join();


    Base.extend('RequestPublish', {

        actions: ['.close-button', '.submit-button', '.show-all-deps'],

        startup: ['initDatePicker'],

        renderItems: renderItems,

        loadPublishingChannels: loadPublishingChannels,

        populatePublishingOptions: populatePublishingOptions,

        submitButtonActionClicked: submit,

        closeButtonActionClicked: closeButtonClicked,

        showAllDepsActionClicked: showAllDeps,

        initDatePicker: initDatePicker

    });


    function closeButtonClicked() {
        $(document).off("keyup");
        $('.date-picker').datetimepicker('hide');
        this.end();
    }

    function populatePublishingOptions(items) {
        var select = this.getComponent('.publish-option');
        for (var i = 0, option; i < items.length; ++i) {
            option = new Option(items[i].name, items[i].name);
            select.options[i] = option;
        }
    }

    function loadPublishingChannels() {
        var me = this,
            callback = {
                success: function (oResponse) {
                    var respJson = oResponse.responseText;
                    var allChannels = eval("(" + respJson + ")");
                    var channels = allChannels.availablePublishChannels;
                    populatePublishingOptions.call(me, channels);
                },
                failure: function (oResponse) {

                }
            };
        CStudioAuthoring.Service.getAvailablePublishingChannels(callback);
    }

    function submit() {
        var data = {
            sendEmail: this.getComponent('[name="notifyApproval"]').checked,
            schedule: this.getComponent('[name="schedulingMode"]:checked').value,
            submissionComment: this.getComponent('.submission-comment').value,
            environment: this.getComponent('.publish-option').value,
            items: []
        };

        var checked = this.getComponents('tbody input[type="checkbox"]:checked');
        $.each(checked, function (i, check) {
            data.items.push(check.getAttribute('data-item-id'));
        });

        if (data.schedule === 'custom') {
            data.scheduledDate =  getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);

            function pad(number, length){
                var str = "" + number
                while (str.length < length) {
                    str = '0'+str
                }
                return str
            }

            var offset = $("select.zone-picker").find(':selected').attr('data-offset');
            data.scheduledDate += offset;

        }

        var loadSpinner = document.getElementById('loadSpinner');

        //this.showProcessingOverlay(true);
        this.disableActions();
        this.fire("submitStart");
        loadSpinner.classList.remove("hidden");
        //var data = this.getData(),
        var _this = this;
        CStudioAuthoring.Service.request({
            method: "POST",
            data: JSON.stringify(data),
            resetFormState: true,
            url: CStudioAuthoringContext.baseUri + "/api/1/services/api/1/workflow/submit-to-go-live.json?site="+CStudioAuthoringContext.site+"&user="+CStudioAuthoringContext.user,
            callback: {
                success: function(oResponse) {
                    _this.enableActions();
                    var oResp = JSON.parse(oResponse.responseText);
                    _this.fire("submitComplete", oResp);
                    _this.fire("submitEnd", oResp);
                    loadSpinner.classList.add("hidden");

                    eventNS.oldPath = currentItems.uri;
                    var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
                    if(CStudioAuthoringContext.isPreview){
                        try{
                            var currentContentTO,
                                URLBrowseUri = pageParameter,
                                contentTOBrowseUri = currentItems.browserUri;

                            if (URLBrowseUri == contentTOBrowseUri){
                                currentContentTO = null;
                            } else{
                                currentContentTO = currentItems;
                            }

                            if(currentContentTO.isPage){
                                CStudioAuthoring.Operations.refreshPreview(currentContentTO);
                            }else{
                                CStudioAuthoring.Operations.refreshPreview();
                            }
                        }catch(err) {}
                    }

                    eventNS.data = currentItems;
                    eventNS.typeAction = "edit";
                    document.dispatchEvent(eventNS);
                    _this.end();
                },
                failure: function(oResponse) {
                    var oResp = JSON.parse(oResponse.responseText);
                    _this.fire("submitEnd", oResp);
                    _this.enableActions();
                    eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
                    eventNS.typeAction = "edit";
                    document.dispatchEvent(eventNS);
                }
            }
        });
    }

    function calculateDependencies(data, callback){
        var entities = { "entities" : [] }; 

        if( typeof data === 'string' || data instanceof String ){
            entities.entities.push({ "item": data });
        }

        CStudioAuthoring.Service.calculateDependencies(JSON.stringify(entities), callback);
    }

    function showAllDeps(el) {
        var me = this,
            $el = $(el),
            loadSpinner = document.getElementById('loadSpinner');

        var entities = { "entities" : [] },
            callback = {
                success: function(response) {
                    var response = eval("(" + response.responseText + ")")
                    $.each(response.entities, function(){
                        var currentItem = this.item,
                            $currentEl = $("[data-path='" + this.item + "']"),
                            currentElId = $currentEl.attr("id"),
                            $parentEl = $currentEl.closest("tr"),
                            $container = $(me.getComponent('tbody'));

                        if( $currentEl.attr("data-loaded") === "false" ){
                            $.each(this.dependencies, function(index, dependency){
                                var elem = {};
                                elem.uri = dependency.item;
                                elem.index = currentElId;
                                                                
                                $parentEl.after(depTpl
                                    .replace('_INDEX_', elem.index)
                                    .replace('_URI_', elem.uri));
                            }); 

                            $currentEl.attr("data-loaded", "true");
                        }

                        $childItems = $container.find("." + currentElId);
                        $childItems.show();
                        $currentEl.attr('class', 'ttClose parent-div-widget');

                        loadSpinner.classList.add("hidden");
                        $el.removeAttr('disabled');

                    });
                },
                failure: function(error) {
                    
                }
            };

        $el.attr('disabled', 'true');
        loadSpinner.classList.remove("hidden");

        $.each( this.submitItems, function(){
            entities.entities.push({ "item": this.uri });
        })

        CStudioAuthoring.Service.calculateDependencies(JSON.stringify(entities), callback);
    }

    function renderItems(items) {
        currentItems = items[0];
        var me = this,
            loadSpinner = document.getElementById('loadSpinner'),
            $container = this.$('.item-listing tbody');

        me.submitItems = items;

        loadSpinner.classList.add("hidden");
        $.each(items, function (index, item) {
            var itemDependenciesClass = "toggle-deps-" + index,
                $parentRow;

            item.index = itemDependenciesClass;
            $parentRow = $(tpl
                .replace('_INDEX_', item.index)
                .replace('_URI_', item.uri)
                .replace('_PATH_', item.uri)
                .replace('_INTERNALNAME_', item.internalName)
                .replace('_SCHEDULE_', item.scheduledDate ? item.scheduledDate : "")
                .replace('_URI_', item.uri));

            if(index == 0) $container.empty();
            $container.append($parentRow);

        });

        //enable submit button after loading items
        $("#approveSubmit").prop('disabled', false);

        $('.toggleDependencies').on('click', function(){
            var $currentEl = $(this),
                $container = $(me.getComponent('tbody')),
                parentId = $currentEl.attr('id'),
                $childItems = $container.find("." + parentId);

            if($currentEl.attr('class') == "ttClose parent-div-widget"){
                $childItems.hide();
                $currentEl.attr('class', 'ttOpen parent-div-widget');
            }else{
                //If no deps data has been loaded - load
                if( $currentEl.attr("data-loaded") === "false"){
                    $currentEl.attr("data-loaded", "true");
                    
                    var callback = {
                        success: function(response) {
                            var response = eval("(" + response.responseText + ")")

                            $.each(response.entities, function(){
                                var currentElId = $currentEl.attr("id"),
                                    $parentEl = $currentEl.closest("tr");
        
                                $.each(this.dependencies, function(index, dependency){
                                    var elem = {};
                                    elem.uri = dependency.item;
                                    elem.index = currentElId;
                                    
                                    $parentEl.after(depTpl
                                        .replace('_INDEX_', elem.index)
                                        .replace('_URI_', elem.uri));
                                });                            
                            });
                            $childItems = $container.find("." + parentId);

                            $childItems.show();
                            $currentEl.attr('class', 'ttClose parent-div-widget');
                        },
                        failure: function(error) {
                            
                        }
                    };

                    calculateDependencies($currentEl.attr("data-path"), callback);
                }else{
                    $childItems.show();
                    $currentEl.attr('class', 'ttClose parent-div-widget');
                }
            }
        })

        $(document).on("keyup", function(e) {
            if (e.keyCode === 27) {	// esc
                me.closeButtonActionClicked();
                $(document).off("keyup");
            }
        });
    }

    function initDatePicker() {

        var me = this;
        var dateToday = new Date();
        var logic = function( currentDateTime, input ){
            // 'this' is jquery object datetimepicker
            if(currentDateTime && currentDateTime.getDate() == dateToday.getDate()
                && currentDateTime.getMonth() == dateToday.getMonth()
                && currentDateTime.getFullYear() == dateToday.getFullYear()){
                this.setOptions({
                    minTime: 0
                });
            }else {
                this.setOptions({
                    minTime:'12:00 am'
                });
            }
        };

        me.$('[name="schedulingMode"]').change(function () {
            var $elem = $(this);
            if ($elem.val() === 'now') {
                me.$('.date-picker-control').hide();
                me.$('.date-picker').val('');
                me.$('#approveSubmit').prop('disabled', false);
                me.$('#approveSubmitVal').hide;
            } else {
                me.$('.date-picker-control').show();
                me.$('.date-picker').select();
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

        me.$('.date-picker').datetimepicker({
            format: 'm/d/Y h:i a',
            dateFormat: "m/d/Y",
            formatTime:	'h:i a',
            minDate: '0',
            minTime: 0,
            step: 15,
            onChangeDateTime: logic
        });

        me.$('.date-picker').change(function () {
            var $elem = $(this);
            if ($elem.val() !=null && $elem.val() != "") {
                me.$('#approveSubmit').prop('disabled', false);
                me.$('#approveSubmitVal').hide();
            }else{
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

        CStudioAuthoring.Service.getConfiguration(
            CStudioAuthoringContext.site,
            "/site-config.xml",
            {
                success: function(config) {
                    var timeZoneText = me.$('.zone-text');
                    timeZoneText.html("<a class='zone-link'>"+config["default-timezone"] + "</a>");
                    $( '<select class="zone-picker form-control"></select>' ).insertAfter( timeZoneText );
                    var zonePicker = $('.zone-picker');
                    zonePicker.timezones();
                    zonePicker.hide();
                    $("select.zone-picker option[value='"+config["default-timezone"]+"']").attr("selected", "selected");
                    me.$('.zone-link').click(function() {
                        zonePicker.show();
                    });
                    zonePicker.change(function() {
                        me.$('.zone-link').html($(this).val());
                    });
                }
            });

    }

    function getScheduledDateTimeForJson(dateTimeValue) {
        var schedDate = new Date(dateTimeValue);
        var schedDateMonth = schedDate.getMonth() + 1;
        var scheduledDate = schedDate.getFullYear() + '-';
        if (schedDateMonth < 10) scheduledDate = scheduledDate + '0';
        scheduledDate = scheduledDate + schedDateMonth + '-';
        if (schedDate.getDate() < 10) scheduledDate = scheduledDate + '0';
        scheduledDate = scheduledDate + schedDate.getDate() + 'T';
        if (schedDate.getHours() < 10) scheduledDate = scheduledDate + '0';
        scheduledDate = scheduledDate + schedDate.getHours() + ':';
        if (schedDate.getMinutes() < 10) scheduledDate = scheduledDate + '0';
        scheduledDate = scheduledDate + schedDate.getMinutes() + ':';
        if (schedDate.getSeconds() < 10) scheduledDate = scheduledDate + '0';
        scheduledDate = scheduledDate + schedDate.getSeconds();

        return scheduledDate;
    }

}) (CStudioAuthoring);