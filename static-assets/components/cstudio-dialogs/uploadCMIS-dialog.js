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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.UploadCMISDialog = CStudioAuthoring.Dialogs.UploadCMISDialog || {
  /**
   * initialize module
   */
  initialize: function (config) {},

  /**
   * show dialog
   */
  showDialog: function (site, path, repositoryId, serviceUri, callback) {
    this._self = this;
    console.log('dialog');

    this.dialog = this.createDialog(path, site, repositoryId, serviceUri);

    this.site = site;
    this.path = path;
    this.profile = repositoryId;
    this.asPopup = true;
    this.serviceUri = serviceUri;
    this.callback = callback;
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
  closeDialog: function () {
    this.dialog.destroy();
    $('#cstudio-wcm-popup-div').off('keyup');
  },

  /**
   * create dialog
   */
  createDialog: function (path, site, repositoryId, serviceUri) {
    var me = this;
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
      '<div class="contentTypePopupHeader">Upload</div> ' +
      '<div><form id="asset_upload_form">' +
      '<div class="contentTypeOuter">' +
      '<div class="formDesc">Please select a file to upload</div> ' +
      '<div><table><tr><td><input type="hidden" name="site_id" value="' +
      site +
      '"/></td>' +
      '<td><input type="hidden" name="cmis_path" value="' +
      path +
      '"/></td></tr>' +
      '<td><input type="hidden" name="cmis_repo_id" value="' +
      repositoryId +
      '"/></td></tr>' +
      '<tr><td>File:</td><td><input type="file" name="file" id="uploadFileNameId"/></td></tr>' +
      '</table></div>' +
      '</div>' +
      '<div class="contentTypePopupBtn"> ' +
      '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="uploadButton" value="Upload" disabled />' +
      '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="Cancel"  /></div>' +
      '</form></div>' +
      '<div><div  style="visibility:hidden; margin-bottom:1.5em;" id="indicator">Uploading...</div>' +
      '</div> ' +
      '</div>';

    // Instantiate the Dialog
    upload_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '360px',
      height: '242px',
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

    var filenameInput = document.getElementById('uploadFileNameId');
    YAHOO.util.Event.addListener(filenameInput, 'change', this.uploadFileEvent);

    var eventParams = {
      self: this
    };

    YAHOO.util.Event.addListener('uploadButton', 'click', this.uploadPopupSubmit, eventParams);
    YAHOO.util.Event.addListener('uploadCancelButton', 'click', this.uploadPopupCancel);

    $('body').on('keyup', '#cstudio-wcm-popup-div', function (e) {
      if (e.keyCode === 27) {
        // esc
        me.closeDialog();
      }
    });

    return upload_dialog;
  },

  /**
   * event fired when the uploadFileNameId is changed
   */
  uploadFileEvent: function (event) {
    var uploadButton = document.getElementById('uploadButton');
    if (this.value != '') {
      uploadButton.disabled = false;
    } else {
      uploadButton.disabled = true;
    }
  },

  /**
   * event fired when the ok is pressed - checks if the file already exists and has edit permission or not
   * by using the getPermissions Service call
   */
  uploadPopupSubmit: function (event, args) {
    var path = args.self.path;
    var filename = document.getElementById('uploadFileNameId').value.replace('C:\\fakepath\\', '');
    if (filename.split('\\').length > 1) {
      filename = filename.split('\\')[filename.split('\\').length - 1];
    }
    var basePath = path;
    path = basePath ? basePath + '/' + filename : filename;

    CStudioAuthoring.Dialogs.UploadCMISDialog.uploadFile(args);

    YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
  },

  /**
   * upload file when upload pressed
   */
  uploadFile: function (args) {
    var serviceUri = CStudioAuthoring.Service.createServiceUri(args.self.serviceUri);
    var form = $('#asset_upload_form')[0];
    var data = new FormData(form);

    serviceUri +=
      '&' + CStudioAuthoringContext.xsrfParameterName + '=' + CStudioAuthoring.Storage.getRequestForgeryToken();
    $.ajax({
      enctype: 'multipart/form-data',
      processData: false, // Important!
      contentType: false,
      cache: false,
      type: 'POST',
      url: serviceUri,
      data: data,
      success: function (item) {
        var r = eval('(' + item.responseText + ')');
        CStudioAuthoring.Dialogs.UploadCMISDialog.closeDialog();
        if (r.fileExtension) {
          r.fileExtension = r.fileExtension.substring(r.fileExtension.lastIndexOf('.') + 1);
        }
        args.self.callback.success(r);
      },
      error: function (err) {
        var r = eval('(' + err.responseText + ')');
        CStudioAuthoring.Dialogs.UploadCMISDialog.closeDialog();
        CStudioAuthoring.Operations.showSimpleDialog(
          'error-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          'Notification',
          r.message,
          null,
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog'
        );
      }
    });
  },

  /**
   *
   */
  overwritePopupSubmit: function (event, args) {
    var callback = {
      success: function (response) {
        var serviceUri = CStudioAuthoring.Service.createServiceUri(args.self.serviceUri);
        var form = $('#asset_upload_form')[0];
        var data = new FormData(form);

        serviceUri +=
          '&' + CStudioAuthoringContext.xsrfParameterName + '=' + CStudioAuthoring.Storage.getRequestForgeryToken();

        $.ajax({
          enctype: 'multipart/form-data',
          processData: false, // Important!
          contentType: false,
          cache: false,
          type: 'POST',
          url: serviceUri,
          data: data,
          success: function (item) {
            CStudioAuthoring.Operations.showSimpleDialog(
              'upload-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              'Notification',
              item.response.message,
              null,
              YAHOO.widget.SimpleDialog.ICON_INFO,
              'success studioDialog'
            );
          },
          error: function (err) {
            CStudioAuthoring.Dialogs.UploadCMISDialog.closeDialog();
            args.self.callback.success(err.item);
          }
        });
      },

      failure: function () {}
    };

    CStudioAuthoring.Service.deleteContentForPathService(args.self.site, args.self.path, callback);
  },

  /**
   * event fired when the ok is pressed
   */
  uploadPopupCancel: function (event) {
    CStudioAuthoring.Dialogs.UploadCMISDialog.closeDialog();
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

CStudioAuthoring.Module.moduleLoaded('upload-cmis-dialog', CStudioAuthoring.Dialogs.UploadCMISDialog);
