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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;
var CMgs = CStudioAuthoring.Messages;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.UploadS3Dialog = CStudioAuthoring.Dialogs.UploadS3Dialog || {
  formatMessage: CrafterCMSNext.i18n.intl.formatMessage,
  messages: CrafterCMSNext.i18n.messages.words,

  /**
   * initialize module
   */
  initialize: function(config) {},

  /**
   * show dialog
   */
  showDialog: function(site, path, profileId, serviceUri, callback, params) {
    this._self = this;

    this.site = site;
    this.path = path;
    this.profile = profileId;
    this.asPopup = true;
    this.serviceUri = serviceUri;
    this.fileTypes = params && params.fileTypes ? params.fileTypes : null;
    this.callback = callback;
    this.uploadingFile = false;
    this.dialog = this.createDialog(path, site, profileId, serviceUri, params);
    this.dialog.show();
    document.getElementById('cstudio-wcm-popup-div_h').style.display = 'none';

    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      var getFormSizeVal = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
      var setFormSizeVal = typeof setFormSize === 'function' ? setFormSize : parent.setFormSize;
      var formSize = getFormSizeVal(id);
      if (formSize < 320) {
        setFormSizeVal(320, id);
        $($('.studio-ice-container-' + id, parent.document)[0]).attr('data-decrease', true);
      }
    }
  },

  /**
   * hide dialog
   */
  closeDialog: function() {
    this.dialog.destroy();
  },

  /**
   * create dialog
   */
  createDialog: function(path, site, profileId, serviceUri, params) {
    var me = this,
      langBundle = CMgs.getBundle('dialogs', CStudioAuthoringContext.lang);
    YDom.removeClass('cstudio-wcm-popup-div', 'yui-pe-content');

    var newdiv = YDom.get('cstudio-wcm-popup-div');
    if (newdiv == undefined) {
      newdiv = document.createElement('div');
      document.body.appendChild(newdiv);
    }

    var divIdName = 'cstudio-wcm-popup-div';
    newdiv.setAttribute('id', divIdName);
    newdiv.className = 'yui-pe-content';
    newdiv.innerHTML =
      '<div class="contentTypePopupInner" id="upload-popup-inner">' +
      '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      '<div class="contentTypePopupHeader">' +
      CMgs.format(langBundle, 'upload') +
      '</div> ' +
      '<div><form id="asset_upload_form">' +
      '<div class="contentTypeOuter">' +
      '<div id="uploadContainer"></div>' +
      '<div><table>' +
      '<tr id="asset_upload-hidden"></tr>' +
      '</table></div>' +
      '</div>' +
      '<div class="contentTypePopupBtn"> ' +
      '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="' +
      CMgs.format(langBundle, 'cancelBtn') +
      '"  /></div>' +
      '</form></div>' +
      '<div><div  style="visibility:hidden; margin-bottom:1.5em;" id="indicator">' +
      CMgs.format(langBundle, 'uploading') +
      '...</div>' +
      '</div> ' +
      '</div>';

    if (params && params.transcode) {
      document.getElementById('asset_upload-hidden').innerHTML =
        '<td><input type="hidden" name="siteId" value="' +
        site +
        '"/></td>' +
        '<td><input type="hidden" name="inputProfileId" value="' +
        profileId.inputProfileId +
        '"/></td>' +
        '<td><input type="hidden" name="outputProfileId" value="' +
        profileId.outputProfileId +
        '"/></td>';
    } else {
      document.getElementById('asset_upload-hidden').innerHTML =
        '<td><input type="hidden" name="siteId" value="' +
        site +
        '"/></td>' +
        '<td><input type="hidden" name="path" value="' +
        path +
        '"/></td>' +
        '<td><input type="hidden" name="profileId" value="' +
        profileId +
        '"/></td>';
    }

    document.getElementById('upload-popup-inner').style.width = '350px';
    document.getElementById('upload-popup-inner').style.height = '180px';

    // Instantiate the Dialog
    upload_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '410px',
      height: '255px',
      effect: {
        effect: YAHOO.widget.ContainerEffect.FADE,
        duration: 0.25
      },
      fixedcenter: true,
      visible: false,
      modal: true,
      close: false,
      constraintoviewport: true,
      underlay: 'none'
    });

    // Render the Dialog
    upload_dialog.render();

    var eventParams = {
      self: this
    };

    YAHOO.util.Event.addListener('uploadCancelButton', 'click', this.uploadPopupCancel);

    $('body').on('keyup', '#cstudio-wcm-popup-div', function(e) {
      if (e.keyCode === 27 && !me.uploadingFile) {
        // esc
        me.closeDialog();
        $('#cstudio-wcm-popup-div').off('keyup');
      }
    });

    var url = CStudioAuthoring.Service.createServiceUri(serviceUri);
    url += '&' + CStudioAuthoringContext.xsrfParameterName + '=' + CrafterCMSNext.util.auth.getRequestForgeryToken();

    CrafterCMSNext.render(document.getElementById('uploadContainer'), 'SingleFileUpload', {
      formTarget: '#asset_upload_form',
      url: url,
      fileTypes: me.fileTypes,
      onUploadStart: function() {
        me.uploadingFile = true;
        $('#uploadCancelButton').attr('disabled', true);
      },
      onComplete: function(result) {
        let item = result.successful[0].response.body.item,
          uploaded = item.url ? item.url : item; // Will return only url

        $('#uploadCancelButton').attr('disabled', false);
        me.uploadingFile = false;

        me.callback.success(uploaded);
        CStudioAuthoring.Dialogs.UploadS3Dialog.closeDialog();
      },
      onError: function(file, error, response) {
        const res = response.body.response,
          errorMsg = `${res.message}. ${res.remedialAction}`;

        me.uploadingFile = false;
        $('#uploadCancelButton').attr('disabled', false);

        CStudioAuthoring.Operations.showSimpleDialog(
          'uploadErrorDialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          me.formatMessage(me.messages.notification),
          errorMsg,
          [
            {
              text: 'OK',
              handler: function() {
                this.destroy();
                callback.failure(response);
              },
              isDefault: false
            }
          ],
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog',
          null,
          100104
        );
      }
    });

    return upload_dialog;
  },

  /**
   * event fired when the ok is pressed
   */
  uploadPopupCancel: function(event) {
    CStudioAuthoring.Dialogs.UploadS3Dialog.closeDialog();
    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      if (
        $('#ice-body').length > 0 &&
        $($('.studio-ice-container-' + id, parent.document)[0]).height() > 212 &&
        $($('.studio-ice-container-' + id, parent.document)[0]).attr('data-decrease')
      ) {
        $($('.studio-ice-container-' + id, parent.document)[0]).height(212);
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('upload-S3-dialog', CStudioAuthoring.Dialogs.UploadS3Dialog);
