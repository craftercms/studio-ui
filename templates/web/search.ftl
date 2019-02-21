<#--  <#assign mode = RequestParameters["mode"] />  -->
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
    <script src="/studio/static-assets/libs/handlebars/handlebars.js"></script>
    <#include "/templates/web/common/page-fragments/head.ftl" />

    <#-- Lang resources -->
    <#assign path="/studio/static-assets/components/cstudio-common/resources/" />
    <script src="${path}en/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}kr/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}es/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}de/base.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#assign path="/studio/static-assets/libs/" />
    <script src="${path}momentjs/moment.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="${path}momentjs/moment-timezone-with-data-2012-2022.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <#include "/templates/web/common/page-fragments/studio-context.ftl" />
    <#include "/templates/web/common/page-fragments/context-nav.ftl" />

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>    
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/yui/assets/skins/sam/calendar.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/search.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script src="/studio/static-assets/libs/bootstrap/js/bootstrap.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/simpleBootstrapPaginator/simple-bootstrap-paginator.min.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script type="text/javascript" src="/studio/static-assets/components/cstudio-search/search.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

    <script>
        CMgs = CStudioAuthoring.Messages;
        langBundle = CMgs.getBundle("search", CStudioAuthoringContext.lang);
        formsLangBundle = CMgs.getBundle("forms", CStudioAuthoringContext.lang);
        siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);
    </script>

    <script>window.entitlementValidator = '${applicationContext.get("crafter.entitlementValidator").getDescription()}';</script>
</head>

<body class="yui-skin-cstudioTheme">
    <section class="cstudio-search">
        <div class="search-bar row">
            <div class="col-md-12">
                <form>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search" id="searchInput"/>
                        <div class="input-group-btn">
                            <button class="btn btn-primary" type="submit">
                                <span class="glyphicon glyphicon-search"></span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="options row">
            <div class="col-md-12">
                <span class="bold">Number of Results:</span> <span id="searchNumResults" class="num-results bold"></span>

                <div class="pull-right">
                    <div class="view-selector btn-group" role="group" aria-label="...">
                        <button type="button" data-view="list" class="btn btn-default"><i class="fa fa-th-list" aria-hidden="true"></i></button>
                        <button type="button" data-view="grid" class="btn btn-default active"><i class="fa fa-th-large" aria-hidden="true"></i></button>
                    </div>

                    <div id="searchFilters" class="filters dropdown">
                        <button class="btn btn-default dropdown-toggle" type="button" id="searchDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            Filters <span id="numFilters"></span>
                            <span class="caret"></span>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="searchDropdown">
                            <div class="sort">
                                <li class="dropdown-header main-header" id="sortOrder">Sort Order</li>
                                <li class="filter-item">
                                    <a href="#">
                                        <input type="radio" name="sortOrder" value="asc" id="asc">
                                        <label for="asc">Asc</label>
                                    </a>
                                </li>
                                <li class="filter-item">
                                    <a href="#">
                                        <input type="radio" name="sortOrder" value="desc" id="desc">
                                        <label for="desc">Desc</label>
                                    </a>
                                </li>

                                <li class="dropdown-header main-header" id="sortBy">Sort By</li>
                                <li class="filter-item">
                                    <a href="#">
                                        <input type="radio" name="sortBy" value="internalName" id="internalName">
                                        <label for="internalName">Name</label>
                                    </a>
                                </li>
                            </div>
                            
                            <div class="sort-dinam"></div>
                            <div class="images"></div>
                            <div class="videos"></div>
                            <div class="other"></div>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-12 mt10 mb15">
                <label class="checkbox-container select-all-container mb15 mr10">
                    <input type="checkbox" class="search-select-all" id="searchSelectAll" />
                    <span class="checkmark"></span>
                </label> 
                <label for="searchSelectAll" style="cursor: pointer;">Select All</label>
            </div>
        </div>

        <div class="results">
            
        </div>

        <div class="pagination-container">
            <div id="resultsPagination" class="text-center"></div>
        </div>

    </section>

    <script id="hb-search-result" type="text/x-handlebars-template">
        <div class="result-container">
            <div class="result card clearfix">
                <div class="result-preview {{#if asset}}result-asset{{/if}} {{#if previewable}}previewable{{/if}}" data-url="{{ path }}">
                    {{#equal type "Page"}}
                        <img class="preview-img" src="http://localhost:8080/studio/api/1/services/api/1/content/get-content-at-path.bin?site=editorial&path=/config/studio/content-types/page/home/page-home.png"/>
                    {{/equal}}

                    {{#equal type "Component"}}
                        <img class="preview-img" src="http://localhost:8080/studio/api/1/services/api/1/content/get-content-at-path.bin?site=editorial&path=/config/studio/content-types/component/feature/component-feature.png"/>
                    {{/equal}}

                    {{#equal type "Taxonomy"}}
                        <img class="preview-img" src="http://localhost:8080/studio/api/1/services/api/1/content/get-content-at-path.bin?site=editorial&path=/config/studio/content-types/taxonomy/taxonomy.png"/>
                    {{/equal}}

                    {{#equal type "Image"}}
                        <img class="preview-img" src="{{ path }}"/>
                    {{/equal}}

                    <i class="result-icon fa {{ icon }} {{#if asset}}result-asset{{/if}}" aria-hidden="true"></i>

                    <div class="result-info">
                        <div class="bold">{{ name }}</div>
                        <div>{{ type }}</div>
                    </div>
                </div>
                <div class="actions">
                    {{#if editable}}
                    <a class="action search-edit" href="#" data-url="{{ path }}"><i class="fa fa-pencil" aria-hidden="true"></i></a>
                    {{/if}}
                    <a class="action search-delete" href="#" data-url="{{ path }}"><i class="fa fa-trash-o" aria-hidden="true"></i></a>

                    <label class="checkbox-container">
                        <input type="checkbox" class="search-select-item" data-url="{{ path }}" value="None" id="squaredFour" name="check" />
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>
        </div>
    </script>

    <script id="hb-filter-section" type="text/x-handlebars-template">
        <li class="dropdown-header {{#if main}}main-header{{/if}}" id="{{ value }}">
            {{ label }}
            {{#if clear}}<a class="clear-filter">Clear</a>{{/if}}    
        </li>
    </script>

    <script id="hb-filter-separator" type="text/x-handlebars-template">
        <li role="separator" class="divider"></li>
    </script>

    <script id="hb-filter-item" type="text/x-handlebars-template">
        <li class="filter-item">
            <a href="#">
                <input type="radio" name="{{ name }}" value="{{ value }}" id="{{ id }}" class="{{#if filter}}filter{{/if}}">
                <label for="{{ id }}">{{ label }}</label>
            </a>
        </li>
    </script>

    <script type="text/javascript">
        Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if( lvalue!=rvalue ) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        });

        $(function() {
            CStudioSearch.init();
        });

    </script>
</body>
</html>