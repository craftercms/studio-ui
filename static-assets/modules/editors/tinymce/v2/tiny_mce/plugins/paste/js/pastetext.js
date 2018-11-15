tinymce2Popup.requireLangPack();

var PasteTextDialog = {
	init : function() {
		this.resize();
	},

	insert : function() {
		var h = tinymce2Popup.dom.encode(document.getElementById('content').value), lines;

		// Convert linebreaks into paragraphs
		if (document.getElementById('linebreaks').checked) {
			lines = h.split(/\r?\n/);
			if (lines.length > 1) {
				h = '';
				tinymce2.each(lines, function(row) {
					h += '<p>' + row + '</p>';
				});
			}
		}

		tinymce2Popup.editor.execCommand('mceInsertClipboardContent', false, {content : h});
		tinymce2Popup.close();
	},

	resize : function() {
		var vp = tinymce2Popup.dom.getViewPort(window), el;

		el = document.getElementById('content');

		el.style.width  = (vp.w - 20) + 'px';
		el.style.height = (vp.h - 90) + 'px';
	}
};

tinymce2Popup.onInit.add(PasteTextDialog.init, PasteTextDialog);
