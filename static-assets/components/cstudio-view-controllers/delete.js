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
 * File: schedule-for-delete.js
 * Component ID: viewcontroller-delete
 * @author: Roy Art
 * @date: 05.01.2011
 **/
(function () {
  var Delete,
    Event = YAHOO.util.Event,
    Dom = YAHOO.util.Dom,
    JSON = YAHOO.lang.JSON,
    SUtils = CStudioAuthoring.StringUtils,
    eachfn = CStudioAuthoring.Utils.each,
    TemplateAgent = CStudioAuthoring.TemplateHolder.TemplateAgent,
    template = CStudioAuthoring.TemplateHolder.Delete;

  CStudioAuthoring.register('ViewController.Delete', function () {
    CStudioAuthoring.ViewController.Delete.superclass.constructor.apply(this, arguments);
  });

  Delete = CStudioAuthoring.ViewController.Delete;
  YAHOO.extend(Delete, CStudioAuthoring.ViewController.BaseDelete, {
    actions: ['.do-delete', '.overlay-close'],

    initialise: function (usrCfg) {
      Dom.setStyle(this.cfg.getProperty('context'), 'overflow', 'visible');
    },

    renderItems: function (items) {
      this.result = [];
      CrafterCMSNext.render(this.getComponent('.dependencies-display'), 'DependencySelectionDelete', {
        onChange: (result) => {
          this.result = result;
          this.deleteValidation();
        },
        siteId: CStudioAuthoringContext.site,
        items: items
      }).then(() => {
        this.getComponent('.delete-display').style.height = 'auto';
      });
    },

    getData: function () {
      return JSON.stringify({
        items: this.result
      });
    },

    afterSubmit: function (message, dataInf) {
      var agent = new TemplateAgent(template),
        body = agent.get('SUCCESS', {
          title: CMgs.format(formsLangBundle, 'deletedTitle'),
          msg: CMgs.format(formsLangBundle, 'deletedMessage')
        }),
        self = this;
      this.getComponent('.studio-view.admin-delete-view').innerHTML = body;
      (function (dataInf) {
        Event.addListener(
          self.getComponent('.action-complete-close1'),
          'click',
          function () {
            this.end();
            var data = JSON.parse(dataInf).items[0];
            var nodeName = data.split('/')[data.split('/').length - 2];
            CStudioAuthoring.Operations.pageReload('deleteSchedule', nodeName);
            if (CStudioAuthoringContext.isPreview) {
              if (data.indexOf('/website/') != -1) {
                CStudioAuthoring.PreviewTools.turnToolsOff();
              }
            }
          },
          null,
          self
        );
      })(dataInf);
      if (this.getComponent('.action-complete-close1')) {
        CStudioAuthoring.Utils.setDefaultFocusOn(this.getComponent('.action-complete-close1'));
      }
    },

    doDeleteActionClicked: function () {
      this.showProcessingOverlay(true);
      this.fire('submitStart');
      var data = `${this.result.map((i) => `${i}`).join(',')}`,
        _this = this;
      (function (dataInf) {
        CStudioAuthoring.Service.request({
          method: 'DELETE',
          resetFormState: true,
          url: CStudioAuthoring.Service.createServiceUri(
            '/api/2/content/delete.json' +
              '?&siteId=' +
              CStudioAuthoringContext.site +
              '&paths=' +
              encodeURIComponent(data) +
              '&submissionComment=' +
              _this.getComponent('.delete-submission-comment').value
          ),
          callback: {
            success: function (oResponse) {
              _this.showProcessingOverlay(false);
              _this.enableActions();
              var oResp = JSON.parse(oResponse.responseText);
              _this.afterSubmit(oResp.message, dataInf);
              _this.fire('submitEnd', oResp);
              _this.fire('submitComplete', oResp);
            },
            failure: function (oResponse) {
              _this.showProcessingOverlay(false);
              var oResp = JSON.parse(oResponse.responseText);
              _this.fire('submitEnd', oResp);
              _this.enableActions();
            }
          }
        });
      })(data);
    },
    overlayCloseActionClicked: function () {
      var o = this.overlay;
      o.hide();
    },

    showProcessingOverlay: function (show) {
      var elem = this.getComponent('.processing-overlay');
      if (elem) {
        elem.style.display = show ? '' : 'none';
      }
    }
  });

  CStudioAuthoring.Env.ModuleMap.map('viewcontroller-delete', Delete);
})();
