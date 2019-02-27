/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
    if (typeof window.CStudioSearch == "undefined" || !window.CStudioSearch) {
        var CStudioSearch = {};
        window.CStudioSearch = CStudioSearch;
    }

    /* default search context */
    CStudioSearch.searchContext = {
        searchId: null,
        itemsPerPage: 20,
        keywords: "",
        filters: {},
        sortBy: "internalName",      // sortBy has value by default, so numFilters starts at 1
        sortOrder: "asc",
        numFilters: 1,
        currentPage: 1,	
        searchInProgress: false,
        view: 'grid',
        lastSelectedFilterSelector: '' 
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
        "MS WORD": { icon: 'fa-file-word-o' },
        "MS EXCEL": { icon: 'fa-file-excel-o' },
        "MS PowerPoint": { icon: 'fa-file-powerpoint-o' }
    }

    // TODO: validate if needed (videos filters are pending)
    CStudioSearch.facetsMap = {
        width: 'images',
        height: 'images'
    }

    CStudioSearch.init = function() {
        var searchContext = this.determineSearchContextFromUrl();
        this.searchContext = searchContext;

        CStudioAuthoring.Operations.translateContent(langBundle, null, 'data-trans');
        this.performSearch();
        this.bindEvents();
    };

    CStudioSearch.bindEvents = function() {
        var searchTimeout;

        // Search input changes
        $('#searchInput').on('keyup', function(e){
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function(){
                CStudioSearch.searchContext.keywords = e.target.value;
                CStudioSearch.performSearch();
                CStudioSearch.updateUrl();
            }, 700);
        });

        // Selecting an item from the results
        $('.cstudio-search').on('change', '.search-select-item', function(){
            var path = $(this).attr('data-url'),
                selected = $(this).is(":checked"),
                allSelected;
            
            // synchronize checkbox (grid and list view)
            $('input[type="checkbox"][data-url="' + path + '"]').prop('checked', selected);

            // if all checkboxes are selected/unselected -> update select all checkbox
            allSelected = $('input[type="checkbox"].search-select-item:checked').length == $('input[type="checkbox"].search-select-item').length;
            $('#searchSelectAll').prop('checked', allSelected);
                
            CStudioSearch.changeSelectStatus(path, selected);
        });

        // Select all results
        $('.cstudio-search').on('change', '#searchSelectAll', function(){
            var selected = $(this).is(":checked"),
                $elements = $('input[type="checkbox"].search-select-item');

            $elements.prop('checked', selected).trigger("change");
            
        });

        // Clicking on view icon from the results
        $('.cstudio-search').on('click', '.search-preview', function(e) {
            var path = $(this).attr('data-url'),
                type = $(this).attr('data-type').toLowerCase();
            e.preventDefault();

            CStudioAuthoring.Utils.previewAssetDialog(path, type, $('#searchPreviewPopup'));
        });

        // Clicking on edit icon from the results
        $('.cstudio-search').on('click', '.search-edit', function(e){
            var path = $(this).attr('data-url');
            e.preventDefault();
            CStudioSearch.editElement(path);
        });

        // Clicking on delete icon from the results
        $('.cstudio-search').on('click', '.search-delete', function(e){
            var path = $(this).attr('data-url');
            e.preventDefault();
            CStudioSearch.deleteElement(path);
        });

        // Selecting a filter
        $('.cstudio-search').on('change', '.filter-item input[type="radio"]', function(){
            var filterName = $(this).attr('name'),
                filterValue = $(this).val(),
                isAdditional = $(this).hasClass('filter');
            
            if(isAdditional){
                CStudioSearch.searchContext.filters[filterName] = isNaN(parseInt(filterValue)) ? filterValue : parseInt(filterValue); 
            }else{
                CStudioSearch.searchContext[filterName] = filterValue;
            }

            CStudioSearch.searchContext.lastSelectedFilterSelector = '[href="#' + filterName + '"]';
            
            CStudioSearch.updateNumFilters();
            CStudioSearch.performSearch(true);
            CStudioSearch.updateUrl();
        });

        // Applying range to a filter
        $('.cstudio-search').on('click', '.filter-range .apply-range', function(){ 
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
        $('.cstudio-search').on('click', '.filters .clear-filter', function(){
            var filterId = $(this).parent().find('[data-toggle="collapse"]').attr('aria-controls');
            $('input[name="' + filterId + '"]').prop('checked', false);

            delete CStudioSearch.searchContext.filters[filterId];

            CStudioSearch.performSearch(true);
            CStudioSearch.updateUrl();
        });

        // Changing results view (grid, list)
        $('.view-selector').on('click',  'button', function(){
            var $resultsContainer = $('.results'),
                newView = $(this).attr('data-view'),
                oldView = newView === 'grid' ? 'list' : 'grid';
            
            CStudioSearch.searchContext.view = newView;
            $('.view-selector button').removeClass('active');
            $(this).addClass('active');

            $resultsContainer.switchClass(oldView, newView);    
        });

        // Clicking on result to preview
        $('.cstudio-search').on('click', '.result-preview.previewable', function() {
            var type = $(this).attr("data-type"),
                treeVal = CStudioSearch.typesMap[type].tree,
                treeCookieName,
                treeCookie,
                url = $(this).attr("data-url"),
                parsedUrl,
                cookieKey = type === 'Page' ? 'sitewebsite' : 'static-assets';

            if(treeVal){
                treeCookieName = CStudioAuthoringContext.site + '-' + treeVal + '-opened';
                treeCookie = JSON.parse(CStudioAuthoring.Storage.read(treeCookieName));

                // validate if is page and if has folder (ends with index.xml)
                if(type === "Page" && (url.indexOf("index.xml") !== -1)){
                    //remove everything after last-1 '/'
                    parsedUrl = url.substr(0, url.lastIndexOf('/'));
                    parsedUrl = parsedUrl.substr(0, parsedUrl.lastIndexOf('/'));
                }else{
                    //remove everything after last '/'
                    parsedUrl = url.substr(0, url.lastIndexOf('/'));
                }

                // key doesn't exist in cookie
                if(!treeCookie[cookieKey] && parsedUrl != '/site'){
                    treeCookie[cookieKey] = [];
                }
                // in entry doesn't exist in key
                if(treeCookie[cookieKey] && !(treeCookie[cookieKey].includes(parsedUrl)) && parsedUrl != '/site'){
                    treeCookie[cookieKey].push(parsedUrl);
                }
                storage.write(treeCookieName, JSON.stringify(treeCookie), 360);
            }
            CStudioSearch.previewElement($(this).attr('data-url'));
        });

        // Avoid closing filters dropdown on selections
        $(document).on('click', '.filters .dropdown-menu', function (e) {
            e.stopPropagation();
        });
    };

    //Utilities

    CStudioSearch.determineSearchContextFromUrl = function() {
        var searchContext = CStudioSearch.searchContext;
        
        var queryString = document.location.search;
        
        var keywords = CStudioAuthoring.Utils.getQueryVariable(queryString, "keywords");
        var searchId = CStudioAuthoring.Utils.getQueryVariable(queryString, "searchId");
        var itemsPerPage = CStudioAuthoring.Utils.getQueryVariable(queryString, "ipp");
        var page = CStudioAuthoring.Utils.getQueryVariable(queryString, "page");
        var sortBy = CStudioAuthoring.Utils.getQueryVariable(queryString, "sortBy");
    
        searchContext.keywords = (keywords) ? keywords : searchContext.keywords;
        searchContext.searchId = (searchId) ? searchId : null;
        searchContext.currentPage = (page) ? page : searchContext.currentPage;
        searchContext.sortBy = (sortBy) ? sortBy : searchContext.sortBy;
            
        if(!CStudioAuthoring.Utils.isEmpty(itemsPerPage)) {
            searchContext.itemsPerPage = itemsPerPage;	
        }
        else {		
            searchContext.itemsPerPage = 20;	
        }
        
        return searchContext;
    }

    CStudioSearch.renderResults = function(results) {
        var $resultsContainer = $('.cstudio-search .results'),
            $resultsPagination = $('#resultsPagination'),
            $numResultsContainer = $('#searchNumResults'),
            totalItems = results.total,
            itemsPerPage = this.searchContext.itemsPerPage,
            totalPages = Math.ceil(totalItems/itemsPerPage);
        $resultsContainer.empty();

        this.searchContext.facets = results.facets;     // for filters
        CStudioSearch.cleanFilters();
        this.initFilters();

        $numResultsContainer.text(results.total);

        //PAGINATION - https://www.jqueryscript.net/other/Simple-Boostrap-Pagination-Plugin-With-jQuery.html
        if(!this.$pagination){
            this.$pagination = $resultsPagination.simplePaginator({
                totalPages: totalPages,
                maxButtonsVisible: 5,
                currentPage: parseInt(this.searchContext.currentPage),
                clickCurrentPage: false,
                nextLabel: CMgs.format(langBundle, 'paginationNext'),
                prevLabel: CMgs.format(langBundle, 'paginationPrev'),
                firstLabel: CMgs.format(langBundle, 'paginationFirst'),
                lastLabel: CMgs.format(langBundle, 'paginationLast'),
                pageChange: function(page){
                    CStudioSearch.searchContext.currentPage = page;
                    CStudioSearch.performSearch();
                    CStudioSearch.updateUrl();
                }
            });
        }else{
            if(totalPages > 0){
                $resultsPagination.show();
                this.$pagination.simplePaginator('setTotalPages', totalPages);
            }else{
                $resultsPagination.hide();
            }
        }
        // END OF PAGINATION

        $.each(results.items, function(index, result){
            CStudioSearch.renderResult(result);
        });
    }

    // TODO: Needs to be improved - filters, more params, etc
    CStudioSearch.createSearchQuery = function() {        
        var searchContext = this.searchContext;
        var query = {
            "keywords": searchContext.keywords,
            "offset": (searchContext.currentPage - 1) * searchContext.itemsPerPage,
            "limit": searchContext.itemsPerPage,
            "sortBy": searchContext.sortBy,
            "sortOrder": searchContext.sortOrder
        }

        if(!jQuery.isEmptyObject( searchContext.filters )) {
            query.filters = {};
            $.each(searchContext.filters, function(key, value){
                query.filters[key] = value;
            })
        }

        return query;
    }

    CStudioSearch.initFilters = function() {
        var searchContext = this.searchContext,
            $sortFilters = $('#searchFilters .dropdown-menu .sort-dinam'),
            filterItem;

        // handlebars vars
        var source = $("#hb-filter-item").html(),
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

        // sortOrder
        var sortOrderValue = searchContext.sortOrder;
        $('#' + sortOrderValue).prop("checked", true);

        // sortBy
        var sortByValue = searchContext.sortBy;
        $.each(searchContext.facets, function(index, facet){
            var label = CMgs.format(langBundle, facet.name);

            filterItem = {
                name: 'sortBy',
                value: facet.name,
                id: facet.name,
                label: label
            }

            html = template(filterItem);
            $(html).appendTo($sortFilters);
        });
        $('#sortBy' + sortByValue).prop("checked", true);

        // add filters
        $.each(searchContext.facets, function(index, facet){
            var groupedFacetsName = CStudioSearch.facetsMap[facet.name] ? CStudioSearch.facetsMap[facet.name] : null,
                $container = $('#searchFilters .dropdown-menu .panel-group'),
                headerExists = $container.find('.dropdown-header').length > 0,
                headerLabel = '';

            // Filters for images and videos, for example, are grouped
            if(groupedFacetsName && !headerExists){
                groupedFacetsName = CMgs.format(langBundle, groupedFacetsName) ? CMgs.format(langBundle, groupedFacetsName) : groupedFacetsName;
                headerLabel =  groupedFacetsName + ' - ';
            }

            headerLabel = CMgs.format(langBundle, facet.name) ? headerLabel + CMgs.format(langBundle, facet.name) : headerLabel + facet.name;
            headerHtml = headerTemplate({ 
                value: facet.name,
                label: headerLabel,
                main: !groupedFacetsName,
                grouped: groupedFacetsName,
                clear: true
            });

            //check if it's grouped, if it is, place it together
            if(groupedFacetsName){
                var $groupElems = $('[data-group="'+ groupedFacetsName +'"]');
                if($groupElems.length > 0){
                    $groupElems.last().after($(headerHtml));
                }else{
                    $(headerHtml).appendTo($container);    
                }
            }else{
                $(headerHtml).appendTo($container);
            }

            $.each(facet.values, function(key, value){
                var escapedKey = key.replace(/\//g, "_"),
                    label;

                if(facet.name === 'Size'){
                    label = CStudioAuthoring.Utils.formatFileSize(parseInt(key));
                }else{
                    label = isNaN(parseInt(key)) ? key : parseInt(key);
                }

                filterItem = {
                    name: facet.name,
                    value: isNaN(parseInt(key)) ? key : parseInt(key),
                    id: isNaN(parseInt(escapedKey)) ? escapedKey : parseInt(escapedKey),
                    label: label + ' (' + value + ')',
                    filter: true
                }

                html = template(filterItem);


                $(html).appendTo($('#' + facet.name + ' .panel-body'));
            });

            // If facet is a range, add inputs for a custom range
            if(facet.range){    
                rangeHtml = rangeTemplate({ name: facet.name });
                $(rangeHtml).appendTo($('#' + facet.name + ' .panel-body'));
            }

        });

        $.each(CStudioSearch.searchContext.filters, function(key, value){
            if( typeof value === 'object' ){
                var $filterContainer = $('.filter-range[filter-name="' + key + '"]');
                $filterContainer.find('input[name="min"]').val(value.min);
                $filterContainer.find('input[name="max"]').val(value.max);
            }else{
                var escapedValue = value.replace ? value.replace(/\//g, "_") : value;
                $('input[type="radio"][name="' + key + '"]#' + key + escapedValue).prop("checked", true);
            }
        });

        // Open accordion panel from last selected filter
        if($(CStudioSearch.searchContext.lastSelectedFilterSelector).length > 0){
            $(CStudioSearch.searchContext.lastSelectedFilterSelector).click();
        }

        this.updateNumFilters();
    }

    CStudioSearch.cleanFilters = function(){
        $('#searchFilters .dropdown-menu .panel-default.tmpl').remove();
        $('#searchFilters .dropdown-menu .panel-default .filter-item.tmpl').remove();
    }

    CStudioSearch.updateNumFilters = function(){
        // SortBy will always have a value -> minimum filters = 1
        this.searchContext.numFilters = 1 + Object.keys(CStudioSearch.searchContext.filters).length;
        $('#numFilters').text('(' + this.searchContext.numFilters + ')')
    }

    // Before calling this function the searchContext needs to be updated so 
    // it can create an updated searchQuery
    CStudioSearch.performSearch = function(clean) {
        if(clean){
            CStudioSearch.searchContext.currentPage = 1;
        }
        var searchQuery = this.createSearchQuery();

        var callback = {
            success: function (response) {
                CStudioSearch.renderResults(response.result);
            },
            failure: function (error) {
                console.error(error);
            }
        }
        CStudioAuthoring.Service.search(CStudioAuthoringContext.site, searchQuery, callback);
    }

    CStudioSearch.renderResult = function(result) {
        var $resultsContainer = $('.cstudio-search .results'),
            source = $("#hb-search-result").html(),
            template = Handlebars.compile(source),
            html,
            editable = true;

        if(
            result.type === "Page"
            || result.type === "Image"
            || result.type === "Video"
        ){  
            result.previewable = true;
        }

        editable = CStudioAuthoring.Utils.isEditableFormAsset(result.path);

        if(result.type !== 'Page' && result.type !== 'Component' && result.type !== 'Taxonomy' && result.type !== 'Image') {
            result.asset = true;
        }
        result.icon = CStudioSearch.typesMap[result.type].icon;

        // if editable by ace-editor -> ask for permissions
        if(editable){
            CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, result.path, {
                success: function (results) {
                    var isWriteAllowed = CStudioAuthoring.Service.validatePermission(results.permissions, "write"),
                        isDeleteAllowed = CStudioAuthoring.Service.validatePermission(results.permissions, "delete");
                    result.editable = isWriteAllowed;

                    // set permissions for edit/delete actions to be (or not) rendered
                    result.permissions = {
                        edit: isWriteAllowed,
                        delete: isDeleteAllowed
                    };

                    html = template(result);
                    $(html).appendTo($resultsContainer);
                },
                failure: function () {
                    throw new Error('Unable to retrieve user permissions');
                }
            });
        }else{
            result.editable = editable;
            html = template(result);
            $(html).appendTo($resultsContainer);
        }
    }

    CStudioSearch.changeSelectStatus = function(path, selected){
        var callback = {
            success: function (contentTO) {
                if (selected == true) {
                    CStudioAuthoring.SelectedContent.selectContent(contentTO.item);
                }
                else {
                    CStudioAuthoring.SelectedContent.unselectContent(contentTO.item);
                }
            },
            failure: function (error) {
                console.error(error);
            }
        }

        CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
    }

    CStudioSearch.editElement = function(path){
        var editCallback = {
                success: function(){
                    CStudioSearch.performSearch();      // to re-render with changes
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
                    editCallback);
            },
            failure: function (error) {
                console.error(error);
            }
        }

        CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
    }

    CStudioSearch.deleteElement = function(path){
        // TODO: reload items on deletion
        var callback = {
            success: function (contentTO) {
                var contentTO = contentTO.item;

                CStudioAuthoring.Operations.deleteContent(
                    [contentTO]);
            },
            failure: function (error) {
                console.error(error);
            }
        }

        CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
    }

    CStudioSearch.previewElement = function(url){
        CStudioAuthoring.Service.lookupContentItem(
            CStudioAuthoringContext.site, 
            url, 
            { success:function(to) { 
                CStudioAuthoring.Operations.openPreview(to.item, 'undefined', false, false); 
            }, 
            failure: function() {} 
        }, false);
    }

    CStudioSearch.updateUrl = function(){
        //TODO: handle filters

        var searchContext = this.searchContext,
            newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?site=' + CStudioAuthoringContext.site;

        newUrl += '&page=' + searchContext.currentPage;
        newUrl += '&searchId=' + searchContext.searchId;
        newUrl += '&sortBy=' + searchContext.sortBy;
        newUrl += '&keywords=' + searchContext.keywords;
        
        window.history.pushState({path:newUrl},'',newUrl);
    }

}) (window, jQuery, Handlebars);
