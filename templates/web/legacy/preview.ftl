<!DOCTYPE html>
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
    window.IS_LEGACY_TOP_WINDOW = true;
  </script>
  <title>${contentModel['internal-name']} - ${contentModel['common-title']!''}</title>

  <#include "/templates/web/common/page-fragments/head.ftl" />
  <link rel="stylesheet" type="text/css" href= "/studio/static-assets/styles/dark-mode.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
  <script src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/components/cstudio-common/resources/de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <#include "/templates/web/common/page-fragments/studio-context.ftl" />
  <script>CStudioAuthoringContext.isPreview = true</script>
  <#include "/templates/web/common/page-fragments/context-nav.ftl" />

  <script>
    CMgs = CStudioAuthoring.Messages;
    langBundle = CMgs.getBundle("siteDashboard", CStudioAuthoringContext.lang);
    formsLangBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
    previewLangBundle = CMgs.getBundle("previewTools", CStudioAuthoringContext.lang);
    siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
  </script>

  <script>window.entitlementValidator = '${applicationContext.get("crafter.entitlementValidator").getDescription()}';</script>

  <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/communicator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/scripts/host.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
  <script src="/studio/static-assets/libs/momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

</head>
<body>

<div class="studio-preview">
  <iframe id="engineWindow"></iframe>
</div>

</body>
</html>
