/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
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
(function (CStudioAuthoring) {
  var Base = CStudioAuthoring.ViewController.Base,
    publishUtil = CStudioAuthoring.Env.ModuleMap.get('publish-util'),
    $ = jQuery;

  Base.extend('RequestPublish', {
    events: ['submitStart', 'submitComplete', 'submitEnd'],

    actions: ['.close-button', '.submit-button'],

    startup: ['fetchPublishingSettings', 'loadPublishingChannels', 'initDatePicker', 'initValidation', 'translateUI'],

    loadItems: publishUtil.loadItems,

    renderItems: publishUtil.renderItems,

    loadPublishingChannels: publishUtil.loadPublishingChannels,

    populatePublishingOptions: publishUtil.populatePublishingOptions,

    submitButtonActionClicked: submit,

    closeButtonActionClicked: publishUtil.closeButtonClicked,

    initDatePicker: publishUtil.initDatePicker,

    fetchPublishingSettings: publishUtil.fetchPublishingSettings,

    initValidation: publishUtil.initValidation,

    publishValidation: publishUtil.publishValidation,

    translateUI: publishUtil.translateUI,

    getGenDependency: publishUtil.getGenDependency
  });

  function submit() {
    var data = {
      sendEmail: this.getComponent('[name="notifyApproval"]').checked,
      schedule: this.getComponent('[name="schedulingMode"]:checked').value,
      submissionComment: this.getComponent('.submission-comment').value,
      environment: this.getComponent('.publish-option').value,
      items: this.result
    };

    var timezone = $('select.zone-picker').find(':selected').attr('data-offset');

    if (data.schedule === 'custom') {
      data.scheduledDate = getScheduledDateTimeForJson(this.getComponent('[name="scheduleDate"]').value);
      data.scheduledDate += timezone;
    }

    var loadSpinner = document.getElementById('loadSpinner');
    var loadSpinnerMask = document.getElementById('loadSpinnerMask');

    //this.showProcessingOverlay(true);
    this.disableActions();
    this.fire('submitStart');
    loadSpinner.classList.remove('hidden');
    loadSpinnerMask.classList.remove('hidden');
    //var data = this.getData(),
    var _this = this;
    CStudioAuthoring.Service.request({
      method: 'POST',
      data: JSON.stringify(data),
      resetFormState: true,
      url:
        CStudioAuthoringContext.baseUri +
        '/api/1/services/api/1/workflow/submit-to-go-live.json?site=' +
        CStudioAuthoringContext.site +
        '&user=' +
        CStudioAuthoringContext.user,
      callback: {
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
      }
    });
  }
})(CStudioAuthoring);
