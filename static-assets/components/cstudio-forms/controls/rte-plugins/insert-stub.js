/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioForms.Controls.RTE.InsertStub = CStudioForms.Controls.RTE.InsertStub || {
  createControl: function (n, cm, editor) {
    switch (n) {
      case 'insertStub':
        var config = tinymce2.activeEditor.contextControl.rteConfig;
        var layouts = config.rteStubs.stub;

        if (!layouts) {
          layouts = [];
        }

        if (!layouts.length) {
          layouts = [layouts];
        }

        if (layouts.length > 0) {
          var c = cm.createMenuButton('insertStub', {
            title: 'Insert Stub',
            style: 'mce_insertComponentPencil'
          });

          c.layouts = layouts;

          c.onRenderMenu.add(function (c, m) {
            for (var i = 0; i < layouts.length; i++) {
              var layout = layouts[i];
              var prototype = layout.prototype;

              var onClickFn = function () {
                tinymce2.activeEditor.execCommand('mceInsertContent', false, this.layoutPrototype);
                ed.contextControl.save();
              };

              var layoutItem = {
                title: layout.name,
                onclick: onClickFn,
                layoutPrototype: prototype
              };

              m.add(layoutItem);
            }
          });

          return c;
        } else {
          // no layouts to render
        }
    }

    return null;
  }
};

tinymce2.create('tinymce2.plugins.CStudioInsertStubPlugin', CStudioForms.Controls.RTE.InsertStub);

// Register plugin with a short name
tinymce2.PluginManager.add('insertstub', tinymce2.plugins.CStudioInsertStubPlugin);

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte-insert-stub', CStudioForms.Controls.RTE.InsertStub);
