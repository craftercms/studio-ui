/**
 * ins.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

function init() {
	SXE.initElementDialog('ins');
	if (SXE.currentAction == "update") {
		setFormValue('datetime', tinymce2Popup.editor.dom.getAttrib(SXE.updateElement, 'datetime'));
		setFormValue('cite', tinymce2Popup.editor.dom.getAttrib(SXE.updateElement, 'cite'));
		SXE.showRemoveButton();
	}
}

function setElementAttribs(elm) {
	setAllCommonAttribs(elm);
	setAttrib(elm, 'datetime');
	setAttrib(elm, 'cite');
	elm.removeAttribute('data-mce-new');
}

function insertIns() {
	var elm = tinymce2Popup.editor.dom.getParent(SXE.focusElement, 'INS');

	if (elm == null) {
		var s = SXE.inst.selection.getContent();
		if(s.length > 0) {
			insertInlineElement('ins');
			var elementArray = SXE.inst.dom.select('ins[data-mce-new]');
			for (var i=0; i<elementArray.length; i++) {
				var elm = elementArray[i];
				setElementAttribs(elm);
			}
		}
	} else {
		setElementAttribs(elm);
	}
	tinymce2Popup.editor.nodeChanged();
	tinymce2Popup.execCommand('mceEndUndoLevel');
	tinymce2Popup.close();
}

function removeIns() {
	SXE.removeElement('ins');
	tinymce2Popup.close();
}

tinymce2Popup.onInit.add(init);
