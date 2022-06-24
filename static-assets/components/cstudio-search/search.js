/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function (window, $, Handlebars) {
  'use strict';

  var storage = CStudioAuthoring.Storage;
  if (typeof window.CStudioSearch == 'undefined' || !window.CStudioSearch) {
    var CStudioSearch = {};
    window.CStudioSearch = CStudioSearch;
  }

  /* default search context */
  CStudioSearch.searchContext = {
    searchId: null,
    query: '',
    itemsPerPage: 20,
    keywords: '',
    filters: {},
    sortBy: '_score', // sortBy has value by default, so numFilters starts at 1
    sortOrder: 'desc',
    numFilters: 1,
    filtersShowing: 10,
    currentPage: 1,
    searchInProgress: false,
    view: 'grid',
    lastSelectedFilterSelector: '',
    selectionState: {},
    mode: 'default' // possible mode values: [default|select]
  };

  CStudioSearch.typesMap = {
    Page: {
      icon: 'fa-file',
      tree: 'pages'
    },
    Image: {
      icon: 'fa-file-image-o',
      tree: 'staticassets'
    },
    Video: {
      icon: 'fa-file-video-o',
      tree: 'staticassets'
    },
    Component: { icon: 'fa-puzzle-piece' },
    Template: { icon: 'fa-file-code-o' },
    Taxonomy: { icon: 'fa-tag' },
    Other: { icon: 'fa-file-text' },
    CSS: { icon: 'fa-css3' },
    JavaScript: { icon: 'fa-file-code-o' },
    Groovy: { icon: 'fa-file-code-o' },
    PDF: { icon: 'fa-file-pdf-o' },
    'MS Word': { icon: 'fa-file-word-o' },
    'MS Excel': { icon: 'fa-file-excel-o' },
    'MS PowerPoint': { icon: 'fa-file-powerpoint-o' }
  };

  // TODO: validate if needed (videos filters are pending)
  CStudioSearch.facetsMap = {
    width: 'images',
    height: 'images'
  };

  CStudioSearch.init = function () {
    CStudioAuthoring.OverlayRequiredResources.loadRequiredResources();
    CStudioAuthoring.OverlayRequiredResources.loadContextNavCss();

    var searchContext = this.determineSearchContextFromUrl();
    this.searchContext = searchContext;

    $('section.cstudio-search').addClass(this.searchContext.mode);

    // arrange iframe according to search mode
    if (this.searchContext.mode != 'select') {
      CStudioAuthoring.Events.contextNavLoaded.subscribe(function () {
        CStudioAuthoring.ContextualNav.hookNavOverlayFromAuthoring();
        CStudioAuthoring.InContextEdit.autoInitializeEditRegions();
      });
    } else this.renderFormControls();

    CStudioAuthoring.Operations.translateContent(langBundle, null, 'data-trans');
    this.performSearch();
    this.bindEvents();
  };

  CStudioSearch.bindEvents = function () {
    var searchTimeout, filterTimeout;

    // Search input changes
    $('#searchInput').on('keyup', function (e) {
      // If is enter -> immediate search
      if (event.keyCode === 13) {
        CStudioSearch.searchContext.keywords = e.target.value;
        CStudioSearch.searchContext.currentPage = 1;
        CStudioSearch.performSearch();
        CStudioSearch.updateUrl();
      } else {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          CStudioSearch.searchContext.keywords = e.target.value;
          CStudioSearch.searchContext.currentPage = 1;
          CStudioSearch.performSearch();
          CStudioSearch.updateUrl();
        }, 700);
      }
    });

    $('#searchButton').on('click', function (e) {
      var $searchInput = $('#searchInput');
      CStudioSearch.searchContext.keywords = $searchInput.val();
      CStudioSearch.searchContext.currentPage = 1;
      CStudioSearch.performSearch(true);
      CStudioSearch.updateUrl();
      $searchInput.focus().select();
    });

    // Selecting an item from the results
    $('.cstudio-search').on('change', '.search-select-item', function () {
      var path = $(this).attr('data-url'),
        selected = $(this).is(':checked'),
        allSelected;

      // synchronize checkbox (grid and list view)
      $('input[type="checkbox"][data-url="' + path + '"]').prop('checked', selected);

      // if all checkboxes are selected/unselected -> update select all checkbox
      var currentlySelected = $('input[type="checkbox"].search-select-item:checked').length;
      allSelected = currentlySelected == $('input[type="checkbox"].search-select-item').length;

      $('#formSaveButton').prop('disabled', currentlySelected == 0);
      $('#searchSelectAll').prop('checked', allSelected);

      allSelected =
        $('input[type="checkbox"].search-select-item:checked').length ==
        $('input[type="checkbox"].search-select-item').length;
      $('#searchSelectAll').prop('checked', allSelected);

      CStudioSearch.changeSelectStatus(path, selected);
    });

    $('#cstudio-command-controls').on('click', '#formSaveButton', function () {
      CStudioSearch.saveContent();
    });

    $('#cstudio-command-controls').on('click', '#formCancelButton', function () {
      window.close();
      $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
    });

    // Select all results
    $('.cstudio-search').on('change', '#searchSelectAll', function () {
      var selected = $(this).is(':checked'),
        $elements = $('input[type="checkbox"].search-select-item');

      $elements.prop('checked', selected).trigger('change');
    });

    // Clicking on view icon from the results
    $('.cstudio-search').on('click', '.search-preview', function (e) {
      var path = $(this).attr('data-url'),
        type = $(this).attr('data-type').toLowerCase();
      e.preventDefault();

      CStudioAuthoring.Utils.previewAssetDialog(path, type);
    });

    // Clicking on edit icon from the results
    $('.cstudio-search').on('click', '.search-edit', function (e) {
      var path = $(this).attr('data-url');
      e.preventDefault();
      CStudioSearch.editElement(path);
    });

    // Clicking on delete icon from the results
    $('.cstudio-search').on('click', '.search-delete', function (e) {
      var path = $(this).attr('data-url');
      e.preventDefault();
      CStudioSearch.deleteElement(path);
    });

    // Selecting a single value filter
    $('.cstudio-search').on(
      'change',
      '.filter-item input[type="radio"], .filter-item select.search-dropdown',
      function () {
        var searchFilters = CStudioSearch.searchContext.filters,
          filterName = $(this).attr('name'),
          isRange = $(this).attr('data-range') === 'true',
          filterValue,
          from,
          to,
          isAdditional = $(this).hasClass('filter');

        if (isRange) {
          from = $(this).attr('from');
          to = $(this).attr('to');
        } else {
          filterValue = $(this).val();
          if (filterValue === '_score') {
            $('.filter-item .sort-dropdown[name="sortOrder"]').val('desc');
            CStudioSearch.searchContext['sortOrder'] = 'desc';
          } else if (CStudioSearch.searchContext[filterName] === '_score') {
            $('.filter-item .sort-dropdown[name="sortOrder"]').val('asc');
            CStudioSearch.searchContext['sortOrder'] = 'asc';
          }
        }

        if (isAdditional) {
          if (isRange) {
            searchFilters[filterName] = {
              min: isNaN(parseInt(from)) ? null : from,
              max: isNaN(parseInt(to)) ? null : to
            };

            if (filterName === 'last-edit-date') {
              searchFilters[filterName].date = true;
              searchFilters[filterName].id = $(this).attr('id');
            }
          } else {
            searchFilters[filterName] = isNaN(parseInt(filterValue)) ? filterValue : parseInt(filterValue);
          }

          CStudioSearch.toggleFilterActionsState(filterName);
        } else {
          CStudioSearch.searchContext[filterName] = filterValue;
        }

        CStudioSearch.searchContext.lastSelectedFilterSelector = '[href="#' + filterName + '"]';

        CStudioSearch.updateNumFilters(filterName);
        CStudioSearch.performSearch(true);
        CStudioSearch.updateUrl();
      }
    );

    // Applying change to path filter
    $('.cstudio-search').on('click', '.filter-item .apply-path', function () {
      var $parent = $(this).parent(),
        filterName = $parent.attr('filter-name'),
        $selectedIndicator = $('#headingPath .path-header-label .selected');
      CStudioSearch.searchContext.lastSelectedFilterSelector = '[href="#' + filterName + '"]';

      let value = $('#filterPath').val();

      if (value !== '') {
        value = `${value}${value.endsWith('/') ? '.+' : '/.+'}`;
        $selectedIndicator.removeClass('hide');
      } else {
        $selectedIndicator.addClass('hide');
      }

      CStudioSearch.searchContext[filterName] = value;

      CStudioSearch.updateNumFilters();
      CStudioSearch.performSearch(true);
      CStudioSearch.updateUrl();
    });

    // Selecting a multiple value filter
    $('.cstudio-search').on('change', '.filter-item input[type="checkbox"]', function () {
      var filterName = $(this).attr('name'),
        isSelected;

      isSelected = CStudioSearch.toggleFilterActionsState(filterName);

      if (isSelected) {
        CStudioSearch.searchContext.selectionState[filterName] = { isDirty: true };
      }
    });

    $('.cstudio-search').on('click', '.apply-selections', function () {
      var searchFilters = CStudioSearch.searchContext.filters,
        filterName = $(this).attr('name'),
        filterValues = [];

      $(".filter[name='" + filterName + "']:checked").each(function () {
        filterValues.push($(this).val());
      });

      searchFilters[filterName] = filterValues;
      CStudioSearch.searchContext.lastSelectedFilterSelector = '[href="#' + filterName + '"]';

      CStudioSearch.updateNumFilters(filterName);
      CStudioSearch.performSearch(true);
      CStudioSearch.searchContext.selectionState[filterName].isDirty = false;
      CStudioSearch.updateUrl();
    });

    // Applying range to a filter
    $('.cstudio-search').on('click', '.filter-range .apply-range', function () {
      var $parent = $(this).parent(),
        filterName = $parent.attr('filter-name'),
        rangeMin = parseInt($parent.find('.range-min').val()),
        rangeMax = parseInt($parent.find('.range-max').val());

      CStudioSearch.searchContext.lastSelectedFilterSelector = '[href="#' + filterName + '"]';
      CStudioSearch.searchContext.filters[filterName] = {
        min: rangeMin,
        max: rangeMax
      };

      CStudioSearch.updateNumFilters();
      CStudioSearch.performSearch(true);
      CStudioSearch.updateUrl();
    });

    // Clear filter
    $('.cstudio-search').on('click', '.filters .clear-filter', function () {
      var filterId = $(this).parent().attr('id'),
        selectionState = CStudioSearch.searchContext.selectionState[filterId];
      $('input[name="' + filterId + '"]').prop('checked', false);

      if (!selectionState || !selectionState.isDirty) {
        delete CStudioSearch.searchContext.filters[filterId];
        CStudioSearch.performSearch(true);
        CStudioSearch.updateUrl();
      }

      CStudioSearch.toggleFilterActionsState(filterId);
    });

    // Changing results view (grid, list)
    $('.view-selector').on('click', 'button', function () {
      var $resultsContainer = $('.results'),
        newView = $(this).attr('data-view'),
        oldView = newView === 'grid' ? 'list' : 'grid';

      CStudioSearch.searchContext.view = newView;
      $('.view-selector button').removeClass('active');
      $(this).addClass('active');

      $resultsContainer.removeClass(oldView).addClass(newView);
      CStudioSearch.updateUrl();
    });

    // Clicking on result to preview
    $('.cstudio-search').on('click', '.result-preview.previewable', function () {
      var type = $(this).attr('data-type'),
        treeVal = CStudioSearch.typesMap[type].tree,
        treeCookieName,
        treeCookie,
        url = $(this).attr('data-url'),
        parsedUrl,
        cookieKey = type === 'Page' ? 'sitewebsite' : 'static-assets';

      if (treeVal) {
        CStudioAuthoring.Operations.updateTreeCookiePath(treeVal, cookieKey, url);
      }
      CStudioSearch.previewElement($(this).attr('data-url'));
    });

    // Avoid closing filters dropdown on selections
    $(document).on('click', '.filters .dropdown-menu', function (e) {
      e.stopPropagation();
    });
  };

  CStudioSearch.determineSearchContextFromUrl = function () {
    var searchContext = CStudioSearch.searchContext;

    var urlParams = CStudioAuthoring.Utils.getUrlParams();

    var queryString = document.location.search;
    var keywords = CStudioAuthoring.Utils.getQueryVariable(queryString, 'keywords');
    var searchId = CStudioAuthoring.Utils.getQueryVariable(queryString, 'searchId');
    var itemsPerPage = CStudioAuthoring.Utils.getQueryVariable(queryString, 'ipp');
    var page = CStudioAuthoring.Utils.getQueryVariable(queryString, 'page');
    var sortBy = CStudioAuthoring.Utils.getQueryVariable(queryString, 'sortBy');
    var view = CStudioAuthoring.Utils.getQueryVariable(queryString, 'view');
    var mode = CStudioAuthoring.Utils.getQueryVariable(queryString, 'mode');
    var query = CStudioAuthoring.Utils.getQueryVariable(queryString, 'query');
    var path = CStudioAuthoring.Utils.getQueryVariable(queryString, 'path');
    var externalPath = CStudioAuthoring.Utils.getQueryVariable(queryString, 'externalPath');
    if (sortBy === '_score') {
      searchContext.sortOrder = 'desc';
    }
    searchContext.keywords = keywords ? keywords : searchContext.keywords;
    searchContext.searchId = searchId ? searchId : null;
    searchContext.currentPage = page ? page : searchContext.currentPage;
    searchContext.sortBy = sortBy ? sortBy : searchContext.sortBy;
    searchContext.view = view ? view : searchContext.view;
    searchContext.itemsPerPage = itemsPerPage ? itemsPerPage : searchContext.itemsPerPage;
    searchContext.mode = mode ? mode : searchContext.mode;
    searchContext.query = query ? query : searchContext.query;
    searchContext.path = path ? path : searchContext.path;
    searchContext.externalPath = externalPath ? externalPath : false;

    $.each(urlParams, function (key, value) {
      var processedKey, processedValue;
      // csf = crafter studio filter
      if (key.indexOf('csf_') === 0) {
        processedKey = key.replace('csf_', '');

        //csr = crafter studio range
        if (value.indexOf('csr_') === 0) {
          var rangeArray = value.split('csrID'), //if parameter has id, separate from the rest of the param
            range,
            id = rangeArray[1];
          processedValue = rangeArray[0].replace('csr_', '');
          range = processedValue.split('csrTO');

          searchContext.filters[processedKey] = {};
          searchContext.filters[processedKey].min = range[0] === 'null' ? null : range[0];
          searchContext.filters[processedKey].max = range[1] === 'null' ? null : range[1];
          id && (searchContext.filters[processedKey].id = id);
        } else {
          processedValue = value;
          searchContext.filters[processedKey] = processedValue;
        }
      }
    });

    return searchContext;
  };

  CStudioSearch.renderResults = function (results) {
    var $resultsContainer = $('.cstudio-search .results'),
      $selectAllContainer = $('.select-all-col'),
      $filtersSection = $('.view-selector, #searchFilters'),
      $resultsPagination = $('#resultsPagination'),
      $numResultsContainer = $('#searchNumResults'),
      totalItems = results.total,
      itemsPerPage = this.searchContext.itemsPerPage,
      totalPages = Math.ceil(totalItems / itemsPerPage),
      view = CStudioSearch.searchContext.view;
    $resultsContainer.empty();
    $resultsContainer.addClass(view);

    this.searchContext.facets = results.facets; // for filters
    CStudioSearch.cleanFilters();
    this.initFilters();

    $numResultsContainer.text(results.total);

    if (results.total === 0) {
      $selectAllContainer.hide();
    } else {
      $selectAllContainer.show();
      $filtersSection.show();
    }

    //PAGINATION - https://www.jqueryscript.net/other/Simple-Boostrap-Pagination-Plugin-With-jQuery.html
    if (!this.$pagination) {
      this.$pagination = $resultsPagination.simplePaginator({
        totalPages: totalPages,
        maxButtonsVisible: 5,
        currentPage: parseInt(this.searchContext.currentPage),
        clickCurrentPage: false,
        nextLabel: CMgs.format(langBundle, 'paginationNext'),
        prevLabel: CMgs.format(langBundle, 'paginationPrev'),
        firstLabel: CMgs.format(langBundle, 'paginationFirst'),
        lastLabel: CMgs.format(langBundle, 'paginationLast'),
        pageChange: function (page) {
          $('#searchSelectAll').prop('checked', false);
          if (CStudioSearch.searchContext.currentPage != page) {
            CStudioSearch.searchContext.currentPage = page;
            CStudioSearch.performSearch();
            CStudioSearch.updateUrl();
          }
        }
      });
    } else {
      if (totalPages > 1) {
        $resultsPagination.show();
        this.$pagination.simplePaginator('changePage', this.searchContext.currentPage);
        this.$pagination.simplePaginator('setTotalPages', totalPages);
      } else {
        $resultsPagination.hide();
      }
    }
    // END OF PAGINATION

    $.each(results.items, function (index, result) {
      CStudioSearch.renderResult(result);
    });
  };

  CStudioSearch.renderFormControls = function (result) {
    var $formControlContainer = $('#cstudio-command-controls-container'),
      source = $('#hb-command-controls').html(),
      template = Handlebars.compile(source),
      html;

    html = template(result);
    $(html).appendTo($formControlContainer);
  };

  CStudioSearch.renderResult = function (result) {
    var $resultsContainer = $('.cstudio-search .results'),
      source = $('#hb-search-result').html(),
      template = Handlebars.compile(source),
      html,
      editable = true,
      permissionsKey = CStudioAuthoringContext.user,
      isInSelectMode = this.searchContext.mode == 'select';

    if ((result.type === 'Page' && !isInSelectMode) || result.type === 'Image' || result.type === 'Video') {
      result.previewable = true;
    }

    editable = CStudioAuthoring.Utils.isEditableFormAsset(result.path);

    if (
      result.type !== 'Page' &&
      result.type !== 'Component' &&
      result.type !== 'Taxonomy' &&
      result.type !== 'Image'
    ) {
      result.asset = true;
    }
    result.icon = CStudioSearch.typesMap[result.type]
      ? CStudioSearch.typesMap[result.type].icon
      : CStudioSearch.typesMap['Other'].icon;

    const $resultContainer = $('<div class="result-container"/>')
    $($resultContainer).appendTo($resultsContainer);

    var permissionsCached = cache.get(permissionsKey),
      validateAndRender = function (results) {
        var isWriteAllowed = CStudioAuthoring.Service.validatePermission(results.permissions, 'write'),
          isDeleteAllowed = CStudioAuthoring.Service.validatePermission(results.permissions, 'delete');
        result.editable = isWriteAllowed;
        // set permissions for edit/delete actions to be (or not) rendered
        // when in select mode, dont give option to delete
        result.permissions = {
          edit: isWriteAllowed && editable,
          delete: isDeleteAllowed && !isInSelectMode
        };

        html = template(result);
        $(html).appendTo($resultContainer);
      };

    if (permissionsCached) {
      validateAndRender(permissionsCached);
    } else {
      CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, result.path, {
        success: function (results) {
          cache.set(permissionsKey, results, CStudioAuthoring.Constants.CACHE_TIME_GET_ROLES);
          validateAndRender(results);
        },
        failure: function () {
          throw new Error('Unable to retrieve user permissions');
        }
      });
    }
  };

  // creates a search query from searchContext
  CStudioSearch.createSearchQuery = function () {
    var searchContext = this.searchContext;
    var query = {
      query: searchContext.query,
      keywords: searchContext.keywords,
      offset: (searchContext.currentPage - 1) * searchContext.itemsPerPage,
      limit: searchContext.itemsPerPage,
      sortBy: searchContext.sortBy,
      sortOrder: searchContext.sortOrder,
      path: searchContext.path
    };

    if (!jQuery.isEmptyObject(searchContext.filters)) {
      query.filters = {};
      $.each(searchContext.filters, function (key, value) {
        query.filters[key] = value;
      });
    }

    return query;
  };

  CStudioSearch.initFilters = function () {
    var searchContext = this.searchContext,
      $sortFilters = $('#searchFilters .dropdown-menu .sort-dinam'),
      filterItem;

    // handlebars vars
    var source = $('#hb-filter-item').html(),
      template = Handlebars.compile(source),
      html,
      headerSrc = $('#hb-acc-filter-section').html(),
      headerTemplate = Handlebars.compile(headerSrc),
      headerHtml,
      rangeSrc = $('#hb-filter-range').html(),
      rangeTemplate = Handlebars.compile(rangeSrc),
      rangeHtml;

    // Update searchInput value from searchContext
    $('#searchInput').val(searchContext.keywords);

    // sortBy
    var sortByValue = searchContext.sortBy,
      $sortByDropdown = $('.filter-item .sort-dropdown[name="sortBy"]'),
      scoreOption = '<option value="_score">Relevance</option>',
      nameOption = '<option value="internalName">Name</option>';

    $sortByDropdown.empty();
    $sortByDropdown.append(scoreOption);
    $sortByDropdown.append(nameOption);
    $.each(searchContext.facets, function (index, facet) {
      let label = CMgs.format(langBundle, facet.name);
      let optionTpl = '<option value="' + facet.name + '">' + label + '</option>';
      $sortByDropdown.append(optionTpl);
    });

    CStudioSearch.addSeeMore($sortFilters, 'sortBy');
    $('.filter-item .sort-dropdown[name="sortBy"]').val(sortByValue);

    // sortOrder
    var $sortOrderDropdown = $('select[name="sortOrder"]');
    $sortOrderDropdown.empty();
    if (sortByValue === '_score') {
      $sortOrderDropdown.append(`<option value="desc">${CMgs.format(langBundle, 'moreRelevance')}</option>`);
      $sortOrderDropdown.append(`<option value="asc">${CMgs.format(langBundle, 'lessRelevance')}</option>`);
    } else {
      $sortOrderDropdown.append(`<option value="asc">${CMgs.format(langBundle, 'asc')}</option>`);
      $sortOrderDropdown.append(`<option value="desc">${CMgs.format(langBundle, 'desc')}</option>`);
    }

    var sortOrderValue = searchContext.sortOrder;
    $('#' + sortOrderValue).prop('checked', true);
    $('select[name="sortOrder"]').val(sortOrderValue);

    if (searchContext.path) {
      $('#filterPath').val(searchContext.path.replace('.+', ''));

      if (searchContext.path !== '') {
        $('#headingPath .path-header-label .selected').removeClass('hide');
      }

      if (searchContext.externalPath) {
        $('#filterPath').prop('disabled', true);
        $('#collapsePath .apply-path').hide();
      }
    }

    // add filters
    $.each(searchContext.facets, function (index, facet) {
      var groupedFacetsName = CStudioSearch.facetsMap[facet.name] ? CStudioSearch.facetsMap[facet.name] : null,
        $container = $('#searchFilters .dropdown-menu .panel-group'),
        multipleSelection = facet.multiple,
        headerExists = $container.find('.dropdown-header').length > 0,
        headerLabel = '';

      // Filters for images and videos, for example, are grouped
      if (groupedFacetsName && !headerExists) {
        groupedFacetsName = CMgs.format(langBundle, groupedFacetsName)
          ? CMgs.format(langBundle, groupedFacetsName)
          : groupedFacetsName;
        headerLabel = groupedFacetsName + ' - ';
      }

      headerLabel = CMgs.format(langBundle, facet.name)
        ? headerLabel + CMgs.format(langBundle, facet.name)
        : headerLabel + facet.name;
      headerHtml = headerTemplate({
        value: facet.name,
        label: headerLabel,
        main: !groupedFacetsName,
        grouped: groupedFacetsName,
        multiple: multipleSelection,
        clear: true
      });

      //check if it's grouped, if it is, place it together
      if (groupedFacetsName) {
        var $groupElems = $('[data-group="' + groupedFacetsName + '"]');
        if ($groupElems.length > 0) {
          $groupElems.last().after($(headerHtml));
        } else {
          $(headerHtml).appendTo($container);
        }
      } else {
        $(headerHtml).appendTo($container);
      }

      $.each(facet.values, function (key, value) {
        if (!facet.range || value.count > 0) {
          var escapedKey = key.replace(/\//g, '_'),
            label,
            count = facet.range ? value.count : value,
            underLabel = CMgs.format(langBundle, 'under'),
            aboveLabel = CMgs.format(langBundle, 'above');

          if (value.from === '-Infinity') {
            escapedKey = 'null-' + value.to;
          }

          // create label - if number => parseInt, if size => formatFileSize, if range => createRange
          if (facet.range) {
            var from = isNaN(parseInt(value.from)) ? underLabel : value.from,
              to = isNaN(parseInt(value.to)) ? aboveLabel : value.to;

            if (facet.name === 'size') {
              from = from === underLabel ? from : CStudioAuthoring.Utils.formatFileSize(parseInt(from));
              to = to === aboveLabel ? to : CStudioAuthoring.Utils.formatFileSize(parseInt(to));
            }

            if (facet.date) {
              label = CMgs.format(langBundle, key);
            } else {
              // if both values are ints, label will have a dash
              if (isNaN(parseInt(from)) || isNaN(parseInt(to))) {
                label = from + ' ' + to;
              } else {
                label = from + ' - ' + to;
              }
            }
          } else {
            if (facet.name === 'size') {
              label = CStudioAuthoring.Utils.formatFileSize(parseInt(key));
            } else {
              label = isNaN(parseInt(key)) ? key : parseInt(key);
            }
          }

          filterItem = {
            name: facet.name,
            id: isNaN(parseInt(escapedKey)) ? escapedKey : parseInt(escapedKey),
            label: label + ' (' + count + ')',
            filter: true,
            multiple: multipleSelection
          };

          if (facet.range) {
            filterItem.range = true;
            filterItem.from = value.from;
            filterItem.to = value.to;
          } else {
            filterItem.value = isNaN(parseInt(key)) ? key : parseInt(key);
          }

          html = template(filterItem);
          $(html).appendTo($('#' + facet.name + ' .panel-body'));
        }
      });

      CStudioSearch.addSeeMore($('#' + facet.name + ' .panel-body'), facet.name);

      // If facet is a range, add inputs for a custom range
      if (facet.range && !facet.date) {
        rangeHtml = rangeTemplate({ name: facet.name });
        $(rangeHtml).appendTo($('#' + facet.name + ' .panel-body'));
      }
    });

    // set selected filter values
    $.each(CStudioSearch.searchContext.filters, function (key, value) {
      var $filterHeader = $('.filter-header[href="#' + key + '"] .selected');
      if ($.isArray(value)) {
        // if value is array = multiple selections
        $.each(value, function () {
          var escapedValue = this.replace(/\//g, '_');
          $filterHeader.removeClass('hide');
          $('#' + key + escapedValue).prop('checked', true);
        });
      } else if (typeof value === 'object') {
        // if value is object = range
        var $filterContainer = $('.filter-range[filter-name="' + key + '"]'),
          $filterRadio,
          filterRadioId;

        if (value.date === true || key === 'last-edit-date') {
          $filterRadio = $('input[type="radio"][name="' + key + '"]#' + value.id);
          $filterRadio.prop('checked', true);
          $filterHeader.removeClass('hide');
        } else {
          filterRadioId = value.min !== null ? key + value.min : key + 'null-' + value.max;
          $filterRadio = $('input[type="radio"][name="' + key + '"]#' + filterRadioId);
          $filterContainer.find('input[name="min"]').val(isNaN(value.min) ? '' : value.min);
          $filterContainer.find('input[name="max"]').val(isNaN(value.max) ? '' : value.max);

          if ($filterRadio.length > 0) {
            $filterRadio.prop('checked', true);
            $filterHeader.removeClass('hide');
          }
        }
      } else {
        // otherwise, single value
        var escapedValue = value.replace ? value.replace(/\//g, '_') : value;
        $('input[name="' + key + '"]#' + key + escapedValue).prop('checked', true);
        $filterHeader.removeClass('hide');
      }

      CStudioSearch.toggleFilterActionsState(key);
    });

    // Open accordion panel from last selected filter
    if ($(CStudioSearch.searchContext.lastSelectedFilterSelector).length > 0) {
      $(CStudioSearch.searchContext.lastSelectedFilterSelector).click();
    }

    this.updateNumFilters();
  };

  // Enables/disables action buttons in filters, like apply and clear, depending on the
  // selection of the filter's section. Returns true/false (items selected or not).
  CStudioSearch.toggleFilterActionsState = function (filterName) {
    var filtersSelected = $(".filter[name='" + filterName + "']:checked").length,
      selected = false;

    if (filtersSelected > 0) {
      $('.apply-selections[name="' + filterName + '"]').prop('disabled', false);
      $('.clear-filter[name="' + filterName + '"]').prop('disabled', false);
      selected = true;
    } else {
      $('.apply-selections[name="' + filterName + '"]').prop('disabled', true);
      $('.clear-filter[name="' + filterName + '"]').prop('disabled', true);
      selected = false;
    }

    return selected;
  };

  CStudioSearch.addSeeMore = function ($container, id) {
    var minFiltersShowing = CStudioSearch.searchContext.filtersShowing,
      seeMoreLabel = CMgs.format(langBundle, 'seeMore'),
      seeLessLabel = CMgs.format(langBundle, 'seeLess');
    // show only 'x' amount of filters, rest of them with be shown on clicking 'see more'
    $container.find('li:not(.filter-range):lt(' + minFiltersShowing + ')').show();

    // If more than 10 items -> add see more
    if ($container.children().length > 10) {
      $(
        '<div class="filters-toggle" id="toggleShowItems' + id + '" data-state="see-more">' + seeMoreLabel + '</div>'
      ).appendTo($container);

      $('#toggleShowItems' + id).click(function () {
        var state = $(this).attr('data-state');

        if (state === 'see-more') {
          $(this).attr('data-state', 'see-less').text(seeLessLabel);
          $container.find('li').show();
        } else {
          $(this).attr('data-state', 'see-more').text(seeMoreLabel);
          $container
            .find('li')
            .not(':lt(' + minFiltersShowing + ')')
            .hide();
        }
      });
    }
  };

  // Clear the filters html
  CStudioSearch.cleanFilters = function () {
    $('#searchFilters .dropdown-menu .panel-default.tmpl').remove();
    $('#searchFilters .dropdown-menu .panel-default .filter-item.tmpl').remove();
  };

  CStudioSearch.updateNumFilters = function (filterName) {
    let numFilters = Object.keys(CStudioSearch.searchContext.filters).length;
    CStudioSearch.searchContext.path && CStudioSearch.searchContext.path !== '' && numFilters++;

    this.searchContext.numFilters = numFilters;
    $('#numFilters').text('(' + this.searchContext.numFilters + ')');
  };

  // Before calling this function the searchContext needs to be updated so
  // it can create an updated searchQuery
  CStudioSearch.performSearch = function (clean) {
    if (clean) {
      CStudioSearch.searchContext.currentPage = 1;
    }
    var searchQuery = this.createSearchQuery();

    var callback = {
      success: function (response) {
        CStudioSearch.renderResults(response.result);
      },
      failure: function (error) {
        CStudioSearch.renderError(error);
      }
    };

    CStudioAuthoring.SelectedContent.clear();
    CStudioAuthoring.Service.search(CStudioAuthoringContext.site, searchQuery, callback);
  };

  CStudioSearch.changeSelectStatus = function (path, selected) {
    var callback = {
      success: function (contentTO) {
        if (selected == true) {
          CStudioAuthoring.SelectedContent.selectContent(contentTO.item);
        } else {
          CStudioAuthoring.SelectedContent.unselectContent(contentTO.item);
        }
      },
      failure: function (error) {
        console.error(error);
      }
    };

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
  };

  CStudioSearch.saveContent = function () {
    var searchId = this.searchContext ? this.searchContext.searchId : '';
    var crossServerAccess = false;
    var opener = window.opener ? window.opener : parent.iframeOpener;

    try {
      // unfortunately we cannot signal a form close across servers
      // our preview is in one server
      // our authoring is in another
      // in this case we just close the window, no way to pass back details which is ok in some cases
      if (opener.CStudioAuthoring) {
      }
    } catch (crossServerAccessErr) {
      crossServerAccess = true;
    }
    if (opener && !crossServerAccess) {
      if (opener.CStudioAuthoring) {
        var openerChildSearchMgr = opener.CStudioAuthoring.ChildSearchManager;

        if (openerChildSearchMgr) {
          var searchConfig = openerChildSearchMgr.searches[searchId];
          if (searchConfig) {
            var callback = searchConfig.saveCallback;
            if (callback) {
              var selectedContentTOs = CStudioAuthoring.SelectedContent.getSelectedContent();
              openerChildSearchMgr.signalSearchClose(searchId, selectedContentTOs);
            } else {
              //TODO PUT THIS BACK
              //alert("no success callback provided for seach: " + searchId);
            }

            window.close();
            $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
          } else {
            CStudioAuthoring.Operations.showSimpleDialog(
              'lookUpChildError-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(langBundle, 'notification'),
              CMgs.format(langBundle, 'lookUpChildError') + searchId,
              [
                {
                  text: 'OK',
                  handler: function () {
                    this.hide();
                    window.close();
                    $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
                  },
                  isDefault: false
                }
              ],
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'lookUpParentError-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CMgs.format(langBundle, 'lookUpParentError') + searchId,
            [
              {
                text: 'OK',
                handler: function () {
                  this.hide();
                  window.close();
                  $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
                },
                isDefault: false
              }
            ],
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      }
    } else {
      // no window opening context or cross server call
      // the only thing we can do is close the window
      window.close();
      $(window.frameElement.parentElement).closest('.studio-ice-dialog').parent().remove(); //TODO: find a better way
    }
  };

  CStudioSearch.editElement = function (path) {
    var editCallback = {
        success: function () {
          CStudioSearch.performSearch(); // to re-render with changes
        }
      },
      callback = {
        success: function (contentTO) {
          var contentTO = contentTO.item;
          CStudioAuthoring.Operations.editContent(
            contentTO.form,
            CStudioAuthoringContext.siteId,
            contentTO.uri,
            contentTO.nodeRef,
            contentTO.uri,
            false,
            editCallback
          );
        },
        failure: function (error) {
          console.error(error);
        }
      };

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
  };

  CStudioSearch.deleteElement = function (path) {
    // TODO: reload items on deletion
    var callback = {
      success: function (contentTO) {
        var contentTO = contentTO.item;

        CStudioAuthoring.Operations.deleteContent([contentTO]);
      },
      failure: function (error) {
        console.error(error);
      }
    };

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
  };

  CStudioSearch.previewElement = function (url) {
    CStudioAuthoring.Service.lookupContentItem(
      CStudioAuthoringContext.site,
      url,
      {
        success: function (to) {
          CStudioAuthoring.Operations.openPreview(to.item, 'undefined', false, false);
        },
        failure: function () {}
      },
      false
    );
  };

  CStudioSearch.updateUrl = function () {
    var searchContext = this.searchContext,
      newUrl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        '?site=' +
        CStudioAuthoringContext.site;

    newUrl += '&page=' + searchContext.currentPage;
    newUrl += '&sortBy=' + searchContext.sortBy;
    newUrl += '&view=' + searchContext.view;
    newUrl += '&mode=' + searchContext.mode;
    newUrl += '&query=' + searchContext.query;

    if (searchContext.path && searchContext.path !== '') {
      newUrl += '&path=' + encodeURIComponent(searchContext.path);
    }

    // Add search filters to url
    // csf = crafter studio filter
    // csr = crafter studio range
    // csrTO = crafter studio range separator in URL
    if (!jQuery.isEmptyObject(searchContext.filters)) {
      $.each(searchContext.filters, function (key, value) {
        if (typeof value === 'string') {
          newUrl += '&csf_' + key + '=' + value;
        } else if ($.isArray(value)) {
          $.each(value, function () {
            newUrl += '&csf_' + key + '=' + this;
          });
        } else {
          //is a range
          if (value.date) {
            var min = value.min,
              max = value.max,
              id = value.id;
            newUrl += '&csf_' + key + '=csr_' + min + 'csrTO' + max + 'csrID' + id;
          } else {
            var min = isNaN(value.min) ? 'null' : value.min,
              max = isNaN(value.max) ? 'null' : value.max;
            newUrl += '&csf_' + key + '=csr_' + min + 'csrTO' + max;
          }
        }
      });
    }

    newUrl += '&keywords=' + searchContext.keywords;

    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  CStudioSearch.renderError = function (error) {
    var $resultsContainer = $('.cstudio-search .results'),
      $selectAllContainer = $('.select-all-col'),
      $filtersSection = $('.view-selector, #searchFilters'),
      $resultsPagination = $('#resultsPagination');

    console.error(error);

    $resultsContainer.html('<p class="bg-danger search-error">' + CMgs.format(langBundle, 'errorMessage') + '</p>');

    $selectAllContainer.hide();
    $filtersSection.hide();
    $resultsPagination.hide();
  };
})(window, jQuery, Handlebars);
