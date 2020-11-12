/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

CStudioForms.Controls.RTE.InsertPredefinedTable = CStudioForms.Controls.RTE.InsertPredefinedTable || {
  createControl: function (name, cm) {
    var predefinedTables = cm.editor.contextControl.rteTables;
    predefinedTables =
      predefinedTables === undefined
        ? []
        : Array.isArray(predefinedTables)
        ? predefinedTables
        : [predefinedTables.table];

    if (name == 'predefinedTable' && predefinedTables && predefinedTables.length) {
      var c = cm.createMenuButton('predefinedTable', {
        title: 'Insert predefined table',
        image:
          CStudioAuthoringContext.authoringAppBaseUri +
          '/static-assets/themes/cstudioTheme/images/icons/predefined-table.png',
        icons: false
      });

      c.onRenderMenu.add(function (c, m) {
        var addMenuOption = function (el) {
          this.add({
            title: el.name,
            onclick: function () {
              tinymce2.activeEditor.execCommand('mceInsertContent', false, el.prototype);
            }
          });
        };
        predefinedTables.forEach(addMenuOption, m);
      });

      // Return the new menu button instance
      return c;
    }
    return null;
  },
  /**
   * Returns information about the plugin as a name/value array.
   * The current keys are longname, author, authorurl, infourl and version.
   *
   * @return {Object} Name/value array containing information about the plugin.
   */
  getInfo: function () {
    return {
      longname: 'Crafter Studio Insert Predefined Table',
      author: 'Crafter Software',
      authorurl: 'http://www.craftercms.org',
      infourl: 'http://www.craftercms.org',
      version: '1.0'
    };
  }
};

tinymce2.create(
  'tinymce2.plugins.CStudioManagedPredefinedTablePlugin',
  CStudioForms.Controls.RTE.InsertPredefinedTable
);

// Register plugin with a short name
tinymce2.PluginManager.add('insertpredefinedtable', tinymce2.plugins.CStudioManagedPredefinedTablePlugin);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-rte-insert-predefined-table',
  CStudioForms.Controls.RTE.InsertPredefinedTable
);
