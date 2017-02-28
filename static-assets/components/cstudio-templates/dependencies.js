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
