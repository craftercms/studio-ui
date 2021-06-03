/*
 * Ace Editor Plugin for TinyMCE 5.0
 * By Jose Vega
 */

(function () {
	var acecode = (function () {
			'use strict';

			var global = tinymce.util.Tools.resolve('tinymce.PluginManager'),
				mce_editor;

			var setContent = function (editor, html) {
				editor.focus();
				editor.undoManager.transact(function () {
					editor.setContent(html);
				});
				editor.selection.setCursorLocation();
				editor.nodeChanged();
			};
			var getContent = function (editor) {
				return editor.getContent({ source_view: true });
			};
			var Content = {
				setContent: setContent,
				getContent: getContent
			};

			var open = function (editor) {
				var editorContent = Content.getContent(editor);
				var _dialog = editor.windowManager.open({
					title: 'Code Editor',
					size: 'large',
					body: {
						type: 'panel',
						items: [{
								type: 'htmlpanel',
								html: '<div id="mce-ace-editor-block"></div>',
								name: 'code'
							}]
					},
					buttons: [
						{
							type: 'cancel',
							name: 'cancel',
							text: 'Cancel'
						},
						{
							type: 'submit',
							name: 'save',
							text: 'Save',
							primary: true
						}
					],
					initialData: { code: editorContent },
					onSubmit: function (api) {
						Content.setContent(editor, mce_editor.getValue());
						api.close();
					}
				});
			};
			var Dialog = { open: function(editor){
				open(editor);

				var dialog = document.getElementsByClassName('tox-dialog--width-lg')[0];
				dialog.classList.add('fullscreen');
				dialog.classList.add('acecode');

        const wrapCode = editor.getParam('code_editor_wrap');
        mce_editor = ace.edit('mce-ace-editor-block', {
          wrap: wrapCode
        });
				mce_editor.setTheme("ace/theme/eclipse");
				mce_editor.getSession().setMode("ace/mode/html");
				mce_editor.setOptions({
					showPrintMargin: false
				});
				mce_editor.getSession().setValue(Content.getContent(editor));
			} };

			var register = function (editor) {
				editor.addCommand('mceace_codeEditor', function () {
					Dialog.open(editor);
				});
			};
			var Commands = { register: register };

			var register$1 = function (editor) {
				editor.ui.registry.addButton('acecode', {
                    icon: 'sourcecode',
					tooltip: 'Code Editor',
					onAction: function () {
						return Dialog.open(editor);
					}
				});
				editor.ui.registry.addMenuItem('acecode', {
                    icon: 'sourcecode',
                    text: 'Code Editor',
					onAction: function () {
						return Dialog.open(editor);
					}
				});
			};
			var Buttons = { register: register$1 };

			global.add('acecode', function (editor) {
				Commands.register(editor);
				Buttons.register(editor);
				return {};
			});
			function Plugin () {
			}

			return Plugin;

	}());
})();
