<#--  <#assign mode = RequestParameters["mode"] />  -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<!--
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

    <script src="/studio/static-assets/scripts/crafter.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/scripts/animator.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/yui/assets/skins/sam/calendar.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <link rel="stylesheet" type="text/css" href="/studio/static-assets/styles/search.css?version=${UIBuildId!.now?string('Mddyyyy')}"/>
    <script src="/studio/static-assets/libs/js-cache/cache.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>
    <script src="/studio/static-assets/libs/amplify/lib/amplify.core.js?version=${UIBuildId!.now?string('Mddyyyy')}"></script>

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

<body>
    <section class="cstudio-search">
        <div class="search-bar row">
            <div class="col-md-12">
                <#--  <form>  -->
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search" id="searchInput" autofocus="autofocus" onfocus="this.select()"/>
                        <div class="input-group-btn">
                            <button class="btn btn-primary" id="searchButton">
                                <span class="glyphicon glyphicon-search"></span>
                            </button>
                        </div>
                    </div>
                <#--  </form>  -->
            </div>
        </div>

        <div class="options row">
            <div class="col-md-12">
                <span class="bold" data-trans="numResults">Number of Results</span>: <span id="searchNumResults" class="num-results bold"></span>

                <div class="pull-right">
                    <div class="view-selector btn-group" role="group" aria-label="...">
                        <button type="button" data-view="list" class="btn btn-default"><i class="fa fa-th-list" aria-hidden="true"></i></button>
                        <button type="button" data-view="grid" class="btn btn-default active"><i class="fa fa-th-large" aria-hidden="true"></i></button>
                    </div>

                    <div id="searchFilters" class="filters dropdown">
                        <button class="btn btn-default dropdown-toggle" type="button" id="searchDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            <span data-trans="filters">Filters</span> <span id="numFilters"></span>
                            <span class="caret"></span>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-right pr5 pl5" aria-labelledby="searchDropdown">
                            <div class="panel-group mb0" id="accordion" role="tablist" aria-multiselectable="true">
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="headingTwo">
                                        <h4 class="panel-title">
                                            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo"
                                               aria-expanded="true" aria-controls="collapseTwo"
                                               data-trans="sortBy">
                                                Sort By
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseTwo" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingTwo">
                                    <div class="panel-body">
                                        <li class="filter-item">
                                          <select class="sort-dropdown search-dropdown" name="sortBy"></select>
                                        </li>
                                    </div>
                                    <#--  Sort order  -->
                                    <div class="panel-footer subfilter">
                                        <h4 class="panel-title" data-trans="sortOrder">
                                            Sort Order
                                        </h4>
                                        <li class="filter-item">
                                          <select class="sort-dropdown search-dropdown" name="sortOrder">
                                          </select>
                                        </li>
                                    </div>
                                </div>
                            </div>

                            <div class="panel panel-default">
                              <div class="panel-heading" role="tab" id="headingPath">
                                <h4 class="panel-title">
                                  <a class="path-header-label" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapsePath"
                                     aria-expanded="false" aria-controls="collapsePath">
                                    <span data-trans="path">Path</span>
                                    <i class="fa fa-check-circle selected hide ml5" aria-hidden="true"></i>
                                  </a>
                                </h4>
                              </div>
                              <div id="collapsePath" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingPath">
                                <div class="panel-body">
                                  <li class="filter-item" filter-name="path">
                                    <input class="filter-path" id="filterPath" type="text" name="path">
                                    <button type="button" class="btn btn-primary apply-path mt5" data-trans="apply">Apply</button>
                                  </li>
                                </div>
                              </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-12 mt10 mb15 select-all-col">
                <label class="checkbox-container select-all-container mb15 mr10">
                    <input type="checkbox" class="search-select-all" id="searchSelectAll" />
                    <span class="checkmark"></span>
                </label>
                <label for="searchSelectAll" style="cursor: pointer;" data-trans="selectAll">Select All</label>
            </div>
        </div>

        <div class="results">

        </div>

        <div class="pagination-container">
            <div id="resultsPagination" class="text-center"></div>
        </div>

    </section>

    <div id="cstudio-command-controls-container"></div>

    <script id="hb-search-result" type="text/x-handlebars-template">
      <div class="result card clearfix">
        <label class="checkbox-container list-select">
          <input type="checkbox" class="search-select-item" data-url="{{ path }}" value="None" name="check" />
          <span class="checkmark"></span>
        </label>

        <div class="result-preview {{#if previewUrl}}{{else}}result-asset{{/if}} {{#if previewable}}previewable{{/if}} {{#equal type 'Image'}}no-preview-background{{/equal}}"
             data-url="{{ path }}" data-type="{{ type }}">
          {{#equal type "Image"}}
            <div class="img-container">
              <img class="preview-img" src="{{ path }}"/>
            </div>
          {{/equal}}

          {{#if previewUrl}}
            <div class="img-container">
              <img class="preview-img" src="{{ previewUrl }}"/>
            </div>
          {{/if}}

          <i class="result-icon fa {{ icon }} {{#if previewUrl}}{{else}}result-asset{{/if}}" aria-hidden="true"></i>

          <div class="result-info">
            <div class="bold">{{ name }}</div>
            <div>{{ type }}</div>
          </div>
        </div>
        <div class="actions">
          <label class="checkbox-container grid-select">
            <input type="checkbox" class="search-select-item" data-url="{{ path }}" value="None" id="squaredFour" name="check" />
            <span class="checkmark"></span>
          </label>

          <span class="studio-actions">
            <#--  TODO: change data-type to mimetype  -->
            {{#equal type "Image"}}
            <a class="action search-preview" href="#" data-url="{{ path }}" data-type="{{ type }}">
              <i class="fa fa-search-plus" aria-hidden="true"></i>
            </a>
            {{/equal}}
            {{#equal type "Video"}}
            <a class="action search-preview" href="#" data-url="{{ path }}" data-type="{{ type }}">
              <i class="fa fa-search-plus" aria-hidden="true"></i>
            </a>
            {{/equal}}

            {{#if permissions.edit }}
            <a class="action search-edit" href="#" data-url="{{ path }}"><i class="fa fa-pencil" aria-hidden="true"></i></a>
            {{/if}}
            {{#if permissions.delete }}
            <a class="action search-delete" href="#" data-url="{{ path }}"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
            {{/if}}
          </span>
        </div>
      </div>
    </script>

    <script id="hb-filter-separator" type="text/x-handlebars-template">
        <li role="separator" class="divider"></li>
    </script>

    <script id="hb-filter-item" type="text/x-handlebars-template">
        <li class="filter-item tmpl" style="display: none">
            <a href="#">
              {{#if multiple}}
                <input type="checkbox" name="{{ name }}" id="{{ name }}{{ id }}" class="{{#if filter}}filter{{/if}} multiple"
                       value="{{value}}"
                >
              {{else}}
                <input type="radio" name="{{ name }}" id="{{ name }}{{ id }}" class="{{#if filter}}filter{{/if}}"
                        {{#if range}}
                            data-range="{{ range }}"
                            from="{{ from }}" to="{{ to }}"
                        {{else}}
                            value="{{value}}"
                        {{/if}}
                >
              {{/if}}
                <label for="{{ name }}{{ id }}">{{ label }}</label>
            </a>
        </li>
    </script>

    <script id="hb-filter-range" type="text/x-handlebars-template">
        <li class="filter-item filter-range tmpl" filter-name="{{ name }}">
            <input class="range-min" type="text" name="min" placeholder="Min"> -
            <input class="range-max" type="text" name="max" placeholder="Max">
            <button type="button" class="btn btn-primary apply-range">Go</button>
        </li>
    </script>

    <script id="hb-acc-filter-section" type="text/x-handlebars-template">
        <div class="panel panel-default tmpl" {{#if grouped}}data-group="{{grouped}}"{{/if}}>
            <div class="panel-heading" role="tab" id="heading{{ value }}">
                <h4 class="panel-title">
                    <a class="collapsed filter-header" role="button" data-toggle="collapse" data-parent="#accordion" href="&#x23;{{ value }}" aria-expanded="false" aria-controls="{{ value }}">
                        {{ label }} <i class="fa fa-check-circle selected hide ml5" aria-hidden="true"></i>
                    </a>
                </h4>
            </div>
            <div id="{{ value }}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading{{ value }}">
                {{#if multiple}}<button type="button" name="{{ value }}" class="btn btn-primary apply-selections pull-right mt10 mr10" disabled="true" data-trans="apply">Apply</button>{{/if}}
                {{#if clear}}<button type="button" class="btn btn-default clear-filter" name="{{ value }}" disabled="true" data-trans="clear">Clear</button>{{/if}}
                <div class="panel-body">

                </div>
            </div>
        </div>
    </script>

    <script id="hb-command-controls" type="text/x-handlebars-template">
      <div id="cstudio-command-controls">
        <div id="submission-controls" class="cstudio-form-controls-button-container">
          <input id="formSaveButton" type="button" class="cstudio-search-btn cstudio-button btn btn-primary" disabled="" value="Add Selection">
          <input id="formCancelButton" type="button" class="cstudio-search-btn cstudio-button btn btn-default" value="Cancel">
        </div>
      </div>
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
