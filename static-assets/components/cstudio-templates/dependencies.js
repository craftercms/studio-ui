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
 * File: dependencies.js
 * Component ID: templateholder-dependencies
 **/
(function(){

    CStudioAuthoring.register("TemplateHolder.Dependencies", {
        ITEM_ROW: [
            '<tr>',
                '<td class="name large">',
                    '<div class="in">',
                        '<span id="{index}" class="toggleDependencies ttOpen parent-div-widget" style="margin-right:17px; margin-bottom: -2px; float: left;"></span>',
                        '<span style="overflow:hidden; display: block;">{internalName} {uri}</span></div>',
                '</td>',
                '<td class="text-right schedule medium">{scheduledDate}</td>',
            '</tr>'
        ].join(""),
        SUBITEM_ROW: [
            '<tr class="{index}">',
                '<td style="width:3%; min-width: 270px;">{internalName}</td>',
                '<td class="name large" title="{uri}"><div class="in">{uri}</div></td>',
                '<td class="small" style="text-align: right;"><a href="javascript:" data-url="{uri}" class="editLink {hidden}">Edit</a></td>',
            '</tr>'
        ].join("")
    });

    CStudioAuthoring.Env.ModuleMap.map("template-dependencies", CStudioAuthoring.TemplateHolder.Dependencies);

})();
