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

tinymce.PluginManager.add('editform', function(editor, url) {
  editor.ui.registry.addButton('editform', {
    icon: 'edit-block',
    tooltip: 'Edit',
    onAction: () => {
      const openEditForm = editor.getParam('openEditForm');
      openEditForm?.();
    }
  });

  return {
    getMetadata: function() {
      return {
        name: 'Edit Form'
      };
    }
  };
});
