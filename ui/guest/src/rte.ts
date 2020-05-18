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

import { ElementRecord } from './models/InContextEditing';
import iceRegistry from './classes/ICERegistry';
import { Editor } from 'tinymce';
import contentController from './classes/ContentController';
import { createGuestStore } from './store/store';

export function initTinyMCE(record: ElementRecord) {
  const store = createGuestStore();
  const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
  const type = field?.type;
  const plugins = ['paste'];
  type === 'html' && plugins.push('quickbars');
  const elementDisplay = $(record.element).css('display');
  if (elementDisplay === 'inline') {
    $(record.element).css('display', 'inline-block');
  }
  window.tinymce.init({
    mode: 'none',
    target: record.element,
    plugins,
    paste_as_text: true,
    toolbar: false,
    menubar: false,
    inline: true,
    base_url: '/studio/static-assets/modules/editors/tinymce/v5/tinymce',
    suffix: '.min',
    setup(editor: Editor) {
      editor.on('init', function () {
        let changed = false;
        let originalContent = getContent();

        editor.focus(false);
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);

        // In some cases the 'blur' event is getting caught somewhere along
        // the way. Focusout seems to be more reliable.
        editor.on('focusout', (e) => {
          if (!e.relatedTarget) {
            e.stopImmediatePropagation();
            save();
            cancel();
          }
        });

        editor.once('change', () => {
          changed = true;
        });

        editor.on('keydown', (e) => {
          if (e.keyCode === 27) {
            e.stopImmediatePropagation();
            editor.setContent(originalContent);
            cancel();
          }
        });

        function save() {
          const content = getContent();

          if (changed) {
            contentController.updateField(record.modelId, field.id, record.index, content);
          }
        }

        function getContent() {
          return type === 'html' ? editor.getContent() : editor.getContent({ format: 'text' });
        }

        function destroyEditor() {
          editor.destroy(false);
        }

        function cancel() {
          store.dispatch({ type: 'exit_component_inline_edit' });

          const content = getContent();
          destroyEditor();

          // In case the user did some text bolding or other formatting which won't
          // be honoured on plain text, revert the content to the edited plain text
          // version of the input.
          changed && type === 'text' && $(record.element).html(content);

          if (elementDisplay === 'inline') {
            $(record.element).css('display', '');
          }
        }
      });
    }
  });
}
