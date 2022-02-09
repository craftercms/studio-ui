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
import * as iceRegistry from '../iceRegistry';
import { Editor } from 'tinymce';
import * as contentController from '../contentController';
import { ContentTypeFieldValidations } from '@craftercms/studio-ui/models/ContentType';
import { post } from '../utils/communicator';
import { GuestStandardAction } from '../store/models/GuestStandardAction';
import { Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import $ from 'jquery';
import { reversePluckProps } from '@craftercms/studio-ui/utils/object';
import { showEditDialog, validationMessage } from '@craftercms/studio-ui/state/actions/preview';
import { RteSetup } from '../models/Rte';
import { editComponentInline, exitComponentInlineEdit } from '../store/actions';
import { emptyFieldClass } from '../constants';

export function initTinyMCE(
  record: ElementRecord,
  validations: Partial<ContentTypeFieldValidations>,
  rteSetup?: RteSetup
): Observable<GuestStandardAction> {
  const dispatch$ = new Subject<GuestStandardAction>();
  const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
  const type = field?.type;
  const elementDisplay = $(record.element).css('display');
  if (elementDisplay === 'inline') {
    $(record.element).css('display', 'inline-block');
  }

  const openEditForm = () => {
    post({
      type: showEditDialog.type,
      payload: {
        selectedFields: [field.id]
      }
    });
  };

  const controlPropsMap = {
    enableSpellCheck: 'browser_spellcheck',
    forceRootBlockPTag: 'forced_root_block'
  };
  const controlProps = {};
  Object.keys(controlPropsMap).forEach((key) => {
    if (field.properties?.[key]) {
      const propKey = controlPropsMap[key];
      controlProps[propKey] = field.properties[key].value;
    }
  });

  const external: { [id: string]: string } = {
    ...rteSetup?.tinymceOptions?.external_plugins,
    acecode: '/studio/static-assets/js/tinymce-plugins/ace/plugin.min.js',
    editform: '/studio/static-assets/js/tinymce-plugins/editform/plugin.js',
    craftercms_paste_extension: '/studio/static-assets/js/tinymce-plugins/craftercms_paste_extension/plugin.js'
  };

  const $element = $(record.element);
  $element.removeClass(emptyFieldClass);

  window.tinymce.init({
    mode: 'none',
    target: record.element,
    // For some reason this is not working.
    // body_class: 'craftercms-rich-text-editor',
    plugins: ['paste editform', rteSetup?.tinymceOptions?.plugins].filter(Boolean).join(' '), // 'editform' & 'paste' plugins will always be loaded
    paste_as_text: type !== 'html',
    paste_data_images: type === 'html',
    paste_preprocess(plugin, args) {
      window.tinymce.activeEditor.plugins.craftercms_paste_extension?.paste_preprocess(plugin, args);
    },
    paste_postprocess(plugin, args) {
      window.tinymce.activeEditor.plugins.craftercms_paste_extension?.paste_postprocess(plugin, args);
    },
    toolbar: type === 'html',
    menubar: false,
    inline: true,
    base_url: '/studio/static-assets/modules/editors/tinymce/v5/tinymce',
    suffix: '.min',
    external_plugins: external,
    code_editor_inline: false,
    skin: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
    setup(editor: Editor) {
      const pluginManager = window.tinymce.util.Tools.resolve('tinymce.PluginManager');

      editor.on('init', function () {
        let changed = false;
        let originalContent = getContent();

        editor.focus(false);
        editor.selection.select(editor.getBody(), true);
        editor.selection.collapse(false);

        // In some cases the 'blur' event is getting caught somewhere along
        // the way. Focusout seems to be more reliable.
        editor.on('focusout', (e) => {
          if (!e.relatedTarget?.closest('.tox-tinymce')) {
            if (validations?.required && !getContent().trim()) {
              post(
                validationMessage({
                  id: 'required',
                  level: 'required',
                  values: { field: record.label }
                })
              );
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

        editor.once('external_change', () => {
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
            post(
              validationMessage({
                id: 'maxLength',
                level: 'required',
                values: { maxLength: validations.maxLength.value }
              })
            );
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
          changed && type === 'text' && $element.html(content);

          if (elementDisplay === 'inline') {
            $element.css('display', '');
          }

          if ($element.html().trim() === '') {
            $element.addClass(emptyFieldClass);
          }

          // The timeout prevents clicking the edit menu to be shown when clicking out of an RTE
          // with the intention to exit editing.
          setTimeout(() => {
            dispatch$.next({ type: exitComponentInlineEdit.type });
            dispatch$.complete();
            dispatch$.unsubscribe();
          }, 150);
        }

        if (type !== 'html') {
          // For plain text fields, remove keyboard shortcuts for formatting text
          // meta is used in tinymce for Ctrl (PC) and Command (macOS)
          // https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/#editorkeyboardshortcuts
          editor.addShortcut('meta+b', '', '');
          editor.addShortcut('meta+i', '', '');
          editor.addShortcut('meta+u', '', '');
        }
      });
      editor.on('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
        }
      });
      editor.on('DblClick', (e) => {
        e.stopPropagation();
        if (e.target.nodeName === 'IMG') {
          window.tinymce.activeEditor.execCommand('mceImage');
        }
      });
      editor.on('click', (e) => {
        e.stopPropagation();
      });
      // No point in waiting for `craftercms_tinymce_hooks` if the hook won't be loaded at all.
      external.craftercms_tinymce_hooks &&
        pluginManager.waitFor(
          'craftercms_tinymce_hooks',
          () => {
            const hooks = pluginManager.get('craftercms_tinymce_hooks');
            if (hooks) {
              pluginManager.get('craftercms_tinymce_hooks').setup?.(editor);
            } else {
              console.error(
                "The `craftercms_tinymce_hooks` was configured to be loaded but didn't load. Check the path is correct in the rte configuration file."
              );
            }
          },
          'loaded'
        );
    },
    ...(rteSetup?.tinymceOptions
      ? {
          ...reversePluckProps(
            rteSetup.tinymceOptions,
            'target', // Target can't be changed
            'inline', // Not using inline view doesn't behave well on pageBuilder, this setting shouldn't be changed.
            'setup',
            'base_url',
            'encoding',
            'autosave_ask_before_unload', // Autosave options are removed since it is not supported in control.
            'autosave_interval',
            'autosave_prefix',
            'autosave_restore_when_empty',
            'autosave_retention',
            'file_picker_callback', // No file picker is set by default, and functions are not supported in config file.
            'height', // Height is set to the size of content
            'file_picker_callback', // Files/images handlers currently not supported
            'paste_postprocess',
            'images_upload_handler',
            'code_editor_inline',
            'plugins' // Considered/used above, mixed with our options
          )
        }
      : {}),
    ...controlProps,
    openEditForm
  });

  return dispatch$.pipe(startWith({ type: editComponentInline.type }));
}
