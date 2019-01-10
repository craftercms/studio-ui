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

    CStudioAuthoring.register("TemplateHolder.Delete", {
        ROOT_ROW: [
            '<tr>',
                '<td class="deleteLarge">',
                    '<div class="item">',
                        '<input class="item-check" id="{id}" type="checkbox" json="{data}" uri="{uri}" {checked} scheduleddate="{scheduledDate}" /> ',
                        '<label for="{id}" class="{class}" title="{internalName}">{displayName}</label>',
                    '</div>',
                '</td>',
                '<td class="deleteLarge">',
                    '<div class="item-desc" title="{url}">',
                        '{displayURL}',
                    '</div>',
                '</td>',
                '<td class="deleteSmall">',
                    '<div class="item-sch">',
                        '<a class="when" href="javascript:" checkid="{id}">{scheduledDateText}</a>',
                    '</div>',
                '</td>',
            '</tr>'
        ].join(""),
        SUB_ROW: [
            '<tr>',
                '<td class="deleteLarge">',
                    '<div class="item sub-item">',
                        '<input class="item-check" id="{id}" type="checkbox" json="{data}" parentid="{parent}" uri="{uri}" scheduleddate="{scheduledDate}" {checked} /> ',
                        '<label for="{id}" class="{class}" title="{internalName}">{displayName}</label>',
                    '</div>',
                '</td>',
                '<td class="deleteLarge">',
                    '<div class="item-desc" title="{url}">',
                        '{displayURL}',
                    '</div>',
                '</td>',
                '<td class="deleteSmall">',
                    '<div class="item-sch">',
                        '<a class="when" href="javascript:" checkid="{id}">{scheduledDateText}</a>',
                    '</div>',
                '</td>',
            '</tr>'
        ].join(""),
        OVERLAY: [
            '<div class="schedule-overlay" style="padding:10px">',
                '<div class="bd">',
                    '<div>',
                        '<input type="radio" name="when-to-delete" class="now" /> Now',
                        '<a href="javascript:" class="overlay-close" style="float:right">Done</a>',
                    '</div>',
                    '<div>',
                        '<input type="radio" name="when-to-delete" class="scheduled" /> ',
                        '<input class="date-picker water-marked" value="Date..." default="Date..." />',
                        '<input class="time-picker water-marked" value="Time..." default="Time..." />',
                    '</div>',
                '</div>',
            '</div>'
        ].join(""),
        SUCCESS: [
            '<h1 class="view-title">{title}</h1>',
            '<div class="msg-area" style="height:100px;margin-top:15px;color:#000;">{msg}</div>',
            '<div class="action-wrapper acnSubmitButtons">',
                '<input id="submittal-complete-btn" type="button" value="OK" style="width:80px;" class="action-complete-close1 btn btn-primary" />',
            '</div>'
        ].join("")
    });

    CStudioAuthoring.Env.ModuleMap.map("template-delete", CStudioAuthoring.TemplateHolder.Delete);

})();
