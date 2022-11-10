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

<#if (envConfig.role! == 'admin' || envConfig.role! == 'developer')>
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <#include "/templates/web/common/page-fragments/head.ftl" />

    <meta charset="utf-8"/>
    <title>Crafter CMS - Site Config</title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/console.css?version=${UIBuildId!.now?string('Mddyyyy')}" />

    <script type="text/javascript" src="/studio/static-assets/modules/editors/tinymce/v5/tinymce/tinymce.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/modules/editors/tinymce/v2/tiny_mce/tiny_mce.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/amplify-core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-admin/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#include "/templates/web/common/page-fragments/studio-context.ftl" />
    <#include "/templates/web/common/page-fragments/context-nav.ftl" />

    <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2000-2030.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

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
<#else>
  <script>window.location.href = '/studio'</script>
  <style>
    body {
      text-align: center;
      font-family: sans-serif;
    }
  </style>
  <noscript>
    <h1>Access Denied</h1>
    <p>You don't have the necessary permissions to access this page.</p>
  </noscript>
</#if>
