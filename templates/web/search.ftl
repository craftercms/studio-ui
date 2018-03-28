<#assign mode = RequestParameters["mode"] />
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>


   <title>Crafter Studio</title>


    <#include "/templates/web/common/page-fragments/studio-context.ftl" />
    <#include "/templates/web/common/page-fragments/head.ftl" />

     <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
   
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/search.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/results/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript" src="/studio/static-assets/yui/calendar/calendar-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/yui/assets/skins/sam/calendar.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/search.css?version=${UIBuildId!.now?string('Mddyyyy')}" />

  <!-- filter templates -->
   <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/common.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
   <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/javascript.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/css.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/image.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/xhtml.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/flash.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/filters/content-type.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

  <!-- result templates -->
   <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/results/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/results/image.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
       <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/results/flash.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
   <link href="/studio/static-assets/themes/cstudioTheme/css/icons.css?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/css" rel="stylesheet">
   <link href="/studio/static-assets/yui/container/assets/container.css?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/css" rel="stylesheet">


    <#if mode == "act">
      <#include "/templates/web/common/page-fragments/context-nav.ftl" />
    </#if>


    <script>
      CMgs = CStudioAuthoring.Messages;
      langBundle = CMgs.getBundle("search", CStudioAuthoringContext.lang);
      formsLangBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
      siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
    </script>

</head>

<body class="yui-skin-cstudioTheme">

   <div class="sticky-wrapper">
<div id="global_x002e_cstudio-search">
    <div id="global_x002e_cstudio-search_x0023_default">

  <div id="cstudio-wcm-search-wrapper"> 
    <div id="cstudio-wcm-search-main">        
      
      <h1 id="cstudio-wcm-search-search-title" class="cstudio-wcm-searchResult-header"></h1>
      <div id="cstudio-wcm-search-filter-controls"></div>   
      <div style="clear:both;"></div>
      <br />
      <div class="form-group">
          <label><script>CMgs.display(langBundle, "keywordsLabel")</script></label>
          <br />
          <input type="text" name="keywords" id="cstudio-wcm-search-keyword-textbox" class="form-control" value="${RequestParameters["s"]!''}" autofocus="autofocus" />

          <input type="hidden" id="cstudio-wcm-search-presearch"  value="true" />
      </div>
            
      <button id="cstudio-wcm-search-button" class="btn btn-primary" ><script>CMgs.display(langBundle, "searchButtonLabel")</script></button>

      <div class="panel panel-default">
          <div id="cstudio-wcm-search-result-header" class="panel-heading">
            <div id="cstudio-wcm-search-result-header-container">
              <span class="cstudio-wcm-search-result-header"><script>CMgs.display(langBundle, "searchResults")</script></span>
              <span id="cstudio-wcm-search-message-span"></span>
              <span id="cstudio-wcm-search-result-header-count"></span>

              <div class="filters">
                <div class="cstudio-wcm-search-result-header-pagination">
                  <script>CMgs.display(langBundle, "show")</script>:<input type="text"
                        class="form-control cstudio-wcm-search-result-header-pagination-textbox"
                        maxlength="3"
                        value="20"
                        id="cstudio-wcm-search-item-per-page-textbox"
                        name="total"/>
                </div>
                <div class="cstudio-wcm-search-result-header-sort">
                  <script>CMgs.display(langBundle, "sort")</script>:<select id="cstudio-wcm-search-sort-dropdown" name="sortBy" class="form-control">
                  <!-- items added via ajax -->
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div id="cstudio-wcm-search-result">
             <div id="cstudio-wcm-search-result-in-progress" class="cstudio-wcm-search-result-in-progress-img"></div>
            &nbsp;
          </div>

          <div class="cstudio-wcm-search-pagination">
            <div id="cstudio-wcm-search-pagination-controls"></div>
          </div>
      </div>
    

    </div>
  </div>  
    </div>

</div>  

    <#if mode == "select" >
      <div id="cstudio-command-controls"></div>
    </#if>

       </div>


</body>
</html>