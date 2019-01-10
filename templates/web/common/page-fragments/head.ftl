<#include "/templates/system/common/versionInfo.ftl" />
<#if envConfig.site?? == false || envConfig.site == "">
<!--
  ~ Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License as published by
  ~ the Free Software Foundation, either version 3 of the License, or
  ~ (at your option) any later version.
  ~
  ~ This program is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  ~ GNU General Public License for more details.
  ~
  ~ You should have received a copy of the GNU General Public License
  ~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -->

<meta http-equiv="refresh" content="0;URL='/studio/user-dashboard/#/sites/all'" />
<#else>

<script>
    window.UIBuildId = "${UIBuildId!.now?string('Mddyyyy')}";
</script>

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
<script src="/studio/static-assets/libs/jquery/dist/jquery.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
<script src="/studio/static-assets/libs/jquery-ui/jquery-ui.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
<script src="/studio/static-assets/yui/bubbling.v1.5.0-min.js?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/javascript"></script>
<script src="/studio/static-assets/libs/css-element-queries/ElementQueries.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
<script src="/studio/static-assets/libs/css-element-queries/ResizeSensor.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>


<script>document.domain = "${cookieDomain}";</script>

</#if>

<link rel="shortcut icon" href="/studio/static-assets/img/favicon.png">