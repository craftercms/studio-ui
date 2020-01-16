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

function translateUI() {

  const
    i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    messages = i18n.messages.approveDialogMessages;

  // Imperative programmatic translation
  this.getComponent('.view-title').innerText = formatMessage(messages.approveForPublish);

  // Translate the whole UI via the codebase next utility
  i18n.translateElements(
    this.getComponents('[data-i18n]'),
    messages,
    {
      warning: (content) => {
        return `<em>${content.toUpperCase()}</em>`;
      }
    }
  );

}

function getGenDependency(callback, items) {
  calculateDependencies(items, callback);
}

function closeButtonClicked() {
  $(document).off('keyup');
  this.end();
}

function loadItems(data, dialogue) {
  var me = this;

  var loadSpinner = document.getElementById('loadSpinner');
  var flag = true;

  var items = data;
  loadSpinner.classList.add('hidden');
  me.renderItems(items);
  $('#approveSubmit').prop('disabled', false);
  verifyMixedSchedules(items);
  this.on("submitComplete", function(evt, args){
    submitComplete(items, dialogue, args);
  });

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
      this.$('.date-picker-control').value = '';
    } else {
      this.$('[name="schedulingMode"]')[0].checked = false;
      this.$('[name="schedulingMode"]')[1].checked = true;
      this.$('#approveSubmit').prop('disabled', false);
      this.$('#approveSubmitVal').hide();

      this.$('.date-picker-control').show();
      this.$('input.date-picker')[0].value = CStudioAuthoring.Utils.formatDateFromUTC(reference, studioTimeZone, 'medium');
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
        var allChannels = eval('(' + respJson + ')');
        var channels = allChannels.availablePublishChannels;
        populatePublishingOptions.call(me, channels);
      },
      failure: function (oResponse) {

      }
    };
  CStudioAuthoring.Service.getAvailablePublishingChannels(callback);
}

function calculateDependencies(data, callback) {
  var entities = { 'entities': [] };

  if (typeof data === 'string' || data instanceof String) {
    entities.entities.push({ 'item': data });
  } else {
    $.each(data, function () {
      entities.entities.push({ 'item': this.uri });
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
          this.result = result;
          this.publishValidation();
        },
        siteId: CStudioAuthoringContext.site,
        items: items
      }
    );

  CStudioAuthoring.Utils.removeLoadingIcon();
  const me = this;
  $(document).on('keyup', function (e) {
    if (e.keyCode === 27) {	// esc
      $('.date-picker').datetimepicker('hide');
      me.end();
      $(document).off('keyup');
    }
    if (e.keyCode == 10 || e.keyCode == 13) {	// enter
      var $approveBtn = $('#approveSubmit');
      if (!$approveBtn.attr('disabled')) {
        $approveBtn.click();
        $(document).off('keyup');
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

function fetchPublishingSettings() {
  var me = this;
  me.isValidateCommentOn = false;
  CStudioAuthoring.Service.getConfiguration(
    CStudioAuthoringContext.site,
    '/site-config.xml',
    {
      success: function (config) {
        var publishing = config['publishing'];
        me.isValidateCommentOn = publishing && publishing['comments'] ?
          (publishing['comments']['required'] === 'true' ? true : false)
          : false;
        if (me.isValidateCommentOn) {
          me.getComponent('.approveDialogSubmissionComment').append(' (*)');
        }
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
    me.publishValidation();
    if ($elem.val() === 'now') {
      me.$('.date-picker-control').hide();
      me.$('.date-picker').val('');
      me.$('#approveSubmitVal').hide;
    } else {
      me.$('.date-picker-control').show();
      me.$('.date-picker').select();
      me.$('#approveSubmitVal').show;
    }
  });

  me.$('.date-picker').datetimepicker({
    format: 'm/d/Y h:i a',
    dateFormat: 'm/d/Y',
    formatTime: 'h:i a',
    minDate: '0',
    minTime: 0,
    step: 15,
    onChangeDateTime: logic

  });

  me.$('.date-picker').change(function () {
    var $elem = $(this);
    me.publishValidation();
    if ($elem.val() != null && $elem.val() != '') {
      me.$('#approveSubmitVal').hide();
    } else {
      me.$('#approveSubmitVal').show();
    }
  });

}

function publishValidation() {
  const me = this;

  if ((me.result && me.result.length > 0)
    && ((me.isValidateCommentOn && me.getComponent('.submission-comment').value !== '') || !me.isValidateCommentOn)
    && ((me.$('[name="schedulingMode"]:checked').val() !== 'now' && me.$('.date-picker').val() !== '') ||
      me.$('[name="schedulingMode"]:checked').val() === 'now')) {
    me.$('#approveSubmit').prop('disabled', false);
  } else {
    me.$('#approveSubmit').prop('disabled', true);
  }
}

function initValidation() {
  const me = this,
    submissionCommentVal = this.getComponent('.submissionCommentVal');

  this.publishValidation();
  this.$('.submission-comment').focusout(function () {
    if (me.isValidateCommentOn && $(this).get(0).value === '') {
      submissionCommentVal.classList.remove('hide');
    } else {
      submissionCommentVal.classList.contains('hide') === false
        ? submissionCommentVal.classList.add('hide')
        : null;
    }
    me.publishValidation();
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

function submitComplete(items, dialogue, args){
  var self = this;
  if(items.length > 1){
      var oldItems = [];
      for(var i = 0; i < items.length; i++ ){
          oldItems[items[i].browserUri.replace(/\//g, '')] = items[i].uri;
      }
      eventNS.oldPath = oldItems;
  }else{
      eventNS.oldPath = items[0].uri;
  }
  var pageParameter = CStudioAuthoring.Utils.getQueryParameterURL("page");
  if(CStudioAuthoringContext.isPreview){
      try{
          var currentContentTO,
              URLBrowseUri = pageParameter,
              contentTOBrowseUri = items[0].browserUri;

          if (URLBrowseUri === contentTOBrowseUri){
              currentContentTO = null;
          } else{
              currentContentTO = items[0];
          }
          if(currentContentTO && currentContentTO.isPage){
              CStudioAuthoring.Operations.refreshPreview(currentContentTO);
          }
      }catch(error) {
        console.error(error.message);
      }
  }else{ // clear only while on dashboard
    CStudioAuthoring.SelectedContent.clear(); // clear selected contents after publish
  }

  dialogue.destroy();
  eventNS.data = items;
  eventNS.typeAction = "publish";
  self.getGenDependency({
    success: function(response) {
      var dependenciesObj = JSON.parse(response.responseText).entities,
          dependencies = [];

      $.each(dependenciesObj, function(){
        $.each(this.dependencies, function(){
          dependencies.push(this.item);
        });
      });

      var allDeps = dependencies.concat(args[0].deps ? args[0].deps : []);
      dependencies = allDeps.filter(function (item, pos) {
        return allDeps.indexOf(item) == pos;
      });

      eventNS.dependencies = dependencies;
      document.dispatchEvent(eventNS);
      eventNS.dependencies = null;
    }
  }, items);

}

CStudioAuthoring.Env.ModuleMap.map("publish-util", {
  loadItems,
  closeButtonClicked,
  getGenDependency,
  translateUI,
  verifyMixedSchedules,
  loadPublishingChannels,
  calculateDependencies,
  renderItems,
  populatePublishingOptions,
  fetchPublishingSettings,
  initDatePicker,
  publishValidation,
  initValidation,
  getScheduledDateTimeForJson,
  traverse,
  getScheduledDateTimeFromJson
});
