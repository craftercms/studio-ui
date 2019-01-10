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

CStudioSearch.ResultRenderer.Default = {
	render: function(contentTO) {
		var liveUrl = CStudioAuthoringContext.liveAppBaseUri + contentTO.item.browserUri;

		if (!CStudioAuthoring.Utils.isEmpty(contentTO.item.contentType)) {
			var ctype = contentTO.item.contentType;
		}

		var contentType = CStudioSearch.getContentTypeName(contentTO.item.contentType);
		
		var onPreviewCode = "Page" === contentType ? "CStudioAuthoring.Service.lookupContentItem('" +
		                    CStudioAuthoringContext.site + 
		                    "', '" +  
		                    contentTO.item.uri +"', " +
		                    "{ success:function(to) { CStudioAuthoring.Operations.openPreview(to.item, '" + 
		                    window.id +
		                    "', false, false); }, failure: function() {} }, false); return false;" : "";

		var result = 
			"<a href='#' " +
				"onclick=\"" + onPreviewCode + "\" " +
				"class='" + ((contentTO.item && "Component" === contentType) ? "cstudio-search-no-preview":"cstudio-search-download-link") +
			       	"'>"+contentTO.item.internalName+(contentTO.item.newFile?"*":"")+"</a>" +
				"<span class='cstudio-search-download-link-additional'>  " + 
					contentType +
				"</span>" +
				"<br />"+
				"<div class='cstudio-search-result-detail'>";
					
					if(contentTO.item.previewable && contentTO.item.previewable == true) {
						result +=
							"<div>"+liveUrl+"</div>"
					}
					
				
		return CStudioSearch.renderCommonResultWrapper(contentTO, result);
	}
};

// register renderer
CStudioSearch.resultRenderers["default"] = CStudioSearch.ResultRenderer.Default;
CStudioAuthoring.Module.moduleLoaded("search-result-default", CStudioSearch.resultRenderers["default"]);