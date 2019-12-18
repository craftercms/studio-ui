<#assign loggedIn = ((userEmail?? && userEmail != "") || (envConfig??))/>
<#assign env_config = envConfig???then(envConfig + _csrf, {})/>
<script type="application/json" id="initialState">
{
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
        "description": "${site.desc!""}"
      }<#sep>,</#sep>
    </#list>
    }
  },
  </#if>
  "env": {
    "AUTHORING_BASE": "${env_config.authoringServerUrl!"/studio"}",
    "GUEST_BASE": "${env_config.previewServerUrl!""}",
    "XSRF_CONFIG_HEADER": "${env_config.headerName!""}",
    "XSRF_CONFIG_ARGUMENT": "${env_config.parameterName!""}",
    "SITE_COOKIE": "crafterSite"
  }
}
</script>
