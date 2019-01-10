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

/**
 * Override the OTTB default
 * Default Search Filter, includes all options
 */
CStudioSearch.FilterRenderer.Default = function() {

	CStudioSearch.FilterRenderer.Default.prototype = new CStudioSearch.FilterRenderer.Common();

	var filter = new CStudioSearch.FilterRenderer.Common();

	filter.self = filter;
	filter.title = "WCM Browse";
	filter.contentTypes = [];
	filter.includeAspects = [];
	filter.excludeAspects = [];
	filter.keywords = " ";
	filter.filterCols = [ new CStudioSearch.FilterRenderer.Common.PathSelect("") ];

	return filter;
}

// register this filter renderer
CStudioSearch.filterRenderers["default"] = new CStudioSearch.FilterRenderer.Default();
