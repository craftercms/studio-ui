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

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<#include "/templates/system/common/versionInfo.ftl" />
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Crafter Studio</title>
    <script>
        window.UIBuildId = "${UIBuildId!.now?string('Mddyyyy')}";
    </script>

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <link rel="stylesheet" href="/studio/static-assets/themes/cstudioTheme/css/forms-default.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <link rel="stylesheet" href="/studio/static-assets/styles/forms-engine.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>

    <#include "/templates/web/common/page-fragments/head.ftl" />
    <#include "/templates/web/common/page-fragments/studio-context.ftl" />

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/yui/assets/rte.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
    <script type="text/javascript" src="/studio/static-assets/modules/editors/tiny_mce/tiny_mce.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/amplify-core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-forms/forms-engine.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script src="/studio/static-assets/scripts/communicator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/jquery/dist/jquery.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/jquery-ui/jquery-ui.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
     <script src="/studio/static-assets/components/cstudio-components/loader.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script>document.domain = "${Request.serverName}";</script> <!-- blah blah -->
    
</head>

<body class="yui-skin-cstudioTheme">

<header style="display: none;">
    <hgroup>
        <div class="page-header">
            <div class="container">
                <h1>
                    <span class="header"></span>
                    <div>
                        <small class="name"></small>
                        <small class="location"></small>
                    </div>
                </h1>
                <p class="page-description"></p>
            </div>
        </div>
    </hgroup>
    <div class="container">
        <a id="cstudio-form-expand-all" href="javascript:"></a> |
        <a id="cstudio-form-collapse-all" href="javascript:"></a>
    </div>
</header>

<div id="formContainer"></div>

<script>
    YAHOO.util.Event.onDOMReady(function() {
        var formId = CStudioAuthoring.Utils.getQueryVariable(location.search, "form");
        CStudioForms.engine.render(formId, "default", "formContainer");
    });
</script>

</body>
</html>
