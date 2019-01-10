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

(function (CSA) {

    var BU, HTML,
        fmt = CSA.StringUtils.format;

    CSA.register("Dialogs.BulkUpload", function () {
        this.init.apply(this, arguments);
    });

    BU = CSA.Dialogs.BulkUpload;

    BU.prototype = {
        init: function () {

            var id = CStudioAuthoring.Utils.getScopedId('dropbox'),
                frag, elem, me = this,
                html = fmt(HTML, id);

            try {
                var range = document.createRange();
                frag = range.createContextualFragment(html);
            } catch (e) {
                frag = document.createElement('div');
                frag.innerHTML = html;
            }

            elem = frag.childNodes[0];

            // Close the overlay when "esc" key is pressed
            var escKeyListener = function (e) {
                if (e.which === 27) {
                    me.close();
                    window.removeEventListener('keydown', escKeyListener, false);
                    Self.refreshNodes(oCurrentTextNode,false, false, null, null, true);
                }
            };

            window.addEventListener('keydown', escKeyListener, false);

            // Initialise close element click
            elem.querySelector('a.cancel').addEventListener('click', function (e) {
                me.close();
            }, false);
            elem.querySelector('a.close').addEventListener('click', function (e) {
                me.close();
                Self.refreshNodes(oCurrentTextNode,false, false, null, null, true);
            }, false);

            this.id = id;
            this.element = elem;

        },
        close: function () {
            var e = document.getElementById(this.id);
            e.parentNode.removeChild(e);
            // TODO refresh folder?
        }
    };

    HTML = [
        '<div id="{0}" class="bulk-upload full-screen-overlay dropbox-element">',
        '<div class="buttons-container">',
        '<a href="javascript:;" class="close" title="Close (Esc)" style="display:none;">Done</a>',
        '<a href="javascript:;" class="cancel" title="Cancel (Esc)">Cancel</a>',
        '</div>',
        '<div class="message">',
        '<div class="pad">',
        'Drop the desired files from your desktop into the browser\'s window.',
        '</div>',
        '</div>',
        '<div class="file-display-container">',
        '<div class="pad">',
        // files get displayed here
        '</div>',
        '</div>',
        '<script type="text/html" id="template_{0}">',
        '<div class="<%= theme.fileDisplay %>">',
        '<div class="image shadow clearfix">',
        '<%= (file.type.match(/image.*/)) ',
        ' ? ',
        "'", '<img src="',"'+",'file.src',"+'",'" alt="',"'+",'file.name',"+'",'" title="',"'+",'file.src',"+'",'" />', "'",
        ' : ', "'",
        '<div class="img">',
        '<div class="pad">', "'+", 'file.type', "+'", '</div>',
        '</div>', "'",
        '%>',
        '<strong class="title"><%= file.name %></strong>',
        '<div class="details"><%= file.type %> @ <%= Math.round(file.size / 1024) %> KB</div>',
        '<div class="progress">',
        '<div class="bar"></div>',
        '</div>',
        '</div>',
        '</div>',
        '</script>',
        '</div>'
    ].join('');

    CSA.Env.ModuleMap.map("dialog-bulkupload", BU);
    CSA.Module.moduleLoaded("dialog-bulkupload", BU);

}) (CStudioAuthoring);