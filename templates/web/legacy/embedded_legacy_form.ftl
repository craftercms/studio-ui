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
  <script>
    window.IS_LEGACY_TOP_WINDOW = true;
  </script>
  <style>
    .studio-ice-dialog {
      z-index: 1035;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      height: 100% !important;
      width: 100%;
      position: fixed;
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
    .overlay {

    }
  </style>
</head>
<body>
<script>
  var path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
  var site = CStudioAuthoring.Utils.getQueryVariable(location.search, 'site');
  var modelId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'modelId');
  var isHidden = CStudioAuthoring.Utils.getQueryVariable(location.search, 'isHidden');

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
            success: () => {
              window.top.postMessage({ type: 'EMBEDDED_LEGACY_FORM_CLOSE', refresh: true }, '*');
            },
            failure: () => {
              console.log('failure');
            },
            cancelled: () => {
              window.top.postMessage({ type: 'EMBEDDED_LEGACY_FORM_CLOSE' }, '*');
            },
            renderComplete: () => {
              if (modelId) {
                CStudioAuthoring.InContextEdit.messageDialogs({
                  type: 'OPEN_CHILD_COMPONENT',
                  key: modelId,
                  iceId: null,
                  edit: true
                });
              }
            },
          },
          [],
          null,
          isHidden ? true : false);
      },
      failure: (error) => {
        console.log(error);
      }
    },
    false, false);
</script>
</body>
</html>
