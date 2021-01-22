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

(function($, window, amplify, CStudioAuthoring) {
  'use strict';

  if (!window.location.origin) {
    window.location.origin =
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '');
  }

  var cstopic = crafter.studio.preview.cstopic,
    Topics = crafter.studio.preview.Topics,
    previewAppBaseUri = CStudioAuthoringContext.previewAppBaseUri || window.location.origin,
    origin = previewAppBaseUri,
    communicator = new crafter.studio.Communicator(origin),
    previewWidth,
    hasCheckIn = false;

  communicator.subscribe(Topics.RESET_ICE_TOOLS_CONTENT, function(message) {
    sessionStorage.setItem('ice-tools-content', message);
    try {
      // For ICE tools panel syncing.
      window.initRegCookie();
    } catch (e) {}
  });

  communicator.subscribe(Topics.SET_SESSION_STORAGE_ITEM, function(message) {
    sessionStorage.setItem(message.key, message.value);
  });

  communicator.subscribe(Topics.REQUEST_SESSION_STORAGE_ITEM, function(key) {
    if (typeof key === 'string') {
      communicator.publish(Topics.REQUEST_SESSION_STORAGE_ITEM_REPLY, {
        key: key,
        value: sessionStorage.getItem(key)
      });
    } else {
      // Expeting key to be an array here
      var values = {};
      for (var i = 0; i < key.length; i++) {
        values[i] = values[key[i]] = sessionStorage.getItem(key[i]);
      }
      communicator.publish(Topics.REQUEST_SESSION_STORAGE_ITEM_REPLY, values);
    }
  });

  communicator.subscribe(Topics.GUEST_CHECKIN, function(url) {
    var site = CStudioAuthoring.Utils.Cookies.readCookie('crafterSite');
    var params = { page: url, site };
    setHash(params);
    amplify.publish(cstopic('GUEST_CHECKIN'), params);
  });

  // Preview 2 check in
  let previewNextCheckInNotification = false;
  let compatibilityQueryArg = CrafterCMSNext.util.path.getQueryVariable(window.location.search, 'compatibility');
  let compatibilityForceStay = compatibilityQueryArg === 'stay';
  let compatibilityAsk = compatibilityQueryArg === 'ask';
  communicator.subscribe(Topics.GUEST_CHECK_IN, function(data) {
    if (!previewNextCheckInNotification && !compatibilityForceStay) {
      // Avoid recurrently showing the notification over and
      // over as long as the page is not refreshed
      previewNextCheckInNotification = true;
      communicator.addTargetWindow({
        origin: origin,
        window: getEngineWindow().contentWindow
      });
      const handleRemember = (remember, goOrStay) => {
        CrafterCMSNext.system.store.dispatch({
          type: 'SET_PREVIEW_CHOICE',
          payload: { site: CStudioAuthoringContext.siteId, previewChoice: remember ? goOrStay : 'ask' }
        });
      };
      const doGo = () => {
        const state = CrafterCMSNext.system.store.getState();
        window.location.href = `${state.env.authoringBase}/next/preview#/?page=${data.location.pathname}&site=${state.sites.active}`;
      };
      const showCompatDialog = () => {
        let unmount;
        CrafterCMSNext.render(document.createElement('div'), 'PreviewCompatDialog', {
          data,
          onOk({ remember }) {
            handleRemember(remember, '2');
            doGo();
          },
          onCancel({ remember }) {
            handleRemember(remember, '1');
          },
          onClosed() {
            unmount({ removeContainer: true });
          }
        }).then((args) => {
          unmount = args.unmount;
        });
      };
      let previousChoice = CrafterCMSNext.system.store.getState().preview.previewChoice[CStudioAuthoringContext.siteId];
      if (previousChoice === null) {
        CrafterCMSNext.system.store.dispatch({
          type: 'SET_PREVIEW_CHOICE',
          payload: { site: CStudioAuthoringContext.siteId, previewChoice: (previousChoice = '2') }
        });
      }
      if (previousChoice && !compatibilityAsk) {
        if (previousChoice === '2') {
          doGo();
        } else if (previousChoice === 'ask') {
          showCompatDialog();
        }
      } else {
        showCompatDialog();
      }
    }
    communicator.dispatch({ type: Topics.LEGACY_CHECK_IN, payload: { editMode: false } });
  });

  // Opens studio form on pencil click
  communicator.subscribe(Topics.ICE_ZONE_ON, function(message, scope) {
    var isWrite = false;
    var par = [];
    var currentPath = message.itemId ? message.itemId : CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri;
    var cachePermissionsKey = `${CStudioAuthoringContext.site}_${currentPath}_${CStudioAuthoringContext.user}_permissions`,
      isPermissionCached = cache.get(cachePermissionsKey),
      cacheContentKey =
        CStudioAuthoringContext.site + '_' + currentPath + '_' + CStudioAuthoringContext.user + '_content',
      isContentCached = cache.get(cacheContentKey);

    const openForm = function(path, readonly) {
      const site = CrafterCMSNext.system.store.getState().sites.active;
      const authoringBase = CrafterCMSNext.system.store.getState().env.authoringBase;
      const legacyFormSrc = `${authoringBase}/legacy/form`;
      const eventIdSuccess = 'editDialogSuccess';
      const eventIdDismissed = 'editDialogDismissed';
      let unsubscribe, cancelUnsubscribe;

      const qs = CrafterCMSNext.util.object.toQueryString({
        site: site,
        path: path,
        type: 'form',
        readonly: readonly,
        iceId: message.embeddedItemId ? null : message.iceId,
        isHidden: !!message.embeddedItemId,
        modelId: message.embeddedItemId ? message.embeddedItemId : null
      });
      const src = `${legacyFormSrc}${qs}`;

      CrafterCMSNext.system.store.dispatch({
        type: 'SHOW_EDIT_DIALOG',
        payload: {
          src: src,
          onSaveSuccess: {
            type: 'BATCH_ACTIONS',
            payload: [
              {
                type: 'DISPATCH_DOM_EVENT',
                payload: { id: eventIdSuccess }
              },
              {
                type: 'SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION'
              },
              {
                type: 'CLOSE_EDIT_DIALOG'
              }
            ]
          },
          onCancel: {
            type: 'BATCH_ACTIONS',
            payload: [
              {
                type: 'CLOSE_EDIT_DIALOG'
              },
              {
                type: 'DISPATCH_DOM_EVENT',
                payload: { id: eventIdDismissed }
              }
            ]
          }
        }
      });

      unsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdSuccess, (response) => {
        const draft = response.action === 'save';
        if (CStudioAuthoringContext.isPreview || (!CStudioAuthoringContext.isPreview && !draft)) {
          eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
          eventNS.typeAction = '';
          document.dispatchEvent(eventNS);
        }
        cancelUnsubscribe();
      });

      cancelUnsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdDismissed, () => {
        unsubscribe();
      });
    };

    var editPermsCallback = {
      success: function(response) {
        if (!isPermissionCached) {
          cache.set(cachePermissionsKey, response.permissions, CStudioAuthoring.Constants.CACHE_TIME_PERMISSION);
        }
        isWrite = CStudioAuthoring.Service.isWrite(response.permissions);
        if (!isWrite) {
          par.push({ name: 'readonly' });
        }

        if (!message.itemId) {
          // base page edit
          const readonly =
            isWrite === false ||
            (CStudioAuthoring.SelectedContent.getSelectedContent()[0].lockOwner !== '' &&
              CStudioAuthoring.SelectedContent.getSelectedContent()[0].lockOwner !== null &&
              CStudioAuthoringContext.user !== CStudioAuthoring.SelectedContent.getSelectedContent()[0].lockOwner);

          openForm(CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri, readonly);
        } else {
          var getContentItemsCb = {
            success: function(contentTO) {
              if (!isContentCached) {
                cache.set(cacheContentKey, contentTO.item, CStudioAuthoring.Constants.CACHE_TIME_GET_CONTENT_ITEM);
              }
              const readonly =
                isWrite === false ||
                (contentTO.item.lockOwner !== '' &&
                  contentTO.item.lockOwner !== null &&
                  CStudioAuthoringContext.user !== contentTO.item.lockOwner);

              openForm(contentTO.item.uri, readonly);
            },
            failure: function() {
              callback.failure();
            }
          };

          if (isContentCached) {
            var contentTO = {};
            contentTO.item = isContentCached;
            getContentItemsCb.success(contentTO);
          } else {
            CStudioAuthoring.Service.lookupContentItem(
              CStudioAuthoringContext.site,
              message.itemId,
              getContentItemsCb,
              false,
              false
            );
          }
        }
      },
      failure: function() {}
    };

    if (isPermissionCached) {
      var response = {};
      response.permissions = isPermissionCached;
      editPermsCallback.success(response);
    } else {
      CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, currentPath, editPermsCallback);
    }
  });

  // Listen to the guest site load
  communicator.subscribe(Topics.GUEST_SITE_LOAD, function(message, scope) {
    hasCheckIn = true;

    if (message.url) {
      var params = {
        page: message.url,
        site: CStudioAuthoring.Utils.Cookies.readCookie('crafterSite')
      };

      var studioPath = CrafterCMSNext.util.path.getPathFromPreviewURL(message.url);

      setHash(params);
      amplify.publish(cstopic('GUEST_SITE_LOAD'), params);

      selectStudioContent(params.site, studioPath);
    }

    // Once the guest window notifies that the page as successfully loaded,
    // add the guest window as a target of messages sent by this window
    communicator.addTargetWindow({
      origin: origin,
      window: getEngineWindow().contentWindow
    });
  });

  communicator.subscribe(Topics.GUEST_SITE_URL_CHANGE, function(message, scope) {
    if (message.url) {
      var site = CStudioAuthoring.Utils.Cookies.readCookie('crafterSite'),
        studioPath = CStudioAuthoring.ComponentsPanel.getPreviewPagePath(message.url);
      selectStudioContent(site, studioPath);

      setHash({ page: message.url, site });
      CStudioAuthoring.ComponentsPanel.getPageModel(studioPath, 'init-components', true, false);

      communicator.publish(Topics.DND_PANEL_OFF);
    }
  });

  communicator.subscribe(Topics.STOP_DRAG_AND_DROP, function() {
    expandContractChannel();
    CStudioAuthoring.PreviewTools.panel.element.style.visibility = 'visible';
    $(CStudioAuthoring.PreviewTools.panel.element).show('slow', function() {
      if (!previewWidth || previewWidth == 0 || previewWidth == '0px') {
        previewWidth = 265;
      }
      $('.studio-preview').css('right', previewWidth);
      YDom.replaceClass('component-panel-elem', 'expanded', 'contracted');
    });
  });

  amplify.subscribe(cstopic('DND_COMPONENTS_PANEL_OFF'), function(config) {
    sessionStorage.setItem('pto-on', '');
    /*var PreviewToolsOffEvent = new YAHOO.util.CustomEvent("cstudio-preview-tools-off", CStudioAuthoring);
    PreviewToolsOffEvent.fire();*/
    var el = YDom.get('acn-preview-tools-container');
    YDom.removeClass(el.children[0], 'icon-light-blue');
    YDom.addClass(el.children[0], 'icon-default');
    communicator.publish(Topics.DND_COMPONENTS_PANEL_OFF, {});
  });

  amplify.subscribe(cstopic('DND_COMPONENTS_PANEL_ON'), function(config) {
    sessionStorage.setItem('pto-on', 'on');
    var el = YDom.get('acn-preview-tools-container');
    YDom.removeClass(el.children[0], 'icon-default');
    YDom.addClass(el.children[0], 'icon-light-blue');
    amplify.publish(cstopic('START_DRAG_AND_DROP'), {
      components: config.components
    });
  });

  communicator.subscribe(Topics.COMPONENT_DROPPED, function(message) {
    message.model = initialContentModel;
    amplify.publish(
      cstopic('COMPONENT_DROPPED'),
      message.type,
      message.path,
      message.isNew,
      message.trackingNumber,
      message.zones,
      message.compPath,
      message.conComp,
      message.model,
      message.datasource
    );
  });

  communicator.subscribe(Topics.START_DIALOG, function(message) {
    var newdiv = document.createElement('div');
    var text;
    var link = '';

    if (message.messageKey) {
      text = CrafterCMSNext.i18n.intl.formatMessage(
        CrafterCMSNext.i18n.messages.dragAndDropMessages[message.messageKey]
      );
    } else {
      text = message.message;
    }
    if (message.link) {
      link = message.link;
    }

    newdiv.setAttribute('id', 'cstudio-wcm-popup-div');
    newdiv.className = 'yui-pe-content';
    newdiv.innerHTML =
      '<div class="contentTypePopupInner" id="warning">' +
      /**/ '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      /****/ '<div class="contentTypePopupHeader">Notification</div> ' +
      /****/ '<div class="contentTypeOuter">' +
      /****/ '<div>' +
      text +
      '</div> ' +
      /****/ '<div>' +
      link +
      '</div> ' +
      /****/ '<div></div>' +
      /**/ '</div>' +
      /**/ '<div class="contentTypePopupBtn"> ' +
      /****/ '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="cancelButton" value="OK" />' +
      /**/ '</div>' +
      '</div>';

    document.body.appendChild(newdiv);

    var dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '400px',
      height: message.height ? message.height : '222px',
      fixedcenter: true,
      visible: false,
      modal: true,
      close: false,
      constraintoviewport: true,
      underlay: 'none',
      autofillheight: null,
      buttons: [
        {
          text: 'Cancel',
          handler: function() {
            $(this).destroy();
          },
          isDefault: true
        }
      ]
    });

    dialog.render();
    dialog.show();
    dialog.cfg.setProperty('zIndex', 1040); // Update the z-index value to make it go over the site content nav

    YAHOO.util.Event.addListener('cancelButton', 'click', function() {
      dialog.destroy();
      var masks = YAHOO.util.Dom.getElementsByClassName('mask');
      for (var i = 0; i < masks.length; i++) {
        YAHOO.util.Dom.getElementsByClassName('mask')[0].parentElement.removeChild(
          YAHOO.util.Dom.getElementsByClassName('mask')[0]
        );
      }
    });

    return dialog;
  });

  communicator.subscribe(Topics.OPEN_BROWSE, function(message) {
    CStudioAuthoring.Operations.openBrowse(
      '',
      CStudioAuthoring.Operations.processPathsForMacros(message.path, initialContentModel),
      1,
      'select',
      true,
      {
        success: function(searchId, selectedTOs) {
          for (var i = 0; i < selectedTOs.length; i++) {
            var item = selectedTOs[i];
            communicator.publish(Topics.DND_CREATE_BROWSE_COMP, {
              component: selectedTOs[i],
              initialContentModel: initialContentModel
            });
          }
        },
        failure: function() {}
      }
    );
  });

  communicator.subscribe(Topics.SAVE_DRAG_AND_DROP, function(message) {
    amplify.publish(cstopic('SAVE_DRAG_AND_DROP'), message.isNew, message.zones, message.compPath, message.conComp);
  });

  communicator.subscribe(Topics.INIT_DRAG_AND_DROP, function(message) {
    amplify.publish(cstopic('INIT_DRAG_AND_DROP'), message.zones);
  });

  communicator.subscribe(Topics.DND_ZONES_MODEL_REQUEST, function(message) {
    amplify.publish(cstopic('DND_ZONES_MODEL_REQUEST'), message.aNotFound);
  });

  communicator.subscribe(Topics.LOAD_MODEL_REQUEST, function(message) {
    amplify.publish(cstopic('LOAD_MODEL_REQUEST'), message.aNotFound);
  });

  amplify.subscribe(cstopic('REFRESH_PREVIEW'), function() {
    communicator.publish(Topics.REFRESH_PREVIEW);
  });

  var initialContentModel;
  amplify.subscribe(cstopic('START_DRAG_AND_DROP'), function(config) {
    expandContractChannel('expand');
    previewWidth = $('.studio-preview').css('right');
    $('.studio-preview').css('right', 0);
    $(CStudioAuthoring.PreviewTools.panel.element).hide('fast', function() {
      var data, dataBrowse;
      if (config.components.category) {
        data = config.components.category;
      } else {
        data = config.components;
      }

      if (config.components.browse) {
        dataBrowse = config.components.browse;
      }

      var categories = [],
        browse = [];

      if (data) {
        if ($.isArray(data)) {
          $.each(data, function(i, c) {
            if (c.component) {
              categories.push({ label: c.label, components: c.component });
            } else {
              categories.push({ label: c.label, components: c.components });
            }
          });
        } else {
          if (data.component) {
            categories.push({ label: data.label, components: data.component });
          } else {
            categories.push({ label: data.label, components: data.components });
          }
        }
      }

      if (dataBrowse) {
        if ($.isArray(dataBrowse)) {
          $.each(dataBrowse, function(i, c) {
            browse.push({ label: c.label, path: c.path });
          });
        } else {
          browse.push({ label: dataBrowse.label, path: dataBrowse.path });
        }
      }

      var text = {};
      text.done = CMgs.format(previewLangBundle, 'done');
      text.components = CMgs.format(previewLangBundle, 'components');
      text.addComponent = CMgs.format(previewLangBundle, 'addComponent');

      communicator.publish(Topics.START_DRAG_AND_DROP, {
        components: categories,
        contentModel: initialContentModel,
        translation: text,
        browse: browse
      });
    });
  });

  amplify.subscribe(cstopic('DND_COMPONENT_MODEL_LOAD'), function(data) {
    communicator.publish(Topics.DND_COMPONENT_MODEL_LOAD, data);
  });

  amplify.subscribe(cstopic('DND_COMPONENTS_MODEL_LOAD'), function(data) {
    initialContentModel = data;
    communicator.publish(Topics.DND_COMPONENTS_MODEL_LOAD, data);
  });

  amplify.subscribe(cstopic('ICE_TOOLS_OFF'), function() {
    communicator.publish(Topics.ICE_TOOLS_OFF);
  });

  communicator.subscribe(Topics.ICE_CHANGE_PENCIL_OFF, function(message) {
    $('#acn-ice-tools-container img').attr(
      'src',
      `${CStudioAuthoringContext.authoringAppBaseUri}/static-assets/themes/cstudioTheme/images/edit_off.png`
    );
  });

  communicator.subscribe(Topics.ICE_CHANGE_PENCIL_ON, function(message) {
    $('#acn-ice-tools-container img').attr(
      'src',
      `${CStudioAuthoringContext.authoringAppBaseUri}/static-assets/themes/cstudioTheme/images/edit.png`
    );
  });

  amplify.subscribe(cstopic('ICE_TOOLS_ON'), function() {
    communicator.publish(Topics.ICE_TOOLS_ON);
  });

  amplify.subscribe(cstopic('ICE_TOOLS_REGIONS'), function(data) {
    communicator.publish(Topics.ICE_TOOLS_REGIONS, data);
  });

  communicator.subscribe(Topics.IS_REVIEWER, function(resize) {
    var callback = function(isRev) {
      if (!isRev) {
        communicator.publish(resize ? Topics.RESIZE_ICE_REGIONS : Topics.INIT_ICE_REGIONS, {
          iceOn: sessionStorage.getItem('ice-on'),
          componentsOn: sessionStorage.getItem('components-on')
        });
      }
    };

    CStudioAuthoring.Utils.isReviewer(callback);
  });

  communicator.subscribe(Topics.REQUEST_FORM_DEFINITION, function(message) {
    CStudioForms.Util.loadFormDefinition(message.contentType, {
      success: function(response) {
        communicator.publish(Topics.REQUEST_FORM_DEFINITION_RESPONSE, response);
      }
    });
  });

  function setHash(params) {
    var hash = [];
    for (var key in params) {
      hash.push(key + '=' + params[key]);
    }
    CStudioAuthoringContext && (CStudioAuthoringContext.previewCurrentPath = params.page);
    window.location.hash = '#/?' + hash.join('&');
  }

  function getEngineWindow() {
    return document.getElementById('engineWindow');
  }

  function goToHashPage() {
    var win = getEngineWindow();
    var hash = parseHash(window.location.hash);
    var site = CStudioAuthoring.Utils.Cookies.readCookie('crafterSite');
    var siteChanged = false;

    if (hash.site) {
      CrafterCMSNext.util.auth.setSiteCookie(hash.site);
      siteChanged = site !== hash.site;
    }

    if (siteChanged || !hasCheckIn) {
      win.src = previewAppBaseUri + hash.page;
    } else {
      communicator.publish(Topics.CHANGE_GUEST_REQUEST, {
        base: previewAppBaseUri,
        url: hash.page
      });
    }

    var path = hash.page,
      hashPage = hash.page;

    if (path.match(/^((\/static-assets)|(\/remote-assets)|(\/api))/)) {
      hasCheckIn = false;
    }

    if (path && path.indexOf('.') != -1) {
      if (path.indexOf('.html') != -1 || path.indexOf('.xml') != -1) {
        path = ('/site/website/' + hashPage).replace('//', '/');
        path = path.replace('.html', '.xml');
      }
    } else {
      if (hash.page && hash.page.indexOf('?') != -1) {
        hashPage = hash.page.substring(0, hash.page.indexOf('?'));
      }
      if (hash.page && hash.page.indexOf('#') != -1) {
        hashPage = hash.page.substring(0, hash.page.indexOf('#'));
      }
      if (hash.page && hash.page.indexOf(';') != -1) {
        hashPage = hash.page.substring(0, hash.page.indexOf(';'));
      }

      path = ('/site/website/' + hashPage + '/index.xml').replace('//', '/');
    }

    path = path.replace('//', '/');

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, {
      success: function(content) {
        CStudioAuthoring.SelectedContent.setContent(content.item);
        selectContentSet(content.item, false);
      }
    });
  }

  // TODO better URL support. Find existing lib, use angular or use backbone router?
  function parseHash(hash) {
    var str = hash.replace('#/', ''),
      params = {},
      param;

    str = str.substr(str.indexOf('?') + 1);
    if (str.indexOf('?') != -1) {
      var strPage = str.split('?');
      var strPageParam = strPage[1].split('&');
      str = strPage[0] + '?';
      for (var i = 0; i < strPageParam.length; i++) {
        if (strPageParam[i].indexOf('site') != -1 && i == strPageParam.length - 1) {
          str = str + '&' + strPageParam[i];
        } else {
          str = str + strPageParam[i];
          if (i != strPageParam.length - 1) {
            str = str + '&';
          }
        }
      }
      str = str.split('&&');
    } else {
      str = str.split('&');
    }

    for (var i = 0; i < str.length; ++i) {
      param = splitOnce(str[i], '=');
      params[param[0]] = param[1];
    }

    return params;
  }

  function splitOnce(input, splitBy) {
    var fullSplit = input.split(splitBy);
    var retVal = [];
    retVal.push(fullSplit.shift());
    retVal.push(fullSplit.join(splitBy));
    return retVal;
  }

  function selectStudioContent(site, url) {
    CStudioAuthoring.Service.lookupContentItem(site, url, {
      success: function(content) {
        if (content.item.isPage) {
          CStudioAuthoring.SelectedContent.setContent(content.item);
          selectContentSet(content.item, true);
        }
      }
    });
  }

  // Triggers selected content set event to update highlight
  // item: selected item
  // reloadTree: if needed, allows tree to be reloaded. For assets it will be false since reload is not needed.
  function selectContentSet(item, reloadTree) {
    window.setTimeout(function() {
      amplify.publish('SELECTED_CONTENT_SET', {
        contentTO: item,
        reload: reloadTree
      });
    }, 0);
  }

  window.addEventListener(
    'hashchange',
    function(e) {
      e.preventDefault();
      goToHashPage();
    },
    false
  );

  window.addEventListener(
    'load',
    function() {
      if (window.location.hash.indexOf('page') === -1) {
        setHash({
          page: '/',
          site: CStudioAuthoring.Utils.Cookies.readCookie('crafterSite')
        });
      } else {
        goToHashPage();
      }
    },
    false
  );

  function expandContractChannel(opt) {
    var $studioChannelPortrait = $('.studio-device-preview-portrait')[0],
      $studioChannelLandscape = $('.studio-device-preview-landscape')[0];
    if ($studioChannelPortrait || $studioChannelLandscape) {
      var inputChannelWidth = $('[data-axis="x"]', parent.document),
        width = inputChannelWidth.val() || 'auto',
        $engine = $('#engineWindow', parent.document);

      width = opt === 'expand' ? parseInt(width) + 265 : parseInt(width);
      $engine.width(width === 'auto' || width === '' ? '' : parseInt(width));
    }
  }
})(jQuery, window, amplify, CStudioAuthoring);
