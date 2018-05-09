/**
 * File: request-publish.js
 * Component ID: viewcontroller-requestpublish
 * @author: Roy Art
 * @date: 2015.04.15
 **/
(function(CStudioAuthoring){

    var Base = CStudioAuthoring.ViewController.Base,
        $ = jQuery,
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

        submitButtonActionClicked: submit,

        closeButtonActionClicked: closeButtonClicked,
        
        showAllDepsActionClicked: showAllDeps,

        initDatePicker: initDatePicker

    });


    function closeButtonClicked() {
        this.end();
    }

    function submit() {
        var data = {
            sendEmail: this.getComponent('[name="notifyApproval"]').checked,
            schedule: this.getComponent('[name="schedulingMode"]:checked').value,
            submissionComment: this.getComponent('.submission-comment').value,
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



        //this.showProcessingOverlay(true);
        this.disableActions();
        this.fire("submitStart");
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
                    eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
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

    function showAllDeps() {
        var me = this;

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

                    });
                },
                failure: function(error) {
                    
                }
            };

        $.each( this.submitItems, function(){
            entities.entities.push({ "item": this.uri });
        })

        CStudioAuthoring.Service.calculateDependencies(JSON.stringify(entities), callback);
    }

    function renderItems(items) {
        var me = this,
            $container = this.$('.item-listing tbody');

        me.submitItems = items;

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
        var scheduledDate = schedDate.getFullYear() + '-' + schedDateMonth + '-'
            + schedDate.getDate() + 'T' + schedDate.getHours() + ':'
            + schedDate.getMinutes() + ':' + schedDate.getSeconds();

        return scheduledDate;
    }

}) (CStudioAuthoring);