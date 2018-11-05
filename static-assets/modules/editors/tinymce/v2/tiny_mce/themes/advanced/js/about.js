tinymce2Popup.requireLangPack();

function init() {
	var ed, tcont;

	tinymce2Popup.resizeToInnerSize();
	ed = tinymce2Popup.editor;

	// Give FF some time
	window.setTimeout(insertHelpIFrame, 10);

	tcont = document.getElementById('plugintablecontainer');
	document.getElementById('plugins_tab').style.display = 'none';

	var html = "";
	html += '<table id="plugintable">';
	html += '<thead>';
	html += '<tr>';
	html += '<td>' + ed.getLang('advanced_dlg.about_plugin') + '</td>';
	html += '<td>' + ed.getLang('advanced_dlg.about_author') + '</td>';
	html += '<td>' + ed.getLang('advanced_dlg.about_version') + '</td>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';

	tinymce2.each(ed.plugins, function(p, n) {
		var info;

		if (!p.getInfo)
			return;

		html += '<tr>';

		info = p.getInfo();

		if (info.infourl != null && info.infourl != '')
			html += '<td width="50%" title="' + n + '"><a href="' + info.infourl + '" target="_blank">' + info.longname + '</a></td>';
		else
			html += '<td width="50%" title="' + n + '">' + info.longname + '</td>';

		if (info.authorurl != null && info.authorurl != '')
			html += '<td width="35%"><a href="' + info.authorurl + '" target="_blank">' + info.author + '</a></td>';
		else
			html += '<td width="35%">' + info.author + '</td>';

		html += '<td width="15%">' + info.version + '</td>';
		html += '</tr>';

		document.getElementById('plugins_tab').style.display = '';

	});

	html += '</tbody>';
	html += '</table>';

	tcont.innerHTML = html;

	tinymce2Popup.dom.get('version').innerHTML = tinymce2.majorVersion + "." + tinymce2.minorVersion;
	tinymce2Popup.dom.get('date').innerHTML = tinymce2.releaseDate;
}

function insertHelpIFrame() {
	var html;

	if (tinymce2Popup.getParam('docs_url')) {
		html = '<iframe width="100%" height="300" src="' + tinymce2Popup.editor.baseURI.toAbsolute(tinymce2Popup.getParam('docs_url')) + '"></iframe>';
		document.getElementById('iframecontainer').innerHTML = html;
		document.getElementById('help_tab').style.display = 'block';
		document.getElementById('help_tab').setAttribute("aria-hidden", "false");
	}
}

tinymce2Popup.onInit.add(init);
