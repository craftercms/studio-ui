/**
 * acronym.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

function init() {
	SXE.initElementDialog('acronym');
	if (SXE.currentAction == "update") {
		SXE.showRemoveButton();
	}
}

function insertAcronym() {
	SXE.insertElement('acronym');
	tinymce2Popup.close();
}

function removeAcronym() {
	SXE.removeElement('acronym');
	tinymce2Popup.close();
}

tinymce2Popup.onInit.add(init);
