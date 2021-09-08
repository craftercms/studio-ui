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

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.NewFolderNameDialog = CStudioAuthoring.Dialogs.NewFolderNameDialog || {
  /**
   * initialize module
   */
  initialize: function (config) {},

  /**
   * show dialog
   */
  showDialog: function (site, path, serviceUri, callingWindow, callback) {
    this._self = this;

    this.dialog = this.createDialog(path, site, serviceUri);

    this.path = path;
    this.site = site;
    this.asPopup = true;
    this.serviceUri = serviceUri;
    this.callingWindow = callingWindow;
    this.callback = callback;
    this.dialog.show();
    YDom.get('folderNameId').focus();
  },

  /**
   * hide dialog
   */
  closeDialog: function () {
    this.dialog.destroy();
  },

  /**
   * create dialog
   */
  createDialog: function (path, site, serviceUri) {
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
      '<div class="contentTypePopupInner create-new-folder-dialog" id="upload-popup-inner">' +
      '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      '<div class="contentTypePopupHeader">' +
      CMgs.format(formsLangBundle, 'newFolderTitle') +
      ' </div> ' +
      '<div class="contentTypeOuter">' +
      '<div style="margin-bottom:10px;font-style:italic;">' +
      CMgs.format(formsLangBundle, 'newFolderBody') +
      ' </div> ' +
      '<div>' +
      '<div><table><tr><td><div style="margin-right:10px;">' +
      CMgs.format(formsLangBundle, 'newFolderLabel') +
      ' </div></td><td><input type="text" name="folderName" id="folderNameId" style="width:210px" autofocus /></td></tr></table></div>' +
      '</div>' +
      '</div>' +
      '<div class="contentTypePopupBtn"> ' +
      '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="createButton" value="' +
      CMgs.format(formsLangBundle, 'create') +
      '" />' +
      '<input type="button" class="btn btn-default cstudio-xform-button" id="createCancelButton" value="' +
      CMgs.format(formsLangBundle, 'cancel') +
      '" /></div>' +
      '</div>' +
      '<div class="contentTypePopupBtn" style="overflow: hidden"><div  style="visibility:hidden; margin:10px 0;" id="indicator">' +
      CMgs.format(formsLangBundle, 'newFolderUpdating') +
      ' </div>' +
      '</div> ' +
      '</div>';

    document.getElementById('upload-popup-inner').style.width = '350px';
    document.getElementById('upload-popup-inner').style.height = 'auto';

    // Instantiate the Dialog
    create_folder_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '360px',
      height: 'auto',
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
    create_folder_dialog.render();

    var eventParams = {
      self: this
    };

    var inputEl = document.getElementById('folderNameId'),
      me = this;

    YAHOO.util.Event.addListener('createButton', 'click', this.createPopupSubmit, eventParams);
    YAHOO.util.Event.addListener('createCancelButton', 'click', this.createPopupCancel);

    YAHOO.util.Event.on(
      inputEl,
      'keyup',
      function (e) {
        if (e.which !== 13) {
          if (e.which === 27) {
            // esc
            me.createPopupCancel();
          } else {
            me.processKey(e, inputEl, eventParams.self.path.startsWith('/scripts/rest'));
          }
        } else {
          me.createPopupSubmit(e, eventParams);
        }
      },
      inputEl
    );

    return create_folder_dialog;
  },

  /**
   * event fired when the ok is pressed
   */
  createPopupSubmit: function (event, args) {
    var contentType = 'folder';
    var newFolderName = document.getElementById('folderNameId').value;
    var serviceUri = CStudioAuthoring.Service.createServiceUri(
      args.self.serviceUri +
        '?site=' +
        args.self.site +
        '&path=' +
        args.self.path +
        '&name=' +
        encodeURIComponent(newFolderName)
    );

    var serviceCallback = {
      success: function (oResponse) {
        //reload the page for now, need to improve to reload the tree dynamically
        CStudioAuthoring.Dialogs.NewFolderNameDialog.closeDialog();
        args.self.callback.success(); //.callingWindow.location.reload(true);
      },

      failure: function (response) {
        var responseJson = eval('(' + response.responseText + ')');
        var message = responseJson.message;
        document.getElementById('indicator').innerHTML = message;
        YAHOO.util.Dom.setStyle('indicator', 'color', 'red');
      },

      callback: args.self.callback
    };
    YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
    YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CrafterCMSNext.util.auth.getRequestForgeryToken());
    YConnect.asyncRequest('POST', serviceUri, serviceCallback);
  },

  /**
   * event fired when the ok is pressed
   */
  createPopupCancel: function () {
    CStudioAuthoring.Dialogs.NewFolderNameDialog.closeDialog();
  },

  /**
   * don't allow characters which are invalid for file names and check length
   */
  processKey: function (evt, el, allowBraces) {
    var invalid = new RegExp('[!@#$%^&*\\(\\)\\+=\\[\\]\\\\\\\'`;,\\.\\/\\{\\}|":<>\\?~ ]', 'g');
    if (allowBraces) {
      invalid = new RegExp('[!@#$%^&*\\(\\)\\+=\\[\\]\\\\\\\'`;,\\.\\/|":<>\\?~ ]', 'g');
    }
    var cursorPosition = el.selectionStart;
    //change url to lower case
    if (el.value != '' && el.value != el.value.toLowerCase()) {
      el.value = el.value.toLowerCase();
      if (cursorPosition && typeof cursorPosition == 'number') {
        el.selectionStart = cursorPosition;
        el.selectionEnd = cursorPosition;
      }
    }
    var data = el.value;

    if (invalid.exec(data) != null) {
      el.value = data.replace(invalid, '');
      if (cursorPosition && typeof cursorPosition == 'number') {
        el.selectionStart = cursorPosition - 1;
        el.selectionEnd = cursorPosition - 1;
      }
      // commented out since this is causing a js error: Event.stopEvent is not a function
      //Event.stopEvent(evt);
    }

    if (el.maxLength != -1 && data.length > el.maxLength) {
      data = data.substr(0, el.maxLength);
      el.value = data;
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('new-folder-name-dialog', CStudioAuthoring.Dialogs.NewFolderNameDialog);
