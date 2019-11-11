<#assign locale = 'en'/>
<#assign user = '' />

<#if username??>
    <#assign user = username />
<#elseif envConfig?? && envConfig.user??>
    <#assign user = envConfig.user />
</#if>

<#if user?has_content && cookies['${user}_crafterStudioLanguage']?has_content>
    <#assign locale = cookies['${user}_crafterStudioLanguage']/>
<#elseif cookies['crafterStudioLanguage']?has_content>
    <#assign locale = cookies['crafterStudioLanguage']/>
</#if>

<script id="localeJSON" type="application/json" locale="${locale}">
  <#include "/static-assets/next/locales/${locale}.json"/>
</script>
