<#--  <#assign mode = RequestParameters["mode"] />  -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

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

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${contentModel['internal-name']} - ${contentModel['common-title']!''}</title>

  <script src="/studio/static-assets/libs/jquery/dist/jquery.js"></script>
  <script src="/studio/static-assets/libs/handlebars/handlebars.js"></script>
  <#include "/templates/web/common/page-fragments/head.ftl" />
  <#include "/templates/web/common/page-fragments/studio-context.ftl" />

  <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/search.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
  <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/search.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

</head>

<body>
  <#if RequestParameters.mode?exists && mode == 'select'>
    <#assign embedded = true />
  </#if>
  <div id="root" style="height: calc(100vh <#if embedded?exists>- 64px</#if>);"></div>

  <div id="cstudio-command-controls-container"></div>

  <script id="hb-command-controls" type="text/x-handlebars-template">
    <div id="cstudio-command-controls">
      <div id="submission-controls" class="cstudio-form-controls-button-container">
        <input
          id="formSaveButton" type="button"
          class="cstudio-search-btn cstudio-button btn btn-primary" value="Add Selection"
          disabled
        >
        <input
          id="formCancelButton" type="button"
          class="cstudio-search-btn cstudio-button btn btn-default" value="Cancel"
        >
      </div>
    </div>
  </script>

  <script type="text/javascript">
    CStudioSearch.init();
  </script>

  <script>
    CrafterCMSNext.render('#root', 'Search', {
      embedded: <#if embedded?exists>true<#else>false</#if>,
      onSelect: CStudioSearch.changeSelectStatus
    }, false);
  </script>
</body>
</html>
