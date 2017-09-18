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
        each = CStudioAuthoring.Utils.each,
        genDependency;
        $ = jQuery;

    Base.extend('Approve', {

        events: ['submitStart','submitComplete','submitEnd'],
        actions: ['.close-button', '.submit-button', '.select-all-check'],
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

        initDatePicker: initDatePicker,

        getGenDependency: getGenDependency

    });

    function getGenDependency() {
        return genDependency;
    }

    function closeButtonClicked() {
        $(document).off("keyup");
        this.end();
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

    }

    function loadItems(data) {
        var me = this,
        data = CStudioAuthoring.Utils.createContentItemsJson(data),
        callback = {
            success: function(oResponse) {
                var respJson = oResponse.responseText;
                try {
                    var dependencies = eval("(" + respJson + ")");
                    genDependency = dependencies.dependencies;
                    var submissionCommentElem = me.getComponent('.submission-comment');
                    submissionCommentElem.value = dependencies.submissionComment + ' ' + submissionCommentElem.value;
                    //var scheduledDate = this.getTimeInJsonObject(dependencies.items, browserUri);
                    me.renderItems(dependencies.items);
                    //enable submit button after loading items
                    $("#approveSubmit").prop('disabled', false);
                    verifyMixedSchedules(dependencies.items);

                } catch(err) {
                    var error = err;
                }/*
                 var responseData = {
                 submissionComment: 'Blah',
                 items: [
                 { internalName: 'Home', uri: '/site/website/index.xml', scheduleDateString: 'Now' },
                 { internalName: 'Home', uri: '/site/website/index.xml', scheduleDateString: '2015-02-02 5:50pm' }
                 ]
                 };

                 var submissionCommentElem = me.getComponent('.submission-comment');
                 submissionCommentElem.value = responseData.submissionComment + ' ' + submissionCommentElem.value;

                 me.renderItems(responseData.items);*/
            },
            failure: function(oResponse) {

            }
        };

        CStudioAuthoring.Service.loadItems(callback, data);
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
/*
            if (children.length > 0) {
                allHaveSameDate = traverse(children, referenceDate);
            }

*/
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
                this.$('#approveSubmit').prop('disabled', false);
                this.$('#approveSubmitVal').hide();

                this.$('.date-picker-control').show();
                this.$('input.date-picker')[0].value = getScheduledDateTimeFromJson(reference);
            }
        } else {
            this.$('[name="schedulingMode"]')[0].checked = false;
            this.$('[name="schedulingMode"]')[1].checked = true;

            this.$('.date-picker-control').show();
        }


    }


    function loadPublishingChannels() {
        var me = this,
            callback = {
                success: function (oResponse) {
                    var respJson = oResponse.responseText;
                    var allChannels = eval("(" + respJson + ")");
                    var channels = allChannels.availablePublishChannels;
                    /*
                     var respJson = oResponse.responseText;
                     try {
                     var dependencies = eval("(" + respJson + ")");
                     var submissionCommentElem = me.getComponent('.submission-comment');
                     submissionCommentElem.value = dependencies.submissionComment + ' ' + submissionCommentElem.value;
                     me.renderItems(dependencies.items);

                     } catch(err) {
                     var error = err;
                     }/*
                     var responseData = {
                     submissionComment: 'Blah',
                     items: [
                     { internalName: 'Home', uri: '/site/website/index.xml', scheduleDateString: 'Now' },
                     { internalName: 'Home', uri: '/site/website/index.xml', scheduleDateString: '2015-02-02 5:50pm' }
                     ]
                     };

                     var submissionCommentElem = me.getComponent('.submission-comment');
                     submissionCommentElem.value = responseData.submissionComment + ' ' + submissionCommentElem.value;

                     me.renderItems(responseData.items);*/
                    populatePublishingOptions.call(me, channels);
                },
                failure: function (oResponse) {

                }
            };
        CStudioAuthoring.Service.getAvailablePublishingChannels(callback);
    }

    function renderItems(items) {

        var html = [],
            me = this,
            submit = submit;
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
            
            var data = "[ { uri:\"" +  item.uri + "\" }]";

            CStudioAuthoring.Service.loadItems({
                success: function(response){
                    var item = JSON.parse(response.responseText);

                    $.each(item.dependencies, function(index, dependency){
                        var elem = {};
                        elem.uri = dependency;
                        elem.internalName = '';
                        elem.scheduledDate = '';
                        elem.index = itemDependenciesClass;
                        $parentRow.after(agent.get('SUBITEM_ROW', elem));
                    });
                }
            }, data);

        });

        $('.toggleDependencies').on('click', function(){
            var $container = $(me.getComponent('tbody')),
                parentId = $(this).attr('id'),
                $childItems = $container.find("." + parentId);

            if($(this).attr('class') == "ttClose parent-div-widget"){
                $childItems.hide();
                $(this).attr('class', 'ttOpen parent-div-widget');
            }else{
                $childItems.show();
                $(this).attr('class', 'ttClose parent-div-widget');
            }
        })

        $(document).on("keyup", function(e) {
            if (e.keyCode === 27) {	// esc
                $('.date-picker').datetimepicker('hide');
                me.end();
                $(document).off("keyup");
            }
            if (e.keyCode == 10 || e.keyCode == 13) {	// enter
                var $approveBtn = $("#approveSubmit")

                if(!$approveBtn.attr("disabled")) {
                    $approveBtn.click();
                    $(document).off("keyup");
                }
            }
        });

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