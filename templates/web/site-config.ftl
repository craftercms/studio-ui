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

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<#include "/templates/web/common/page-fragments/head.ftl" />

    <title>Crafter Studio</title>

    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/console.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
         <script src="/studio/static-assets/modules/editors/tiny_mce/tiny_mce.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>


    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/amplify-core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-admin/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#include "/templates/web/common/page-fragments/studio-context.ftl" />
    <#include "/templates/web/common/page-fragments/context-nav.ftl" />

    <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/communicator.js?version=${UIBuildId!.now?string('Mddyyyy')}" ></script>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script>
        CMgs = CStudioAuthoring.Messages;
        langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);
        formsLangBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
    </script>

    <script>window.entitlementValidator = '${applicationContext.get("crafter.entitlementValidator").getDescription()}';</script>

</head>

<body class="yui-skin-cstudioTheme">
<div id="admin-console" class="categories-panel-active"></div>
</body>
</html>