<!--
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

<#include "/templates/system/common/versionInfo.ftl" />

<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

  <meta charset="utf-8"/>
  <title>Crafter CMS - Content Form</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>

  <link rel="stylesheet" href="/studio/static-assets/themes/cstudioTheme/css/forms-default.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
  <link rel="stylesheet" href="/studio/static-assets/styles/forms-engine.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>

  <#include "/templates/web/common/page-fragments/head.ftl" />
  <#include "/templates/web/common/page-fragments/studio-context.ftl" />

  <script src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/yui/assets/rte.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/tinymce-ace.css?version=${UIBuildId!.now?string('Mddyyyy')}" />

  <script src="/studio/static-assets/libs/ace/ace.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/modules/editors/tinymce/v5/tinymce/tinymce.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/modules/editors/tinymce/v2/tiny_mce/tiny_mce.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/notify/notify.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script>CStudioAuthoring.Module.moduleLoaded("publish-subscribe", {});</script>

  <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-forms/forms-engine.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-components/loader.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <script>document.domain = "${Request.serverName}";</script>

</head>

<body class="yui-skin-cstudioTheme form-engine-body">

<header id="formHeader" style="display: none; overflow: hidden">
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
    <a id="cstudio-form-expand-all" class="btn btn-default btn-sm" href="javascript:"></a>
    <a id="cstudio-form-collapse-all" class="btn btn-default btn-sm" href="javascript:"></a>
  </div>
</header>

<div id="formContainer">
  <div style="display: flex; height: 100%; align-items: center">
    <div style="width: 100%; text-align: center;"><i class="fa fa-spinner fa-spin fa-3x fa-fw loading"></i></div>
  </div>
</div>

<script>
  CStudioForms.engine.render(null, "default", "formContainer");
</script>

</body>
</html>
