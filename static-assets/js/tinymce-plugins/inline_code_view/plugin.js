/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

const PLUGIN_NAME = 'inline_code_view';
const BUTTON_TOOL_TIP = 'Toggle code view mode';

tinymce.PluginManager.add(PLUGIN_NAME, function (editor, url) {
  let isActive = true;
  editor.ui.registry.addButton(PLUGIN_NAME, {
    icon: 'sourcecode',
    tooltip: BUTTON_TOOL_TIP,
    onAction: function () {
      toggleCode(this, editor);
    }
  });

  editor.ui.registry.addMenuItem(PLUGIN_NAME, {
    icon: 'sourcecode',
    text: 'Inline Code Editor',
    onAction: function () {
      toggleCode(this, editor);
    }
  });

  $('#' + editor.id).on('change', function () {
    editor.setContent($(this).val());
  });

  const toggleCode = (elem, editor) => {
    isActive = !isActive;
    const aceID = 'ace-editor-' + editor.id;
    const $buttonTooltip = $(`[aria-label="${BUTTON_TOOL_TIP}"]`);
    const $editor = $('#' + editor.id);

    if (!isActive) {
      // Code mode
      editor.mode.set('readonly');
      $buttonTooltip.removeClass('tox-tbtn--disabled');
      $buttonTooltip.removeAttr('aria-disabled');
      $buttonTooltip.css('cursor', 'pointer');
      $buttonTooltip.find('svg').css('fill', '#222f3e');
      $editor[0].value = editor.dom.decode(editor.getContent({ source_view: !0 }));
      $editor.css('height', $(editor.getDoc()).height() + 'px').show();

      if (typeof ace !== 'undefined') {
        const textarea = $editor.hide();

        $editor.after(
          `<div id="${aceID}-container" style="border: 1px solid #ced4da; border-bottom: none">` +
            `  <div id="${aceID}"></div>` +
            '</div>'
        );

        $('#' + aceID + '-container').prepend(
          `<div style="border-bottom: 1px solid #ced4da; text-align: right"><button id="${aceID}-toggleCode" ` +
            '  aria-label="Close code view mode" title="Close code view mode" type="button" tabIndex="-1" ' +
            '  style="background: none; cursor: pointer; border: none; padding: 6px; height: 24px; box-sizing: content-box"' +
            '>' +
            '  <svg width="24" height="24"><path d="M17.3 8.2L13.4 12l3.9 3.8a1 1 0 01-1.5 1.5L12 13.4l-3.8 3.9a1 1 0 01-1.5-1.5l3.9-3.8-3.9-3.8a1 1 0 011.5-1.5l3.8 3.9 3.8-3.9a1 1 0 011.5 1.5z" fill-rule="evenodd"></path></svg>' +
            '</button></div>'
        );

        $(`#${aceID}-toggleCode`).on('click', () => {
          toggleCode(elem, editor);
        });

        const aceEditor = ace.edit(aceID);

        aceEditor.$blockScrolling = 'Infinity';
        aceEditor.setTheme('ace/theme/chrome');
        aceEditor.session.setMode('ace/mode/html_ruby');
        aceEditor.setValue(textarea.val(), 1);
        aceEditor.setOptions({
          wrap: true,
          displayIndentGuides: true,
          highlightActiveLine: false,
          showPrintMargin: false,
          minLines: Math.round(300 / 17),
          maxLines: Math.round(300 / 17)
        });
        aceEditor.on('change', function () {
          textarea.val(aceEditor.getValue()).trigger('keyup');
          editor.setContent(aceEditor.getValue());
        });
      }
    } else {
      // Editor mode
      editor.mode.set('design');
      $editor.hide();
      if (typeof ace !== 'undefined') {
        const aceEditor = ace.edit(aceID);
        aceEditor.destroy();
        $('#' + aceID + '-container').remove();
      }
    }
  };
});
