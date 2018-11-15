/**
 * cite.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

function init() {
	SXE.initElementDialog('cite');
	if (SXE.currentAction == "update") {
		SXE.showRemoveButton();
	}
}

function insertCite() {
	SXE.insertElement('cite');
	tinymce2Popup.close();
}

function removeCite() {
	SXE.removeElement('cite');
	tinymce2Popup.close();
}

tinymce2Popup.onInit.add(init);
