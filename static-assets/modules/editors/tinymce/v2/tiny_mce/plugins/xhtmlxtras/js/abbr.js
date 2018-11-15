/**
 * abbr.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

function init() {
	SXE.initElementDialog('abbr');
	if (SXE.currentAction == "update") {
		SXE.showRemoveButton();
	}
}

function insertAbbr() {
	SXE.insertElement('abbr');
	tinymce2Popup.close();
}

function removeAbbr() {
	SXE.removeElement('abbr');
	tinymce2Popup.close();
}

tinymce2Popup.onInit.add(init);
