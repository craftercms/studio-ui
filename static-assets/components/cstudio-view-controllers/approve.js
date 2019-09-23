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

  var
    Base = CStudioAuthoring.ViewController.Base,
    Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event,
    each = CStudioAuthoring.Utils.each,
    genDependency = [],
    $ = jQuery,
    isValidateCommentOn = null;

  Base.extend('Approve', {

    events: ['submitStart', 'submitComplete', 'submitEnd'],
    
    actions: ['.close-button', '.submit-button'],

    loadItems: loadItems,

    startup: ['fetchPublishingSettings', 'initDatePicker', 'initValidation', 'translateUI'],

    loadPublishingChannels: loadPublishingChannels,

    renderItems: renderItems,

    populatePublishingOptions: populatePublishingOptions,

    submitButtonActionClicked: submit,

    closeButtonActionClicked: closeButtonClicked,

    initDatePicker: initDatePicker,

    fetchPublishingSettings,

    initValidation,

    publishValidation,
    
    translateUI,

    getGenDependency: getGenDependency

  });

})(CStudioAuthoring);

function submit() {

    var data = {
      schedule: this.getComponent('[name="schedulingMode"]:checked').value,
      submissionComment: this.getComponent('.submission-comment').value,
      publishOptionComment: (this.getComponent('.publish-option-comment')) ? this.getComponent('.publish-option-comment').value : '',
      publishChannel: this.getComponent('.publish-option').value,
      items: this.result
    };
  
    var timezone = $('select.zone-picker').find(':selected').attr('data-offset');
  
    if (data.schedule === 'custom') {
      data.scheduledDate = getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);
      data.scheduledDate += timezone;
    }
  
    var loadSpinner = document.getElementById('loadSpinner');
    var loadSpinnerMask = document.getElementById('loadSpinnerMask');
  
    this.disableActions();
    loadSpinner.classList.remove('hidden');
    loadSpinnerMask.classList.remove('hidden');
    this.fire('submitStart');
  
    var _this = this,
      data = JSON.stringify(data),
      callback = {
        success: function (oResponse) {
          _this.enableActions();
          var oResp = JSON.parse(oResponse.responseText);
          oResp.deps = _this.result;
          _this.fire('submitComplete', oResp);
          _this.fire('submitEnd', oResp);
          loadSpinner.classList.add('hidden');
          loadSpinnerMask.classList.add('hidden');
        },
        failure: function (oResponse) {
          var oResp = JSON.parse(oResponse.responseText);
          _this.fire('submitEnd', oResp);
          _this.enableActions();
        }
      };
  
    CStudioAuthoring.Service.getGoLive(callback, data);
  }
