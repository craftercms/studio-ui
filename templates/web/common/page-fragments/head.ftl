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
~ along with this program. If not, see <http://www.gnu.org/licenses/>.
-->
<#include "/templates/system/common/versionInfo.ftl" />
<#if envConfig.site?? == false || envConfig.site == "">
  <meta http-equiv="refresh" content="0;URL='/studio/user-dashboard/#/sites/all'" />
<#else>

  <script>
    window.UIBuildId = "${UIBuildId!.now?string('Mddyyyy')}";
  </script>

  <#include "/templates/web/common/js-next-scripts.ftl" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/yui/assets/skin.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/yui/container/assets/skins/sam/container.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/base.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/dashboard.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/dashboard-presentation.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/presentation.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/contextNav.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/global.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/styleicon.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/font-awesome.min.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/libs/datetimepicker/jquery.datetimepicker.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/uppy.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <!--[if IE 9]>
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/ie9.css" />
  <![endif]-->

  <script src="/studio/static-assets/yui/utilities/utilities.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/button/button-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/container/container-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/menu/menu-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/json/json-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/selector/selector-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/connection/connection-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/element/element-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/dragdrop/dragdrop-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/yahoo-dom-event/yahoo-dom-event.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/yahoo/yahoo-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/utilities/utilities.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/calendar/calendar-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/event-delegate/event-delegate-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/yui/resize/resize-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <script src="/studio/static-assets/components/cstudio-common/common-api.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/jquery/dist/jquery-3.4.1.min.js"></script><#--File names have version info & not changed across builds. No need for cache buster.-->
  <script src="/studio/static-assets/libs/jquery-ui/jquery-ui-1.12.1.min.js"></script>
  <script src="/studio/static-assets/yui/bubbling.v1.5.0-min.js?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/javascript"></script>
  <script src="/studio/static-assets/libs/css-element-queries/ElementQueries.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/css-element-queries/ResizeSensor.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/bootstrap/js/bootstrap.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/datetimepicker/jquery.datetimepicker.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <#outputformat "HTML">
  <script>document.domain = "${cookieDomain}";</script>
  </#outputformat>

</#if>

<link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico?version=${UIBuildId!.now?string('Mddyyyy')}">
