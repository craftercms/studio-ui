/**
 * File: approve.js
 * Component ID: viewcontroller-approve
 * @author: Roy Art
 * @date: 12.09.2014
 **/
(function(CStudioAuthoring){

    var Base = CStudioAuthoring.ViewController.Base,
        Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        agent = new CStudioAuthoring.TemplateHolder.TemplateAgent(CStudioAuthoring.TemplateHolder.Approve),
        each = CStudioAuthoring.Utils.each;
        $ = jQuery,
        isItemsLoaded = false,
        isChannelsLoaded = false;

    Base.extend('Approve', {

        events: ['submitStart','submitComplete','submitEnd'],
        actions: ['.close-button', '.submit-button', '.select-all-check', '.show-all-deps'],
        startup: ['itemsClickedDelegation'],

        itemsClickedDelegation: itemsClickedDelegation,

        loadItems: loadItems,

        startup: ['initDatePicker'],

        loadPublishingChannels: loadPublishingChannels,

        renderItems: renderItems,

        populatePublishingOptions: populatePublishingOptions,

        submitButtonActionClicked: submit,

        selectAllCheckActionClicked: selectAllItems,

        closeButtonActionClicked: closeButtonClicked,

        showAllDepsActionClicked: showAllDeps,

        initDatePicker: initDatePicker

    });

    function closeButtonClicked() {
        this.end();
        isItemsLoaded = false
        isChannelsLoaded = false;

    }

    function itemsClickedDelegation() {
        var me = this;
        Event.delegate(this.cfg.getProperty('context'), "click", function(e, elem) {

            var allCheck = me.getComponent('.select-all-check');

            if (!elem.checked) {
                allCheck.checked = false;
            } else {

                var allItemsChecked = true;
                var itemChecks = me.getComponents('input[data-item-id]');

                each(itemChecks, function (i, check) {
                    if (!check.checked) {
                        allItemsChecked = false;
                        return false;
                    }
                });

                allCheck.checked = allItemsChecked;

            }

        }, 'input.item-checkbox');
    }

    function selectAllItems(checkbox) {

        var items = this.getComponents('input[data-item-id][type="checkbox"]');
        var bool = checkbox.checked;

        each(items, function (i, check) {
            check.checked = bool;
        });
    }

    function submit() {

        var data = {
            schedule: this.getComponent('[name="schedulingMode"]:checked').value,
            submissionComment: this.getComponent('.submission-comment').value,
            publishOptionComment: (this.getComponent('.publish-option-comment')) ? this.getComponent('.publish-option-comment').value : "",
            publishChannel: this.getComponent('.publish-option').value,
            items: []
        };

        var checked = this.getComponents('tbody input[type="checkbox"]:checked');
        each(checked, function (i, check) {
            data.items.push(check.getAttribute('data-item-id'));
        });

        var timezone = $("select.zone-picker").find(':selected').attr('data-offset');

        if (data.schedule === 'custom') {
            data.scheduledDate =  getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);
            data.scheduledDate += timezone;
        }

        //this.showProcessingOverlay(true);
        this.disableActions();
        this.fire("submitStart");
        //var data = this.getData(),
        var _this = this,
        data = JSON.stringify(data),
        callback = {
            success: function(oResponse) {
                _this.enableActions();
                var oResp = JSON.parse(oResponse.responseText);
                _this.fire("submitComplete", oResp);
                _this.fire("submitEnd", oResp);
            },
            failure: function(oResponse) {
                var oResp = JSON.parse(oResponse.responseText);
                _this.fire("submitEnd", oResp);
                _this.enableActions();
            }
        };

        CStudioAuthoring.Service.getGoLive(callback, data);

        isItemsLoaded = false
        isChannelsLoaded = false;

    }

    function loadItems(data) {
        var me = this;
        
        // var loadSpinner = document.getElementById('loadSpinner');
        var flag = true;

        var items = data;
        // loadSpinner.classList.add("hidden");
        me.submitItems = items;
        me.renderItems(items);
        isItemsLoaded = true;
        if(isItemsLoaded && isChannelsLoaded){
            $("#approveSubmit").prop('disabled', false);
        }

        verifyMixedSchedules(items);
    }

    function traverse (items, referenceDate) {
        var allHaveSameDate = true,
            item, children;

        for ( var i = 0, l = items.length;
              allHaveSameDate === true && i < l;
              ++i ) {

            item = items[i];
            children = item.children;

            allHaveSameDate = (item.scheduledDate === referenceDate);

            if (!allHaveSameDate) {
                break;
            }
        }

        return allHaveSameDate;

    }
    function verifyMixedSchedules(contentItems) {

        var reference = contentItems[0].scheduledDate,
            allHaveSameDate = traverse(contentItems, reference);

        if (allHaveSameDate) {
            if ((reference === '' || reference === null) && !ApproveType) {
                //YDom.get('globalSetToNow').checked = true;
                this.$('[name="schedulingMode"]')[0].checked = true;
                this.$('[name="schedulingMode"]')[1].checked = false;
                this.$('.date-picker-control').hide();
                this.$('.date-picker-control').value = "";
            } else {
                this.$('[name="schedulingMode"]')[0].checked = false;
                this.$('[name="schedulingMode"]')[1].checked = true;
                this.$('#approveSubmit').prop('disabled', true);
                this.$('#approveSubmitVal').hide();

                this.$('.date-picker-control').show();
                this.$('input.date-picker')[0].value = getScheduledDateTimeFromJson(reference);
            }
        } else {
            this.$('[name="schedulingMode"]')[0].checked = false;
            this.$('[name="schedulingMode"]')[1].checked = true;
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
                    isChannelsLoaded = true;
                    if(isItemsLoaded && isChannelsLoaded){
                        $("#approveSubmit").prop('disabled', false);
                    }
                },
                failure: function (oResponse) {

                }
            };
        CStudioAuthoring.Service.getAvailablePublishingChannels(callback);
    }

    function calculateDependencies(data, callback){
        var entities = { "entities" : [] }; 

        if( typeof data === 'string' || data instanceof String ){
            entities.entities.push({ "item": data });
        }

        CStudioAuthoring.Service.calculateDependencies(JSON.stringify(entities), callback);
    }

    function showAllDeps () {
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
                                $parentEl.after(agent.get('SUBITEM_ROW', elem));
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

        var html = [],
            me = this,
            $container = $(this.getComponent('tbody'));

        each(items, function (index, item) {
            var temp = item.scheduledDate,
                itemDependenciesClass = "toggle-deps-" + index;

            item.scheduledDate = CStudioAuthoring.Utils.formatDateFromString(temp);
            item.index = itemDependenciesClass;
            var $parentRow = $(agent.get('ITEM_ROW', item));
            if(index == 0) $container.empty();
            $container.append($parentRow);
            item.scheduledDate = temp;
        });

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
                                    $parentEl.after(agent.get('SUBITEM_ROW', elem));
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

    function populatePublishingOptions(items) {
        var select = this.getComponent('.publish-option');
        for (var i = 0, option; i < items.length; ++i) {
            option = new Option(items[i].name, items[i].name);
            select.options[i] = option;
        }
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
                me.$('#approveSubmitVal').show;
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

    function getScheduledDateTimeFromJson(dateTimeStr) {
        var dateTimeTokens = dateTimeStr.split('T');
        var dateTokens = dateTimeTokens[0].split('-');
        var timeTokens = dateTimeTokens[1].split(':');
        var dateTime = new Date(dateTokens[0], dateTokens[1]-1, dateTokens[2], timeTokens[0], timeTokens[1]);

        var hrs = ((dateTime.getHours() %12) ? dateTime.getHours() % 12 : 12);
        var mnts = dateTime.getMinutes();

        return '' + dateTokens[1] + '/' + dateTokens[2] + '/' + dateTokens[0] + ' '
            + (hrs < 10 ? '0' + hrs : hrs) + ':' + (mnts < 10 ? '0' + mnts : mnts) + (dateTime.getHours() < 12 ? ' am' : ' pm');
    }

}) (CStudioAuthoring);