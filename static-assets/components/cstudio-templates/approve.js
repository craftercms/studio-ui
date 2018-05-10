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
