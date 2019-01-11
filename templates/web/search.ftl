<#assign mode = RequestParameters["mode"] />
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<!--
  ~ Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
  ~
  ~ This program is free software: you can redistribute it and/or modify
  ~ it under the terms of the GNU General Public License as published by
  ~ the Free Software Foundation, either version 3 of the License, or
  ~ (at your option) any later version.
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


    <title>Crafter Studio</title>


<script src="/studio/static-assets/libs/jquery/dist/jquery.js"></script>
<#include "/templates/web/common/page-fragments/studio-context.ftl" />
<#include "/templates/web/common/page-fragments/head.ftl" />

    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-common/resources/en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-common/resources/kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-common/resources/es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-search/search.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-search/results/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript"
            src="/studio/static-assets/yui/calendar/calendar-min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <link rel="stylesheet" type="text/css"
          href="/studio/static-assets/yui/assets/skins/sam/calendar.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <link rel="stylesheet" type="text/css"
          href="/studio/static-assets/themes/cstudioTheme/css/search.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <!-- filter templates -->
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-search/filters/common.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-search/filters/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <!-- result templates -->
    <script type="text/javascript"
            src="/studio/static-assets/components/cstudio-search/results/default.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <link href="/studio/static-assets/themes/cstudioTheme/css/icons.css?version=${UIBuildId!.now?string('Mddyyyy')}"
          type="text/css" rel="stylesheet">
    <link href="/studio/static-assets/yui/container/assets/container.css?version=${UIBuildId!.now?string('Mddyyyy')}"
          type="text/css" rel="stylesheet">


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

<div class="sticky-wrapper general-view">
    <div id="global_x002e_cstudio-search">
        <div id="global_x002e_cstudio-search_x0023_default">

            <div id="cstudio-wcm-search-wrapper">
                <div id="cstudio-wcm-search-main">

                    <h1 id="cstudio-wcm-search-search-title" class="cstudio-wcm-searchResult-header"></h1>

                    <div id="cstudio-wcm-search-filter-controls"></div>
                    <div style="clear:both;"></div>
                    <br/>

                    <div class="form-group">
                        <label>
                            <script>CMgs.display(langBundle, "keywordsLabel")</script>
                        </label>
                        <br/>
                        <input type="text" name="keywords" id="cstudio-wcm-search-keyword-textbox" class="form-control"
                               value="${RequestParameters["s"]!''}" autofocus="autofocus"/>

                        <input type="hidden" id="cstudio-wcm-search-presearch" value="true"/>
                    </div>

                    <button id="cstudio-wcm-search-button" class="btn btn-primary">
                        <script>CMgs.display(langBundle, "searchButtonLabel")</script>
                    </button>

                    <div class="panel panel-default">
                        <div id="cstudio-wcm-search-result-header" class="panel-heading">
                            <div id="cstudio-wcm-search-result-header-container">
                                <span class="cstudio-wcm-search-result-header"><script>CMgs.display(langBundle, "searchResults")</script></span>
                                <span id="cstudio-wcm-search-message-span"></span>
                                <span id="cstudio-wcm-search-result-header-count"></span>

                                <div class="filters">
                                    <div class="cstudio-wcm-search-result-header-pagination">
                                        <script>CMgs.display(langBundle, "show")</script>
                                        :<input type="text"
                                                class="form-control cstudio-wcm-search-result-header-pagination-textbox"
                                                maxlength="3"
                                                value="20"
                                                id="cstudio-wcm-search-item-per-page-textbox"
                                                name="total"/>
                                    </div>
                                    <div class="cstudio-wcm-search-result-header-sort">
                                        <script>CMgs.display(langBundle, "sort")</script>
                                        :<select id="cstudio-wcm-search-sort-dropdown" name="sortBy"
                                                 class="form-control">
                                        <!-- items added via ajax -->
                                    </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="cstudio-wcm-search-result">
                            <div id="cstudio-wcm-search-result-in-progress"
                                 class="cstudio-wcm-search-result-in-progress-img"></div>
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

<div class="footer-general">
    <section class="footer-body">
        <p class="entitlementValidator">${applicationContext.get("crafter.entitlementValidator").getDescription()}</p>
        <img class="crafter-studio-logo" alt="Crafter Studio" ng-src="/studio/static-assets/images/crafter_studio_360.png" src="/studio/static-assets/images/crafter_studio_360.png">
    </section>
</div>


</body>
</html>