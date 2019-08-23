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
 * File: delete.js
 * Component ID: templateholder-delete
 * @author: Roy Art
 * @date: 10.01.2011
 **/
(function(){

    CStudioAuthoring.register("TemplateHolder.Approve", {
        ITEM_ROW: [
            '<tr>',
                '<td class="text-center small"><input type="checkbox" class="item-checkbox" data-item-id="{uri}" checked/></td>',
                '<td class="name large">',
                    '<div class="in">',
                        '<span id="{index}" class="toggleDependencies ttOpen parent-div-widget" style="margin-right:17px; margin-bottom: -2px; float: left;" ',
                        'data-loaded="false" data-path="{uri}"></span>',
                        '<span style="overflow:hidden; display: block;">{internalName} {uri}</span></div>',
                '</td>',
                '<td class="text-right schedule medium">{scheduledDate}</td>',
            '</tr>'
        ].join(""),
        SUBITEM_ROW: [
            '<tr class="{index}" style="display:none;">',
                '<td style="width:5%;"></td>',
                // '<td class="text-center small" style="padding-left: 25px;width: 1%;"><input type="checkbox" class="item-checkbox" data-item-id="{uri}" checked/></td>', //TODO: checkbox to remove dependencies publish
                '<td class="text-center small" style="padding-left: 25px;width: 5%;"></td>',
                '<td class="name large"><div class="in">{uri}</div></div></td>',
            '</tr>'
        ].join("")
    });

    CStudioAuthoring.Env.ModuleMap.map("template-approve", CStudioAuthoring.TemplateHolder.Approve);

})();
