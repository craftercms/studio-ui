/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

(function() {
	tinymce2.create('tinymce2.plugins.Preview', {
		init : function(ed, url) {
			var t = this, css = tinymce2.explode(ed.settings.content_css);

			t.editor = ed;

			// Force absolute CSS urls	
			tinymce2.each(css, function(u, k) {
				css[k] = ed.documentBaseURI.toAbsolute(u);
			});

			ed.addCommand('mcePreview', function() {
				ed.windowManager.open({
					file : ed.getParam("plugin_preview_pageurl", url + "/preview.html"),
					width : parseInt(ed.getParam("plugin_preview_width", "550")),
					height : parseInt(ed.getParam("plugin_preview_height", "600")),
					resizable : "yes",
					scrollbars : "yes",
					popup_css : css ? css.join(',') : ed.baseURI.toAbsolute("themes/" + ed.settings.theme + "/skins/" + ed.settings.skin + "/content.css"),
					inline : ed.getParam("plugin_preview_inline", 1)
				}, {
					base : ed.documentBaseURI.getURI()
				});
			});

			ed.addButton('preview', {title : 'preview.preview_desc', cmd : 'mcePreview'});
		},

		getInfo : function() {
			return {
				longname : 'Preview',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce2.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/tinymce2:Plugins/preview',
				version : tinymce2.majorVersion + "." + tinymce2.minorVersion
			};
		}
	});

	// Register plugin
	tinymce2.PluginManager.add('preview', tinymce2.plugins.Preview);
})();