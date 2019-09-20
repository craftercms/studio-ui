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
        isValidateCommentOn = false;

    Base.extend('RequestPublish', {

        actions: ['.close-button', '.submit-button'],

        //startup: ['initDatePicker'],

        initApprove: initApprove,

        renderItems: renderItems,

        loadPublishingChannels: loadPublishingChannels,

        populatePublishingOptions: populatePublishingOptions,

        submitButtonActionClicked: submit,

        closeButtonActionClicked: closeButtonClicked,

        initDatePicker: initDatePicker,

        initValidation: initValidation,

        getGenDependency: getGenDependency

    });

    function getGenDependency(callback) {
        calculateDependencies(currentItems, callback);
    }

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
            items: this.result
        };

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
        var loadSpinnerMask = document.getElementById('loadSpinnerMask');

        //this.showProcessingOverlay(true);
        this.disableActions();
        this.fire("submitStart");
        loadSpinner.classList.remove("hidden");
        loadSpinnerMask.classList.remove("hidden");
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
                    loadSpinnerMask.classList.add("hidden");

                    if(currentItems.length > 1){
                        var oldItems = [];
                        for(var i = 0; i < currentItems.length; i++ ){
                            oldItems[currentItems[i].browserUri.replace(/\//g, '')] = currentItems[i].uri;
                        }
                        eventNS.oldPath = oldItems;
                    }else{
                        eventNS.oldPath = currentItems[0].uri;
                    }
                    var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
                    if(CStudioAuthoringContext.isPreview){
                        try{
                            var currentContentTO,
                                URLBrowseUri = pageParameter,
                                contentTOBrowseUri = currentItems[0].browserUri;

                            if (URLBrowseUri === contentTOBrowseUri){
                                currentContentTO = null;
                            } else{
                                currentContentTO = currentItems[0];
                            }

                            if(currentContentTO.isPage){
                                CStudioAuthoring.Operations.refreshPreview(currentContentTO);
                            }else{
                                CStudioAuthoring.Operations.refreshPreview();
                            }
                        }catch(err) {}
                    }

                    eventNS.data = currentItems;
                    eventNS.typeAction = "publish";
                    _this.getGenDependency({
                        success: function(response) {
                          var dependenciesObj = JSON.parse(response.responseText).entities,
                              dependencies = [];

                          $.each(dependenciesObj, function(){
                            $.each(this.dependencies, function(){
                              dependencies.push(this.item);
                            });
                          });
                          
                          var allDeps = dependencies.concat(_this.result ? _this.result : []);
                          dependencies = allDeps.filter(function (item, pos) {return allDeps.indexOf(item) == pos}); 

                          eventNS.dependencies = dependencies;
                          document.dispatchEvent(eventNS);
                          eventNS.dependencies = null;
                        }
                      });
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

    function calculateDependencies(data, callback) {
        var entities = { "entities": [] };

        if (typeof data === 'string' || data instanceof String) {
            entities.entities.push({ "item": data });
        } else {
            $.each(data, function () {
                entities.entities.push({ "item": this.uri });
            });
        }

        CStudioAuthoring.Service.calculateDependencies(JSON.stringify(entities), callback);
    }

    function renderItems(items) {
        var me = this;
        document.getElementById('loadSpinner').classList.add("hidden");
        this.result = [];
        CrafterCMSNext
            .render(
                this.getComponent('.dependencies-display'), 
                'DependencySelection', 
                { 
                    onChange: (result) => {
                        if (result.length > 0 
                            && ((isValidateCommentOn && me.getComponent('.submission-comment').value !== '') || !isValidateCommentOn) 
                            && ((me.$('[name="schedulingMode"]:checked').val() !== 'now' && me.$('.date-picker').val() !== '') || 
                            me.$('[name="schedulingMode"]:checked').val() === 'now')) {
                                me.$('#approveSubmit').prop('disabled', false);
                        } else {
                            me.$('#approveSubmit').prop('disabled', true);
                        }
                        me.result = result;
                    },
                    siteId: CStudioAuthoringContext.site,
                    items: items
                }
             );
        console.log('(*)'+isValidateCommentOn);
        if(isValidateCommentOn){
            this.$('#approveDialogSubmissionComment').append(" (*)");
        }

        $("#approveSubmit").prop('disabled', false);
        currentItems = items;

        $(document).on("keyup", function(e) {
            if (e.keyCode === 27) {	// esc
                me.closeButtonActionClicked();
                $(document).off("keyup");
            }
        });
    }

    function initApprove(callback) {
        var me =  this;

        CStudioAuthoring.Service.getConfiguration(
            CStudioAuthoringContext.site,
            "/site-config.xml",
            {
                success: function(config) {
                    isValidateCommentOn = config["submission-settings"] ? 
                        (config["submission-settings"]["comment-required"] === "true" ? true : false) 
                        : false;
                    console.log(isValidateCommentOn);
                    me.initDatePicker();
                    me.initValidation();
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
                    if(callback){
                        callback();
                    }
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
                me.$('#approveSubmitVal').hide;
                if((isValidateCommentOn && me.getComponent('.submission-comment').value !== '' || !isValidateCommentOn) && me.result.length > 0 ){
                    me.$('#approveSubmit').prop('disabled', false); 
                 }
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
                if((isValidateCommentOn && me.getComponent('.submission-comment').value !== '' || !isValidateCommentOn) && me.result.length > 0 ){
                    me.$('#approveSubmit').prop('disabled', false); 
                 }
                me.$('#approveSubmitVal').hide();
            }else{
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

    }

    function initValidation() {
        var self = this;
        this.$('.submission-comment').focusout(function () {
            if(isValidateCommentOn && $(this).get(0).value === ""){
                self.$('#submissionCommentVal').show();
                self.$('#approveSubmit').prop('disabled', true);
            }else{
                self.$('#submissionCommentVal').hide();
                if((self.result.length > 0) && ((self.$('[name="schedulingMode"]:checked').val() !== 'now' && self.$('.date-picker').val() !== '') || 
                self.$('[name="schedulingMode"]:checked').val() === 'now')){
                    self.$('#approveSubmit').prop('disabled', false);
                }
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