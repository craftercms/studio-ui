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
 * File: submit-for-delete.js
 * Component ID: templateholder-submit-for-delete
 * @author: Roy Art
 * @date: 10.01.2011
 **/
(function(){

    CStudioAuthoring.register("TemplateHolder.SubmitForDelete", {
        ROOT_ROW: [
            '<tr>',
                '<td>',
                    '<div class="item">',
                        '<input class="item-check" id="{id}" type="checkbox" json="{data}" uri="{uri}" {checked} /> ',
                        '<label for="{id}" class="{class}" title="{internalName}">{displayName}</label>',
                    '</div>',
                '</td>',
                '<td>',
                    '<div class="item-desc" title="{url}">',
                        '{displayURL}',
                    '</div>',
                '</td>',
            '</t�r>'
        ].join(""),
        SUB_ROW: [
            '<tr>',
                '<td>',
                    '<div class="item sub-item">',
                        '<input class="item-check" id="{id}" type="checkbox" json="{data}" parentid="{parent}" uri="{uri}" {checked} /> ',
                        '<label for="{id}" class="{class}" title="{internalName}">{displayName}</label>',
                    '</div>',
                '</td>',
                '<td>',
                    '<div class="item-desc" title="{url}">',
                        '{displayURL}',
                    '</div>',
                '</td>',
            '</tr>'
        ].join(""),
        SUCCESS: [
            '<h1 class="view-title">Submittal Complete</h1>',
            '<div class="msg-area" style="height:348px;margin-top:15px;color:#000;">{msg}</div>',
            '<div class="action-wrapper">',
                '<button style="width:80px;" class="action-complete-close1" onClick="CStudioAuthoring.Operations.pageReload(\'deleteSubmit\');">OK</button>',
            '</div>'
        ].join("")
    });

    CStudioAuthoring.Env.ModuleMap.map("template-submitfordelete", CStudioAuthoring.TemplateHolder.SubmitForDelete);

})();
