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
  <#include "/static-assets/app/pages/project-tools.html">
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
