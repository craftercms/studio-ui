<#--  <#assign mode = RequestParameters["mode"] />  -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

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

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Crafter Studio</title>

    <script src="/studio/static-assets/libs/jquery/dist/jquery.js"></script>
    <script src="/studio/static-assets/libs/handlebars/handlebars.js"></script>
    <#include "/templates/web/common/page-fragments/head.ftl" />

    <#-- Lang resources -->
    <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
    <script src="${path}en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#assign path="/studio/static-assets/libs/" />
    <script src="${path}momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#include "/templates/web/common/page-fragments/studio-context.ftl" />

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/yui/assets/skins/sam/calendar.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/search.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/components/cstudio-common/ace/ace.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/search.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script>
        CMgs = CStudioAuthoring.Messages;
        langBundle = CMgs.getBundle("search", CStudioAuthoringContext.lang);
        formsLangBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
        siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
    </script>

    <script>window.entitlementValidator = '${applicationContext.get("crafter.entitlementValidator").getDescription()}';</script>
</head>

<body>
    <section class="cstudio-search">
    </section>

    <div id="cstudio-command-controls-container"></div>

    <script id="hb-command-controls" type="text/x-handlebars-template">
      <div id="cstudio-command-controls">
        <div id="submission-controls" class="cstudio-form-controls-button-container">
          <input id="formSaveButton" type="button" class="cstudio-search-btn cstudio-button btn btn-primary" disabled="" value="Add Selection">
          <input id="formCancelButton" type="button" class="cstudio-search-btn cstudio-button btn btn-default" value="Cancel">
        </div>
      </div>
    </script>

    <script type="text/javascript">
        $(function() {
            CStudioSearch.init();
        });
    </script>
</body>
</html>
