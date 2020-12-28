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
  <#include "/templates/web/common/page-fragments/head.ftl" />
  <#include "/templates/web/common/page-fragments/studio-context.ftl" />

</head>

<body>
  <#if RequestParameters.mode?exists && mode == 'select'>
    <#assign embedded = true />
  </#if>
  <div id="root" style="height: calc(100vh<#if embedded?exists> - 60px</#if>)"></div>

  <script>
    <#if embedded?exists>
    const opener = window.opener ? window.opener : parent.iframeOpener;
    const searchId = CStudioAuthoring.Utils.getQueryVariable(document.location.search, 'searchId');
    const openerChildSearchMgr = opener.CStudioAuthoring.ChildSearchManager;
    const searchConfig = openerChildSearchMgr.searches[searchId];
    const callback = searchConfig.saveCallback;
    const closeSearch = () => {
      window.close();
      $(window.frameElement.parentElement)
        .closest('.studio-ice-dialog')
        .parent()
        .remove();
    }
    </#if>

    CrafterCMSNext.render('#root', 'Search', {
      embedded: <#if embedded?exists>true<#else>false</#if>,
      mode: <#if embedded?exists>'select'<#else>'default'</#if>,
      <#if embedded?exists>
      onAcceptSelection: (selectedItems) => {
        callback.success('', selectedItems);
        closeSearch();
      },
      onClose: closeSearch
      </#if>
    }, false);
  </script>
</body>
</html>
