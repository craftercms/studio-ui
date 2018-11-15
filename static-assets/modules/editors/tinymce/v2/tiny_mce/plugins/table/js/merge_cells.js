tinymce2Popup.requireLangPack();

var MergeCellsDialog = {
	init : function() {
		var f = document.forms[0];

		f.numcols.value = tinymce2Popup.getWindowArg('cols', 1);
		f.numrows.value = tinymce2Popup.getWindowArg('rows', 1);
	},

	merge : function() {
		var func, f = document.forms[0];

		tinymce2Popup.restoreSelection();

		func = tinymce2Popup.getWindowArg('onaction');

		func({
			cols : f.numcols.value,
			rows : f.numrows.value
		});

		tinymce2Popup.close();
	}
};

tinymce2Popup.onInit.add(MergeCellsDialog.init, MergeCellsDialog);
