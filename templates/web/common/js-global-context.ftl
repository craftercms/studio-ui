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

<#assign loggedIn = ((userEmail?? && userEmail != "") || (envConfig??))/>
<#assign env_config = envConfig???then(envConfig + _csrf, {})/>
<#if !(userService??)>
  <div style="padding: 1em; text-align: center">
    <h1>The freemarker context is not undefined.</h1>
    <p>The system won't work as expected.</p>
  </div>
<#else>
<script id="initialStateWriter">
(function (origin) {
  const initialState = JSON.stringify({
    "auth": {
      "active": ${loggedIn?c}
    },
    <#if loggedIn>
    <#assign user = userService.getCurrentUser()/>
    <#assign sites = userService.getCurrentUserSites()/>
    "user": {
      "firstName": "${user.firstName!""}",
      "lastName": "${user.lastName!""}",
      "email": "${user.email!""}",
      "username": "${user.username!""}",
      "authType": "${user.authenticationType!""}",
      "rolesBySite": {
        <#list sites as site>
        <#if site.siteId??>
        "${site.siteId}": [
          <#assign roles = userService.getCurrentUserSiteRoles(site.siteId)/>
          <#list roles as role>
          "${role}"<#sep>,</#sep>
          </#list>
        ]<#sep>,</#sep>
        </#if>
        </#list>
      },
      "sites": [
        <#list sites as site>
        "${site.siteId!""}"<#sep>,</#sep>
        </#list>
      ],
      "preferences": {
        "global.lang": "en",
        "global.theme": "light",
        "preview.theme": "dark"
      }
    },
    "sites": {
      "active": null,
      "byId": {
        <#list sites as site>
        "${site.siteId!""}": {
          "id": "${site.siteId!""}",
          "name": "${site.siteId!""}",
          "description": "${(site.desc!"")?json_string}"
        }<#sep>,</#sep>
        </#list>
      }
    },
    </#if>
    "env": {
      "authoringBase": `${'$'}{origin}/studio`,
      "guestBase": `${'$'}{origin}`,
      "xsrfHeader": "${env_config.headerName!''}",
      "xsrfArgument": "${env_config.parameterName!''}",
      'siteCookieName': 'crafterSite',
      'previewLandingBase': '/studio/preview-landing',
      'version': null
    }
  });
  document.write(`<script type="application/json" id="initialState">${'$'}{initialState}<\/script>`);
})(window.location.origin);
</script>
</#if>
