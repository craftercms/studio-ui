// This file is just a sample for people wanting to implement the hooks.
// Should not be actually loaded by the product.

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

(function () {
  'use strict';

  var pluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  function TinyHooks(editor) {
    return {
      paste_preprocess(plugin, args) {
        console.log('Doing some custom paste pre process.');
      },
      paste_postprocess(plugin, args) {
        console.log('Doing some custom paste post process.');
      }
    };
  }

  Object.assign(TinyHooks, {
    setup(editor) {
      console.log('Doing some custom setup.');
    }
  });

  pluginManager.add('craftercms_tinymce_hooks', TinyHooks);
})();
