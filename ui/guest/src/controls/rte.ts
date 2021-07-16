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

import { ElementRecord } from '../models/InContextEditing';
import * as iceRegistry from '../classes/ICERegistry';
import { Editor } from 'tinymce';
import * as contentController from '../classes/ContentController';
import { ContentTypeFieldValidations } from '@craftercms/studio-ui/models/ContentType';
import { post } from '../utils/communicator';
import { GuestStandardAction } from '../store/models/GuestStandardAction';
import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import $ from 'jquery';

export function initTinyMCE(
  record: ElementRecord,
  validations: Partial<ContentTypeFieldValidations>
): Observable<GuestStandardAction> {
  const dispatch$ = new Subject<GuestStandardAction>();
  const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
  const type = field?.type;
  const plugins = ['paste'];
  const elementDisplay = $(record.element).css('display');
  if (elementDisplay === 'inline') {
    $(record.element).css('display', 'inline-block');
  }
  window.tinymce.init({
    mode: 'none',
    target: record.element,
    // For some reason this is not working.
    // body_class: 'craftercms-rich-text-editor',
    plugins,
    paste_as_text: true,
    paste_data_images: type === 'html',
    toolbar: type === 'html',
    menubar: false,
    inline: true,
    base_url: '/studio/static-assets/modules/editors/tinymce/v5/tinymce',
    suffix: '.min',
    setup(editor: Editor) {
      editor.on('init', function() {
        let changed = false;
        let originalContent = getContent();

        editor.focus(false);
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);

        // In some cases the 'blur' event is getting caught somewhere along
        // the way. Focusout seems to be more reliable.
        editor.on('focusout', (e) => {
          if (!e.relatedTarget) {
            if (validations?.required && !getContent().trim()) {
              post({
                type: 'VALIDATION_MESSAGE',
                payload: {
                  id: 'required',
                  level: 'required',
                  values: { field: record.label }
                }
              });
              editor.setContent(originalContent);
            } else {
              save();
            }
            e.stopImmediatePropagation();
            cancel();
          }
        });

        editor.once('change', () => {
          changed = true;
        });

        editor.on('keydown', (e) => {
          if (e.key === 'Escape') {
            e.stopImmediatePropagation();
            editor.setContent(originalContent);
            cancel();
          } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            editor.fire('focusout');
          } else if (
            validations?.maxLength &&
            // TODO: Check/improve regex
            /[a-zA-Z0-9-_ ]/.test(String.fromCharCode(e.keyCode)) &&
            getContent().length + 1 > parseInt(validations.maxLength.value)
          ) {
            post({
              type: 'VALIDATION_MESSAGE',
              payload: {
                id: 'maxLength',
                level: 'required',
                values: { maxLength: validations.maxLength.value }
              }
            });
            e.stopPropagation();
            return false;
          }
        });

        function save() {
          const content = getContent();
          if (changed) {
            contentController.updateField(record.modelId, record.fieldId[0], record.index, content);
          }
        }

        function getContent() {
          return type === 'html' ? editor.getContent() : editor.getContent({ format: 'text' });
        }

        function destroyEditor() {
          editor.destroy(false);
        }

        function cancel() {
          const content = getContent();
          destroyEditor();

          // In case the user did some text bolding or other formatting which won't
          // be honoured on plain text, revert the content to the edited plain text
          // version of the input.
          changed && type === 'text' && $(record.element).html(content);

          if (elementDisplay === 'inline') {
            $(record.element).css('display', '');
          }

          dispatch$.next({ type: 'exit_component_inline_edit' });
          dispatch$.complete();
          dispatch$.unsubscribe();
        }
      });
      editor.on('keydown', (e) => {
        if ((type === 'text' || type === 'textarea') && (e.key === 'Enter' || (e.shiftKey && e.key === 'Enter'))) {
          e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
        }
      });
    }
  });
  return dispatch$.pipe(startWith({ type: 'edit_component_inline' }));
}
