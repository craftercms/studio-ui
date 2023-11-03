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

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <title>${contentModel['internal-name']} - ${contentModel['common-title']!'CrafterCMS'}</title>
  <style>
    html, body, #root {
      margin: 0;
      padding: 0;
      height: 100%;
    }

    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
<div id="root"></div>
<#include "/templates/web/common/js-next-scripts.ftl" />
<script>
  (function(ui) {
    const ReactDOM = ui.ReactDOM;
    const createElement = ui.React.createElement;
    ReactDOM.render(
      createElement(
        ui.React.Suspense,
        { fallback: '' },
        createElement(CrafterCMSNext.components.Login, {
          <#outputformat "HTML">
          xsrfToken: '${_csrf.token}',
          xsrfParamName: '${_csrf.parameterName}',
          xsrfHeaderName: '${_csrf.headerName}',
          passwordRequirementsMinComplexity: ${passwordRequirementsMinComplexity},
          <#if errorMessage?? && lockedTimeSeconds??>
          lockedErrorMessage: '${errorMessage}',
          lockedTimeSeconds: ${lockedTimeSeconds?c}
          </#if>
          </#outputformat>
        })
      ),
      document.querySelector('#root')
    );
  })(CrafterCMSNext);
</script>
</body>
</html>
