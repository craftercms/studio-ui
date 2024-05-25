<#--
~ Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js"></script>
    <script src="/studio/static-assets/yui/utilities/utilities.js"></script>
    <script src="/studio/static-assets/yui/container/container-min.js"></script>
    <script src="/studio/static-assets/yui/json/json-min.js"></script>
    <script src="/studio/static-assets/yui/yahoo/yahoo-min.js"></script>
    <script src="/studio/static-assets/libs/jquery/jquery.min.js"></script>
    <#include "/templates/web/common/page-fragments/studio-context.ftl" />
    <script src="/studio/static-assets/components/cstudio-common/common-api.js"></script>
    <script src="/studio/static-assets/scripts/crafter.js"></script>
    <script src="/studio/static-assets/scripts/animator.js"></script>
    <script src="/studio/static-assets/components/cstudio-components/loader.js"></script>
    <script src="/studio/static-assets/libs/bootstrap/popper.min.js"></script>
    <script src="/studio/static-assets/libs/bootstrap/bootstrap.min.js"></script>
    <script src="/studio/static-assets/libs/notify/notify.min.js"></script>
    <#-- Lang resources -->
    <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
    <script src="${path}en/base.js"></script>
    <script src="${path}ko/base.js "></script>
    <script src="${path}es/base.js"></script>
    <script src="${path}de/base.js"></script>

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
    <#include "/static-assets/app/legacy-form.html">
  </body>
</html>
