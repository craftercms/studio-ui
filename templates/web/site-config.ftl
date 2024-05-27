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

<#if (envConfig.role! == 'admin' || envConfig.role! == 'developer')>
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="/studio/static-assets/img/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>${contentModel['internal-name']} - ${contentModel['common-title']!''}</title>
    <style>body { overflow: hidden }</style>
  </head>
  <body>
  <div id="root"></div>
  <#include "/static-assets/app/legacy.html">
  <script>
    document.addEventListener("DOMLegacyReady", () => {
      CrafterCMSNext.render('#root', 'SiteTools', {
        footerHtml: '${applicationContext.get("crafter.entitlementValidator").getDescription()}'
      }, false);
    });
  </script>
  </body>
  </html>
<#else>
  <script>window.location.href = '/studio';</script>
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
</#if>.
