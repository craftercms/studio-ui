/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
 * File: in-context-edit.js
 * Component ID: viewcontroller-in-context-edit
 * @author: Russ Danner
 * @date: 4.27.2011
 **/
(function () {
  var InContextEdit,
    Dom = YAHOO.util.Dom;

  CStudioAuthoring.register('ViewController.InContextEdit', function () {
    CStudioAuthoring.ViewController.InContextEdit.superclass.constructor.apply(this, arguments);
  });

  InContextEdit = CStudioAuthoring.ViewController.InContextEdit;
  YAHOO.extend(InContextEdit, CStudioAuthoring.ViewController.Base, {
    events: ['updateContent'],
    actions: ['.update-content', '.cancel'],

    initialise: function (usrCfg) {
      Dom.setStyle(this.cfg.getProperty('context'), 'overflow', 'visible');
    },

    close: function () {
      var editorId = this.editorId;
      var iframeEl = getTopLegacyWindow().document.getElementById('in-context-edit-editor-' + editorId);
      iframeEl.parentNode.parentNode.style.display = 'none';
    },

    /**
     * on initialization, go out and get the content and
     * populate the dialog.
     *
     * on error, display the issue and then close the dialog
     */
    initializeContent: function (item, field, site, isEdit, callback, $modal, aux, editorId, isFlattenedInclude) {
      var iframeEl = getTopLegacyWindow().document.getElementById('in-context-edit-editor-' + editorId);
      var dialogEl = document.getElementById('viewcontroller-in-context-edit-' + editorId + '_0_c');
      var dialogBodyEl = document.getElementById('viewcontroller-in-context-edit-' + editorId + '_0');
      aux = aux ? aux : {};

      CStudioAuthoring.Service.lookupContentType(CStudioAuthoringContext.site, item.contentType, {
        context: this,
        iframeEl: iframeEl,
        dialogEl: dialogEl,
        failure: crafter.noop,
        dialogBodyEl: dialogBodyEl,
        success: function (contentType) {
          var windowUrl = this.context.constructUrlWebFormSimpleEngine(
            contentType,
            item,
            field,
            site,
            isEdit,
            aux,
            editorId,
            isFlattenedInclude
          );

          this.iframeEl.src = windowUrl;
          this.context.editorId = editorId;
          CStudioAuthoring.InContextEdit.registerDialog(editorId, this.context);

          this.iframeEl.onload = function () {
            var body = this.contentDocument.body,
              html = $(body).parents('html').get(0),
              max;

            function resizeProcess() {
              max = Math.max(
                body.scrollHeight,
                html.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
              );

              if (max > $(getTopLegacyWindow()).height()) {
                max = $(getTopLegacyWindow()).height() - 100;
              }

              if (max > 350) {
                clearInterval(interval);
                $modal.height(max);
              }
            }

            var interval = setInterval(resizeProcess, 250);

            setTimeout(function () {
              clearInterval(interval);
            }, 2500);
          };
        }
      });
    },

    /**
     * get the content from the input and send it back to the server
     */
    updateContentActionClicked: function (buttonEl, evt) {
      // not used
    },

    /**
     * cancel the dialog
     */
    cancelActionClicked: function (buttonEl, evt) {
      // not used
    },

    /**
     * construct URL for simple form server
     */
    constructUrlWebFormSimpleEngine: function (
      contentType,
      item,
      field,
      site,
      isEdit,
      auxParams,
      editorId,
      isFlattenedInclude
    ) {
      var windowUrl = '';
      var formId = contentType.form;
      var readOnly = false;
      let parentPath = null;
      let canEdit = false;

      for (var j = 0; j < auxParams.length; j++) {
        if (auxParams[j].name == 'changeTemplate') {
          formId = auxParams[j].value;
        }

        if (auxParams[j].name == 'readonly') {
          readOnly = true;
        }

        if (auxParams[j].name == 'parentPath') {
          parentPath = auxParams[j].value;
        }

        if (auxParams[j].name == 'canEdit') {
          canEdit = auxParams[j].value;
        }
      }

      // double / can cause issues in some stores
      item.uri = item.uri.replace('//', '/');

      windowUrl =
        CStudioAuthoringContext.authoringAppBaseUri +
        '/form?site=' +
        site +
        '&form=' +
        formId +
        '&path=' +
        item.uri +
        '&isInclude=' +
        isFlattenedInclude;

      if (parentPath) {
        windowUrl += `&parentPath=${parentPath}`;
      }

      if (field) {
        if (typeof field === 'string') {
          windowUrl += '&iceId=' + field;
        } else {
          windowUrl += '&selectedFields=' + encodeURIComponent(JSON.stringify(field));
        }
      } else {
        windowUrl += '&iceComponent=true';
      }

      if (isEdit === true || isEdit === 'true') {
        windowUrl += '&edit=' + isEdit;
      }

      if (readOnly === true) {
        windowUrl += '&readonly=true';
      }

      if (canEdit === true) {
        windowUrl += '&canEdit=true';
      }

      windowUrl += '&editorId=' + editorId;

      return windowUrl;
    },

    /**
     * provide support for legacy form server
     */
    constructUrlWebFormLegacyFormServer: function (item, field, site) {
      var CMgs = CStudioAuthoring.Messages;
      var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
      CStudioAuthoring.Operations.showSimpleDialog(
        'legacyError-dialog',
        CStudioAuthoring.Operations.simpleDialogTypeINFO,
        CMgs.format(langBundle, 'notification'),
        CMgs.format(langBundle, 'legacyError'),
        null,
        YAHOO.widget.SimpleDialog.ICON_BLOCK,
        'studioDialog'
      );
    }
  });

  CStudioAuthoring.Env.ModuleMap.map('viewcontroller-in-context-edit', InContextEdit);
})();
