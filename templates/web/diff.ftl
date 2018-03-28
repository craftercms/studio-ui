<#assign mode = RequestParameters["mode"]!"" />
<!DOCTYPE html>
<html>
<head>

    <#include "/templates/web/common/page-fragments/head.ftl" />

    <title>Crafter Studio</title>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/global.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/themes/cstudioTheme/css/forms-default.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/forms-engine.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
   
   <link href="/studio/static-assets/themes/cstudioTheme/css/icons.css?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/css" rel="stylesheet">
   <link href="/studio/static-assets/yui/container/assets/container.css?version=${UIBuildId!.now?string('Mddyyyy')}" type="text/css" rel="stylesheet">

    <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
    <script src="${path}en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#include "/templates/web/common/page-fragments/studio-context.ftl" />

    <script>
        var CMgs = CStudioAuthoring.Messages,
                siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
    </script>


    <script>
        if(CStudioAuthoring){
            CStudioAuthoring.cookieDomain = "${cookieDomain}";
        }else{
            CStudioAuthoring = {
                cookieDomain: "${cookieDomain}"
            }    
        }        
    </script>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/css/diff.css?version=${UIBuildId!.now?string('Mddyyyy')}" />
</head>
<body class="yui-skin-cstudioTheme skin-diff">
    <#if mode != "iframe">
    <div id="studioBar" class="studio-view">
       <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="/studio/site-dashboard">
                        <img src="/studio/static-assets/images/crafter_studio_360.png" alt="Crafter Studio">
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

    <div class='container <#if mode == "iframe">as-dialog</#if>'> 
        <div class='content'>${diff}</div>
    </div>

    <#if mode == "iframe">
    <div class="cstudio-form-controls-container">
        <div class="cstudio-form-controls-button-container">
            <input id="cancelBtn" class="btn btn-default" type="button" value="Close">
        </div>
    </div>
    </#if>  

    <script>
        $(document).ready(function(){ 
            CStudioAuthoring.Service.getCurrentVersion(CStudioAuthoringContext.site, "${dir}", 
                { 
                    success: function(version) { 
                        $('#current-version').append(version)
                    } 
                } 
            );

            $('#cancelBtn').on('click', function() {
                parent.$('body').trigger('diff-end');
            })

            $(document).on("keyup", function(e) {
                if (e.keyCode === 27) {	// esc
                    parent.$('body').trigger('diff-end');
                    $(document).off("keyup");
                }
            });
        })
    </script>

</body>
</html>