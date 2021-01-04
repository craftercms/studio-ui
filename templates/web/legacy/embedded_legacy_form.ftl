<#--
~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
~
~ This program is free software: you can redistribute it and/or modify
~ it under the terms of the GNU General Public License version 3 as published by
~ the Free Software Foundation.
~
~ This program is distributed in the hope that it will be useful,
~ but WITHOUT ANY WARRANTY; without even the implied warranty of
~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
~ GNU General Public License for more details.
~
~ You should have received a copy of the GNU General Public License
~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<html>
<head>
  <#include "/templates/web/common/js-next-scripts.ftl" />
  <script>
    document.domain = "${Request.serverName}";
  </script>
  <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/utilities/utilities.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/container/container-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/json/json-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/yahoo/yahoo-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/jquery/dist/jquery-3.4.1.min.js"></script>
  <#include "/templates/web/common/page-fragments/studio-context.ftl" />
  <script src="/studio/static-assets/components/cstudio-common/common-api.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-components/loader.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/bootstrap/js/bootstrap.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/notify/notify.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <#-- Lang resources -->
  <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
  <script src="${path}en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="${path}de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <script>
    window.IS_LEGACY_TOP_WINDOW = true;
  </script>
  <style>
    .studio-ice-dialog {
      margin-left: auto !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      top: 0 !important;
      height: 100% !important;
      width: 100% !important;
      position: fixed !important;
      border: none !important;
    }

    .studio-ice-dialog > .bd iframe {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      position: absolute;
    }

    .cstudio-template-editor-container {
      border: 0 !important;
      background: #f8f8f8 !important;
      box-shadow: none !important;
    }
  </style>
</head>
<body>
<script>
  const { formatMessage } = CrafterCMSNext.i18n.intl;
  const { embeddedLegacyFormMessages } = CrafterCMSNext.i18n.messages;
  var path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
  var site = CStudioAuthoring.Utils.getQueryVariable(location.search, 'site');
  var type = CStudioAuthoring.Utils.getQueryVariable(location.search, 'type');
  var readOnly = CStudioAuthoring.Utils.getQueryVariable(location.search, 'readonly');
  var contentTypeId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'contentTypeId');
  var isNewContent = CStudioAuthoring.Utils.getQueryVariable(location.search, 'isNewContent');

  CStudioAuthoring.OverlayRequiredResources.loadContextNavCss();

  function openDialog(type, path) {
    switch (type) {
      case 'form': {
        var modelId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'modelId');
        var isHidden = CStudioAuthoring.Utils.getQueryVariable(location.search, 'isHidden');
        var changeTemplate = CStudioAuthoring.Utils.getQueryVariable(location.search, 'changeTemplate');

        const aux = [];
        if (readOnly) aux.push({ name: 'readonly' });
        if (changeTemplate) aux.push({ name: 'changeTemplate', value: changeTemplate });

        if (!isNewContent) {
          CStudioAuthoring.Service.lookupContentItem(
                  site,
                  path,
                  {
                    success: (contentTO) => {
                      CStudioAuthoring.Operations.performSimpleIceEdit(
                              contentTO.item,
                              '',
                              true,
                              {
                                success: (response, editorId, name, value, draft, action) => {
                                  window.top.postMessage({
                                    ...response,
                                    type: 'EMBEDDED_LEGACY_FORM_SUCCESS',
                                    refresh: true,
                                    tab: type,
                                    action
                                  }, '*');
                                },
                                failure: error => {
                                  error && console.error(error);
                                  window.top.postMessage({
                                    type: 'EMBEDDED_LEGACY_FORM_FAILURE',
                                    refresh: false,
                                    tab: type,
                                    action: 'failure',
                                    message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
                                  }, '*');
                                },
                                cancelled: (response) => {
                                  let close = true;
                                  if(response && response.close === false) {
                                    close = false;
                                  }
                                  window.top.postMessage({
                                    type: 'EMBEDDED_LEGACY_FORM_CLOSE',
                                    refresh: false,
                                    close: close,
                                    tab: type,
                                    action: 'cancelled'
                                  }, '*');
                                },
                                renderComplete: () => {
                                  if (!modelId) {
                                    window.top.postMessage({ type: 'EMBEDDED_LEGACY_FORM_RENDERED' }, '*');
                                  } else {
                                    CStudioAuthoring.InContextEdit.messageDialogs({
                                      type: 'OPEN_CHILD_COMPONENT',
                                      key: modelId,
                                      iceId: null,
                                      edit: true,
                                      callback: {
                                        renderComplete: 'EMBEDDED_LEGACY_FORM_RENDERED',
                                        pendingChanges: 'EMBEDDED_LEGACY_FORM_PENDING_CHANGES'
                                      }
                                    });
                                  }
                                },
                                id: type
                              },
                              aux,
                              null,
                              !!isHidden);
                    },
                    failure: error => {
                      error && console.error(error);
                      window.top.postMessage({
                        type: 'EMBEDDED_LEGACY_FORM_FAILURE',
                        refresh: false,
                        tab: type,
                        action: 'failure',
                        message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
                      }, '*');
                    }
                  },
                  false, false
          );
        } else {
          CStudioAuthoring.Operations.openContentWebForm(
                  contentTypeId,
                  null,
                  null,
                  CStudioAuthoring.Operations.processPathsForMacros(path, null, true),
                  false,
                  false,
                  {
                    success: (response, editorId, name, value, draft, action) => {
                      window.top.postMessage({
                        ...response,
                        type: 'EMBEDDED_LEGACY_FORM_SAVE',
                        refresh: false,
                        tab: type,
                        redirectUrl: response.item?.browserUri,
                        action,
                        isNew: true
                      }, '*');
                    },
                    failure: (error) => {
                      error && console.error(error);
                      window.top.postMessage({
                        type: 'EMBEDDED_LEGACY_FORM_FAILURE',
                        refresh: false, tab: type, action: 'failure',
                        message: formatMessage(embeddedLegacyFormMessages.contentFormFailedToLoadErrorMessage)
                      }, '*');
                    },
                    cancelled: () => {
                      window.top.postMessage({
                        type: 'EMBEDDED_LEGACY_FORM_CLOSE',
                        refresh: false,
                        tab: type,
                        action: 'cancelled'
                      }, '*');
                    },
                    renderComplete: () => {
                      window.top.postMessage({ type: 'EMBEDDED_LEGACY_FORM_RENDERED' }, '*');
                    },
                    id: type
                  },
                  null
          );
        }

        break;
      }
      case 'asset':
      case 'controller':
      case 'template': {
        let mode = null;
        if (readOnly) {
          mode = 'read';
        }
        CStudioAuthoring.Operations.openTemplateEditor(path, 'default', {
          success: function (action) {
            window.top.postMessage({
              type: 'LEGACY_CODE_EDITOR_SUCCESS',
              action
            }, '*');
          },
          cancelled: function () {
            window.top.postMessage({
              type: 'LEGACY_CODE_EDITOR_CLOSE',
              action: 'cancelled'
            }, '*');
          },
          renderComplete: function () {
            window.top.postMessage({
              type: 'LEGACY_CODE_EDITOR_RENDERED',
              action: 'renderComplete'
            }, '*');
          },
          id: type,
          callingWindow: window
        }, null, mode);
        break;
      }
    }
  }

  openDialog(type, path);
</script>
</body>
</html>
