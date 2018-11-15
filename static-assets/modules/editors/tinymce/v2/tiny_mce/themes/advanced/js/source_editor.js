tinymce2Popup.requireLangPack();
tinymce2Popup.onInit.add(onLoadInit);

function saveContent() {
	tinymce2Popup.editor.setContent(document.getElementById('htmlSource').value, {source_view : true});
	tinymce2Popup.close();
}

function onLoadInit() {
	tinymce2Popup.resizeToInnerSize();

	// Remove Gecko spellchecking
	if (tinymce2.isGecko)
		document.body.spellcheck = tinymce2Popup.editor.getParam("gecko_spellcheck");

	document.getElementById('htmlSource').value = tinymce2Popup.editor.getContent({source_view : true});

	if (tinymce2Popup.editor.getParam("theme_advanced_source_editor_wrap", true)) {
		turnWrapOn();
		document.getElementById('wraped').checked = true;
	}

	resizeInputs();
}

function setWrap(val) {
	var v, n, s = document.getElementById('htmlSource');

	s.wrap = val;

	if (!tinymce2.isIE) {
		v = s.value;
		n = s.cloneNode(false);
		n.setAttribute("wrap", val);
		s.parentNode.replaceChild(n, s);
		n.value = v;
	}
}

function setWhiteSpaceCss(value) {
	var el = document.getElementById('htmlSource');
	tinymce2.DOM.setStyle(el, 'white-space', value);
}

function turnWrapOff() {
	if (tinymce2.isWebKit) {
		setWhiteSpaceCss('pre');
	} else {
		setWrap('off');
	}
}

function turnWrapOn() {
	if (tinymce2.isWebKit) {
		setWhiteSpaceCss('pre-wrap');
	} else {
		setWrap('soft');
	}
}

function toggleWordWrap(elm) {
	if (elm.checked) {
		turnWrapOn();
	} else {
		turnWrapOff();
	}
}

function resizeInputs() {
	var vp = tinymce2Popup.dom.getViewPort(window), el;

	el = document.getElementById('htmlSource');

	if (el) {
		el.style.width = (vp.w - 20) + 'px';
		el.style.height = (vp.h - 65) + 'px';
	}
}
