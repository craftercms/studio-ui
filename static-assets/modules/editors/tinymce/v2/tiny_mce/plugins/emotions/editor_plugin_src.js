/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce2.moxiecode.com/license
 * Contributing: http://tinymce2.moxiecode.com/contributing
 */

(function(tinymce2) {
	tinymce2.create('tinymce2.plugins.EmotionsPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceEmotion', function() {
				ed.windowManager.open({
					file : url + '/emotions.htm',
					width : 250 + parseInt(ed.getLang('emotions.delta_width', 0)),
					height : 160 + parseInt(ed.getLang('emotions.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('emotions', {title : 'emotions.emotions_desc', cmd : 'mceEmotion'});
		},

		getInfo : function() {
			return {
				longname : 'Emotions',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce2.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/tinymce2:Plugins/emotions',
				version : tinymce2.majorVersion + "." + tinymce2.minorVersion
			};
		}
	});

	// Register plugin
	tinymce2.PluginManager.add('emotions', tinymce2.plugins.EmotionsPlugin);
})(tinymce2);