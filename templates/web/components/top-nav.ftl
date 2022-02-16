<!--
  ~ Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

<div id="menu">
    <ul>
    <#assign navigation = siteNavService.getSiteNavigation("site/website", 1)>
    <#assign topFolders = navigation.childNodes>
    <#list topFolders as tab>
    	<#if tab.item.isFolder()>
    		<#assign item_url = urlTransformationService.transform('folderToViewNameTransformer', tab.item.url)>
    	<#else>
    		<#assign item_url = urlTransformationService.transform('pageToViewNameTransformer', tab.item.url)>
    	</#if>
    	<#if urlTransformationService.transform('pageToViewNameTransformer', page.storeUrl)?starts_with(item_url)>
    		<#assign item_class = 'current'>
    	<#else>
    		<#assign item_class = ''>
    	</#if>
    	<li class="${item_class}"><a href="${item_url}">${tab['//internal-name']! tab.item.name}</a></li>
    </#list>
	<#-- c:forEach items="#{navigation.topFolders}" var="tab">
		<c:choose>
			<c:when test="${navigation.getDisplayName(tab).equals('crafter level descriptor.level') == false}">
				<c:choose>
					<c:when test="${navigation.isNodeExpanded(tab) == 'true'}">
						<li class="current"><a href="#{navigation.getNodeUrl(tab)}">#{navigation.getDisplayName(tab)}</a></li>
					</c:when>
					<c:otherwise>
						<li><a href="#{navigation.getNodeUrl(tab)}">#{navigation.getDisplayName(tab)}</a></li>
					</c:otherwise>
				</c:choose>
			</c:when>
		</c:choose>
	</c:forEach -->
	</ul>
</div>

