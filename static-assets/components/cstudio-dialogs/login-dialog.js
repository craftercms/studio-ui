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
// YConnect.setDefaultPostHeader(false);
//                YConnect.initHeader("Content-Type", "application/xml; charset=utf-8");
//                YConnect.
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.LoginDialog = CStudioAuthoring.Dialogs.LoginDialog || {
  /**
   * initialize module
   */
  initialize: function(config) {},

  /**
   * show dialog
   */
  showDialog: function(cb) {
    this._self = this;

    this.dialog = this.createDialog(cb);

    this.cb = cb;
    this.dialog.show();

    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      var formSize = parent.getFormSize(id);
      if (formSize < 320) {
        parent.setFormSize(320, id);
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
  createDialog: function(cb) {
    var CMgs = CStudioAuthoring.Messages;
    var previewLangBundle = CMgs.getBundle('previewTools', CStudioAuthoringContext.lang);

    YDom.removeClass('cstudio-wcm-popup-div-login', 'yui-pe-content');

    var newdiv = YDom.get('cstudio-wcm-popup-div-login');
    if (newdiv == undefined) {
      newdiv = document.createElement('div');
      document.body.appendChild(newdiv);
    }

    function authRedirect(authConfig) {
      location = '/studio/#/login';
    }

    var divIdName = 'cstudio-wcm-popup-div-login';
    newdiv.setAttribute('id', divIdName);
    newdiv.className = 'yui-pe-content';
    newdiv.innerHTML =
      '<div class="contentTypePopupInner" id="login-popup-inner">' +
      '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      '<div class="contentTypePopupHeader loginHeader">' +
      '<img src="" alt="Crafter Studio" id="crafterLogo">' +
      '</div> ' +
      '<div>' +
      '<form id="login_form">' +
      '<p class="subtitleErr">' +
      CMgs.format(previewLangBundle, 'sessionExpireInactivity') +
      '</p>' +
      '<div class="contentTypeOuter">' +
      '<div class="form-group">' +
      '<label for="username">' +
      CMgs.format(previewLangBundle, 'emailUsername') +
      '</label>' +
      '<input type="text" name="username" id="username" placeholder="john@example.com" value="' +
      CStudioAuthoringContext.user +
      '" disabled/>' +
      '</div>' +
      '<div class="form-group">' +
      '<label for="password">' +
      CMgs.format(previewLangBundle, 'password') +
      '</label>' +
      '<input type="password" name="pass" id="password" autofocus/>' +
      '</div>' +
      '<div class="alert alert-danger hidden" id="loginError">' +
      '</div>' +
      '</div>' +
      '<div class="contentTypePopupBtn"> ' +
      '<input type="submit" class="btn btn-primary cstudio-xform-button" id="loginButton" value="' +
      CMgs.format(previewLangBundle, 'signInContinueWorking') +
      '" />' +
      '<input type="button" class="btn btn-default cstudio-xform-button" id="loginCancelButton" value="' +
      CMgs.format(previewLangBundle, 'doneSignOut') +
      '"  />' +
      '</div>' +
      '</form></div>' +
      '</div> ' +
      '</div>';

    document.getElementById('login-popup-inner').style.width = '350px';
    document.getElementById('login-popup-inner').style.height = '180px';

    // Instantiate the Dialog
    login_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div-login', {
      width: '360px',
      height: '388px',
      effect: {
        effect: YAHOO.widget.ContainerEffect.FADE,
        duration: 0.25
      },
      fixedcenter: true,
      visible: false,
      modal: true,
      close: false,
      constraintoviewport: true,
      underlay: 'none',
      hideaftersubmit: false
    });

    // Render the Dialog
    login_dialog.render();
    YDom.addClass(newdiv.parentNode, 'login-dialog');

    var eventParams = {
      self: this
    };

    YDom.get('crafterLogo').src = '/studio/static-assets/images/logo.svg';

    YAHOO.util.Event.addListener('loginButton', 'click', this.loginPopupSubmit, eventParams);
    YAHOO.util.Event.addListener('loginCancelButton', 'click', authRedirect);

    setTimeout(function() {
      var el = YAHOO.util.Selector.query('body > .mask:first-child');
      YDom.addClass(el, 'login-dialog-mask');
    }, 100);

    return login_dialog;
  },

  /**
   * event fired when the ok is pressed
   */
  loginPopupSubmit: function(event, args) {
    var self = this;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var serviceCallback = {
      success: function(jsonResponse) {
        var response = eval('(' + jsonResponse + ')');
        if (response.username) {
          args.self.loginPopupCancel();
          args.self.cb.success();
        } else {
          var loginError = document.getElementById('loginError');
          var cstudioWcmPopup = document.getElementById('cstudio-wcm-popup-div-login');
          loginError.innerHTML = response.message;
          if (loginError.classList.contains('hidden')) {
            loginError.classList.remove('hidden');
            $(cstudioWcmPopup).height($(loginError).height() + $(cstudioWcmPopup).height() + 21);
          }
        }
      },
      failure: function(response) {
        var loginError = document.getElementById('loginError');
        var cstudioWcmPopup = document.getElementById('cstudio-wcm-popup-div-login');
        loginError.innerHTML = JSON.parse(response.responseText).message;
        if (loginError.classList.contains('hidden')) {
          loginError.classList.remove('hidden');
          $(cstudioWcmPopup).height($(loginError).height() + $(cstudioWcmPopup).height() + 21);
        }
      }
    };

    CStudioAuthoring.Service.login(username, password, serviceCallback);
  },

  /**
   * login
   */
  submitLogin: function(args) {},

  /**
   * event fired when the ok is pressed
   */
  loginPopupCancel: function(event) {
    CStudioAuthoring.Dialogs.LoginDialog.closeDialog();
    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      if ($('#ice-body').length > 0 && $($('.studio-ice-container-' + id, parent.document)[0]).height() > 212) {
        $($('.studio-ice-container-' + id, parent.document)[0]).height(212);
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('login-dialog', CStudioAuthoring.Dialogs.LoginDialog);
