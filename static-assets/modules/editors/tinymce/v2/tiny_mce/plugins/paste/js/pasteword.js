tinymce2Popup.requireLangPack();

var PasteWordDialog = {
	init : function() {
		var ed = tinymce2Popup.editor, el = document.getElementById('iframecontainer'), ifr, doc, css, cssHTML = '';

		// Create iframe
		el.innerHTML = '<iframe id="iframe" src="javascript:\'\';" frameBorder="0" style="border: 1px solid gray"></iframe>';
		ifr = document.getElementById('iframe');
		doc = ifr.contentWindow.document;

		// Force absolute CSS urls
		css = [ed.baseURI.toAbsolute("themes/" + ed.settings.theme + "/skins/" + ed.settings.skin + "/content.css")];
		css = css.concat(tinymce2.explode(ed.settings.content_css) || []);
		tinymce2.each(css, function(u) {
			cssHTML += '<link href="' + ed.documentBaseURI.toAbsolute('' + u) + '" rel="stylesheet" type="text/css" />';
		});

		// Write content into iframe
		doc.open();
		doc.write('<html><head>' + cssHTML + '</head><body class="mceContentBody" spellcheck="false"></body></html>');
		doc.close();

		doc.designMode = 'on';
		this.resize();

		window.setTimeout(function() {
			ifr.contentWindow.focus();
		}, 10);
	},

	insert : function() {
		var h = document.getElementById('iframe').contentWindow.document.body.innerHTML;

		tinymce2Popup.editor.execCommand('mceInsertClipboardContent', false, {content : h, wordContent : true});
		tinymce2Popup.close();
	},

	resize : function() {
		var vp = tinymce2Popup.dom.getViewPort(window), el;

		el = document.getElementById('iframe');

		if (el) {
			el.style.width  = (vp.w - 20) + 'px';
			el.style.height = (vp.h - 90) + 'px';
		}
	}
};

tinymce2Popup.onInit.add(PasteWordDialog.init, PasteWordDialog);
