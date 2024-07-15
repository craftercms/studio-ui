<#assign mode = RequestParameters["mode"]!"" />
<#assign ui = RequestParameters["ui"]!"" />
<!DOCTYPE html>
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

<html>
<head>

  <#include "/templates/web/common/page-fragments/head.ftl" />

  <title>Crafter Studio</title>
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/global.css" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/forms-default.css" />
  <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/forms-engine.css" />

  <link href="/studio/static-assets/themes/cstudioTheme/css/icons.css" type="text/css" rel="stylesheet">
  <link href="/studio/static-assets/yui/container/assets/container.css" type="text/css" rel="stylesheet">

  <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
  <script src="${path}en/base.js"></script>
  <script src="${path}ko/base.js"></script>
  <script src="${path}es/base.js"></script>
  <script src="${path}de/base.js"></script>

  <#include "/templates/web/common/page-fragments/studio-context.ftl" />

  <script>
    var CMgs = CStudioAuthoring.Messages;
    var siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
  </script>
  <script>
    if (CStudioAuthoring) {
      CStudioAuthoring.cookieDomain = "${cookieDomain}";
    } else {
      CStudioAuthoring = {
        cookieDomain: "${cookieDomain}"
      };
    }
  </script>

  <link rel="stylesheet" type="text/css" href="/studio/static-assets/css/diff.css" />

</head>
<body class="yui-skin-cstudioTheme skin-diff">

<#if mode != "iframe">
  <div id="studioBar" class="studio-view">
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="/studio/site-dashboard">
            <img src="/studio/static-assets/images/logo.svg" alt="CrafterCMS">
          </a>
        </div>
      </div>
    </nav>
  </div>
</#if>

<hgroup>
  <div class="page-header <#if mode != 'iframe'>with-navbar</#if>">
    <div class="container">
      <h1>
        <span class="content-name">${dir} </span>
        <div>
          <#if versionTO??>
            <#if version == versionTO>
              <small>v.${version}</small>
            <#else>
              <small>v.${version} - v.${versionTO}</small>
            </#if>
          <#else>
            <small id="current-version">v.${version} - v.</small><small> (current)</small>
          </#if>
        </div>
      </h1>
    </div>
  </div>
</hgroup>

<style>

</style>

<div class="container <#if mode == "iframe">as-dialog</#if>">
  <div class="content">${diff}</div>
</div>

<#if mode == "iframe" && ui != "next">
  <div class="cstudio-form-controls-container">
    <div class="cstudio-form-controls-button-container">
      <input id="cancelBtn" class="btn btn-default" type="button" value="Close">
    </div>
  </div>
</#if>

<#include "/static-assets/app/pages/legacy.html">
<script>
  const init = () => {
    window.craftercms.store$().subscribe(() => {
      CStudioAuthoring.Service.getCurrentVersion(CStudioAuthoringContext.site, "${dir}", {
        success: function(version) {
          $('#current-version').append(version)
        }
      });
    });
    $('#cancelBtn').on('click', function() {
      parent.$('body').trigger('diff-end');
    });

    $(document).on("keyup", function(e) {
      if (e.keyCode === 27) {	// esc
        parent.$('body').trigger('diff-end');
        $(document).off("keyup");
      }
    });

    $(window).focus();
  };
  if (window.craftercms?.store$) {
    init();
  } else {
    document.addEventListener("CrafterCMS.CodebaseBridgeReady", init);
  }
</script>

</body>
</html>
