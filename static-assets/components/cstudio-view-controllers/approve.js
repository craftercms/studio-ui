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
 * File: approve.js
 * Component ID: viewcontroller-approve
 * @author: Roy Art
 * @date: 12.09.2014
 **/
(function (CStudioAuthoring) {

    var Base = CStudioAuthoring.ViewController.Base,
        Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        each = CStudioAuthoring.Utils.each,
        genDependency = [],
        $ = jQuery;

    Base.extend('Approve', {

        events: ['submitStart', 'submitComplete', 'submitEnd'],
        actions: ['.close-button', '.submit-button'],

        loadItems: loadItems,

        startup: ['initDatePicker'],

        loadPublishingChannels: loadPublishingChannels,

        renderItems: renderItems,

        populatePublishingOptions: populatePublishingOptions,

        submitButtonActionClicked: submit,

        closeButtonActionClicked: closeButtonClicked,

        initDatePicker: initDatePicker,

        getGenDependency: getGenDependency

    });

    function getGenDependency(callback) {
        calculateDependencies(this.submitItems, callback);
    }

    function closeButtonClicked() {
        $(document).off("keyup");
        this.end();
    }

    function submit() {

        var data = {
            schedule: this.getComponent('[name="schedulingMode"]:checked').value,
            submissionComment: this.getComponent('.submission-comment').value,
            publishOptionComment: (this.getComponent('.publish-option-comment')) ? this.getComponent('.publish-option-comment').value : "",
            publishChannel: this.getComponent('.publish-option').value,
            items: this.result
        };

        var timezone = $("select.zone-picker").find(':selected').attr('data-offset');

        if (data.schedule === 'custom') {
            data.scheduledDate = getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);
            data.scheduledDate += timezone;
        }

        var loadSpinner = document.getElementById('loadSpinner');
        var loadSpinnerMask = document.getElementById('loadSpinnerMask');
        //this.showProcessingOverlay(true);
        this.disableActions();
        loadSpinner.classList.remove("hidden");
        loadSpinnerMask.classList.remove("hidden");
        this.fire("submitStart");
        //var data = this.getData(),
        var _this = this,
            data = JSON.stringify(data),
            callback = {
                success: function (oResponse) {
                    _this.enableActions();
                    var oResp = JSON.parse(oResponse.responseText);
                    oResp.deps = _this.result;
                    _this.fire("submitComplete", oResp);
                    _this.fire("submitEnd", oResp);
                    loadSpinner.classList.add("hidden");
                    loadSpinnerMask.classList.add("hidden");
                },
                failure: function (oResponse) {
                    var oResp = JSON.parse(oResponse.responseText);
                    _this.fire("submitEnd", oResp);
                    _this.enableActions();
                }
            };

        CStudioAuthoring.Service.getGoLive(callback, data);
    }

    function loadItems(data) {
        var me = this;

        var loadSpinner = document.getElementById('loadSpinner');
        var flag = true;

        var items = data;
        loadSpinner.classList.add("hidden");
        me.submitItems = items;
        me.renderItems(items);
        $("#approveSubmit").prop('disabled', false);
        verifyMixedSchedules(items);

    }

    function traverse(items, referenceDate) {
        var allHaveSameDate = true,
            item, children;

        for (var i = 0, l = items.length;
            allHaveSameDate === true && i < l;
            ++i) {

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
                this.$('#approveSubmit').prop('disabled', false);
                this.$('#approveSubmitVal').hide();

                this.$('.date-picker-control').show();
                this.$('input.date-picker')[0].value = CStudioAuthoring.Utils.formatDateFromUTC(reference, studioTimeZone, "medium");
            }
        } else {
            this.$('[name="schedulingMode"]')[0].checked = false;
            this.$('[name="schedulingMode"]')[1].checked = true;

            this.$('#differentRequestedDatesWarning').show();
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
                    populatePublishingOptions.call(me, channels);
                },
                failure: function (oResponse) {

                }
            };
        CStudioAuthoring.Service.getAvailablePublishingChannels(callback);
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
        this.result = [];
        CrafterCMSNext
            .render(
                this.getComponent('.dependencies-display'),
                'DependencySelection',
                {
                    onChange: (result) => {
                        if (result.length === 0) {
                            this.$('#approveSubmit').prop('disabled', true);
                        } else {
                            this.$('#approveSubmit').prop('disabled', false);
                        }
                        this.result = result;
                    },
                    siteId: CStudioAuthoringContext.site,
                    items: items
                }
            );

        $(document).on("keyup", function (e) {
            if (e.keyCode === 27) {	// esc
                $('.date-picker').datetimepicker('hide');
                me.end();
                $(document).off("keyup");
            }
            if (e.keyCode == 10 || e.keyCode == 13) {	// enter
                var $approveBtn = $("#approveSubmit")

                if (!$approveBtn.attr("disabled")) {
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
        var logic = function (currentDateTime, input) {
            // 'this' is jquery object datetimepicker
            if (currentDateTime && currentDateTime.getDate() == dateToday.getDate()
                && currentDateTime.getMonth() == dateToday.getMonth()
                && currentDateTime.getFullYear() == dateToday.getFullYear()) {
                this.setOptions({
                    minTime: 0
                });
            } else {
                this.setOptions({
                    minTime: '12:00 am'
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
            formatTime: 'h:i a',
            minDate: '0',
            minTime: 0,
            step: 15,
            onChangeDateTime: logic

        });

        me.$('.date-picker').change(function () {
            var $elem = $(this);
            if ($elem.val() != null && $elem.val() != "") {
                me.$('#approveSubmit').prop('disabled', false);
                me.$('#approveSubmitVal').hide();
            } else {
                me.$('#approveSubmit').prop('disabled', true);
                me.$('#approveSubmitVal').show();
            }
        });

        CStudioAuthoring.Service.getConfiguration(
            CStudioAuthoringContext.site,
            "/site-config.xml",
            {
                success: function (config) {
                    var timeZoneText = me.$('.zone-text');
                    timeZoneText.html("<a class='zone-link' title='Time zone can be changed through the Site Config -> Configuration -> Site Configuration'>" + config["default-timezone"] + "</a>");
                    $('<select class="zone-picker form-control"></select>').insertAfter(timeZoneText);
                    var zonePicker = $('.zone-picker');
                    zonePicker.timezones();
                    zonePicker.hide();
                    $("select.zone-picker option[value='" + config["default-timezone"] + "']").attr("selected", "selected");
                    me.$('.zone-link').click(function () {
                        zonePicker.show();
                    });
                    zonePicker.change(function () {
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
        var dateTime = new Date(dateTokens[0], dateTokens[1] - 1, dateTokens[2], timeTokens[0], timeTokens[1]);

        var hrs = ((dateTime.getHours() % 12) ? dateTime.getHours() % 12 : 12);
        var mnts = dateTime.getMinutes();

        return '' + dateTokens[1] + '/' + dateTokens[2] + '/' + dateTokens[0] + ' '
            + (hrs < 10 ? '0' + hrs : hrs) + ':' + (mnts < 10 ? '0' + mnts : mnts) + (dateTime.getHours() < 12 ? ' am' : ' pm');
    }

})(CStudioAuthoring);
