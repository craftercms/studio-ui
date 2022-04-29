<!--
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

<#if RequestParameters.mode?? && RequestParameters.mode == "next">
    <#assign next = true />
<#else>
    <#assign next = false />
</#if>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="theme-color" content="#000000"/>
  <title>${contentModel['internal-name']} - ${contentModel['common-title']!''}</title>
</head>
<body>
<div id="toolbar"></div>
<div id="root"></div>
<#include "/templates/web/common/js-next-scripts.ftl" />
<script src="/studio/static-assets/libs/monaco/monaco.0.20.0.js" async defer></script>
<script>
  (function (CrafterCMSNext) {
    const { createElement } = craftercms.libs.React;
    const { Typography, Box } = craftercms.libs.MaterialUI;
    const { ViewToolbar, LauncherOpenerButton } = CrafterCMSNext.components;
    const CrafterCMSIcon = craftercms.components.get('craftercms.icons.CrafterCMSIcon');
    function DashboardImprovisedToolbar() {
      return createElement(
        ViewToolbar,
        {},
        createElement(Box, { sx: { display: 'flex', alignItems: 'center' } },
          createElement(CrafterCMSIcon, { style: { marginRight: '5px' } }, 'Site Dashboard'),
          createElement(Typography, { variant: 'h5' }, 'Site Dashboard')
        ),
        createElement(LauncherOpenerButton, { siteRailPosition: 'left', icon: 'apps' })
      );
    }
    CrafterCMSNext.render('#toolbar', DashboardImprovisedToolbar, {}, false);
    CrafterCMSNext.render('#root', "${next?then('SiteDashboard', 'LegacySiteDashboard')}", {}, false);
  })(CrafterCMSNext);
</script>
</body>
</html>
