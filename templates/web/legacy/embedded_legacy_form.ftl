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
    /*iframe {*/
    /*  height: 100%;*/
    /*  width: 100%;*/
    /*}*/
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
  </style>
</head>
<body>
<script>
  var path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
  var site = CStudioAuthoring.Utils.getQueryVariable(location.search, 'site');
  var key = CStudioAuthoring.Utils.getQueryVariable(location.search, 'key');
  var isHidden = CStudioAuthoring.Utils.getQueryVariable(location.search, 'isHidden');
  //var iceComponent = CStudioAuthoring.Utils.getQueryVariable(location.search, 'iceComponent');
  //var edit = CStudioAuthoring.Utils.getQueryVariable(location.search, 'edit');

  // var editCb = {
  //   success: function (contentTO, editorId, name, value, draft) {
  //     if (CStudioAuthoringContext.isPreview) {
  //       try {
  //         CStudioAuthoring.Operations.refreshPreview();
  //       } catch (err) {
  //         if (!draft) {
  //           this.callingWindow.location.reload(true);
  //         }
  //       }
  //     }
  //     if (CStudioAuthoringContext.isPreview || (!CStudioAuthoringContext.isPreview && !draft)) {
  //       eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
  //       eventNS.typeAction = '';
  //       document.dispatchEvent(eventNS);
  //     }
  //   },
  //   failure: function () {
  //   }
  // };

  //if (isInclude === 'null') {
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
                console.log('success');
              },
              failure: () => {
                console.log('failure');
              },
              renderComplete: () => {
                console.log('renderComplete');
                if(key) {
                  debugger;
                  CStudioAuthoring.InContextEdit.messageDialogs({
                    type: 'OPEN_CHILD_COMPONENT',
                    key: key,
                    iceId: null,
                    edit: true
                  });
                }
              },
            },
            [{ defaultHeightWidth: true }],
            null,
            isHidden? false: false);
        },
        failure: (error) => {
          console.log(error);
        }
      },
      false, false);

  console.log(path);
</script>
</body>
</html>
