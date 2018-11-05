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
	tinymce2.create('tinymce2.plugins.StylePlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceStyleProps', function() {

				var applyStyleToBlocks = false;
				var blocks = ed.selection.getSelectedBlocks();
				var styles = [];

				if (blocks.length === 1) {
					styles.push(ed.selection.getNode().style.cssText);
				}
				else {
					tinymce2.each(blocks, function(block) {
						styles.push(ed.dom.getAttrib(block, 'style'));
					});
					applyStyleToBlocks = true;
				}

				ed.windowManager.open({
					file : url + '/props.htm',
					width : 480 + parseInt(ed.getLang('style.delta_width', 0)),
					height : 340 + parseInt(ed.getLang('style.delta_height', 0)),
					inline : 1
				}, {
					applyStyleToBlocks : applyStyleToBlocks,
					plugin_url : url,
					styles : styles
				});
			});

			ed.addCommand('mceSetElementStyle', function(ui, v) {
				if (e = ed.selection.getNode()) {
					ed.dom.setAttrib(e, 'style', v);
					ed.execCommand('mceRepaint');
				}
			});

			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setDisabled('styleprops', n.nodeName === 'BODY');
			});

			// Register buttons
			ed.addButton('styleprops', {title : 'style.desc', cmd : 'mceStyleProps'});
		},

		getInfo : function() {
			return {
				longname : 'Style',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce2.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/tinymce2:Plugins/style',
				version : tinymce2.majorVersion + "." + tinymce2.minorVersion
			};
		}
	});

	// Register plugin
	tinymce2.PluginManager.add('style', tinymce2.plugins.StylePlugin);
})();
