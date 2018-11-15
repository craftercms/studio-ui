tinymce2Popup.requireLangPack();

var ExampleDialog = {
	init : function() {
		var f = document.forms[0];

		// Get the selected contents as text and place it in the input
		f.someval.value = tinymce2Popup.editor.selection.getContent({format : 'text'});
		f.somearg.value = tinymce2Popup.getWindowArg('some_custom_arg');
	},

	insert : function() {
		// Insert the contents from the input into the document
		tinymce2Popup.editor.execCommand('mceInsertContent', false, document.forms[0].someval.value);
		tinymce2Popup.close();
	}
};

tinymce2Popup.onInit.add(ExampleDialog.init, ExampleDialog);
