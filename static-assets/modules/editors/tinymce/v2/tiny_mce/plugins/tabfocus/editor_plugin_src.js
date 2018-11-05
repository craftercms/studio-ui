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
	var DOM = tinymce2.DOM, Event = tinymce2.dom.Event, each = tinymce2.each, explode = tinymce2.explode;

	tinymce2.create('tinymce2.plugins.TabFocusPlugin', {
		init : function(ed, url) {
			function tabCancel(ed, e) {
				if (e.keyCode === 9)
					return Event.cancel(e);
			}

			function tabHandler(ed, e) {
				var x, i, f, el, v;

				function find(d) {
					el = DOM.select(':input:enabled,*[tabindex]:not(iframe)');

					function canSelectRecursive(e) {
						return e.nodeName==="BODY" || (e.type != 'hidden' &&
							!(e.style.display == "none") &&
							!(e.style.visibility == "hidden") && canSelectRecursive(e.parentNode));
					}
					function canSelectInOldIe(el) {
						return el.attributes["tabIndex"].specified || el.nodeName == "INPUT" || el.nodeName == "TEXTAREA";
					}
					function isOldIe() {
						return tinymce2.isIE6 || tinymce2.isIE7;
					}
					function canSelect(el) {
						return ((!isOldIe() || canSelectInOldIe(el))) && el.getAttribute("tabindex") != '-1' && canSelectRecursive(el);
					}

					each(el, function(e, i) {
						if (e.id == ed.id) {
							x = i;
							return false;
						}
					});
					if (d > 0) {
						for (i = x + 1; i < el.length; i++) {
							if (canSelect(el[i]))
								return el[i];
						}
					} else {
						for (i = x - 1; i >= 0; i--) {
							if (canSelect(el[i]))
								return el[i];
						}
					}

					return null;
				}

				if (e.keyCode === 9) {
					v = explode(ed.getParam('tab_focus', ed.getParam('tabfocus_elements', ':prev,:next')));

					if (v.length == 1) {
						v[1] = v[0];
						v[0] = ':prev';
					}

					// Find element to focus
					if (e.shiftKey) {
						if (v[0] == ':prev')
							el = find(-1);
						else
							el = DOM.get(v[0]);
					} else {
						if (v[1] == ':next')
							el = find(1);
						else
							el = DOM.get(v[1]);
					}

					if (el) {
						if (el.id && (ed = tinymce2.get(el.id || el.name)))
							ed.focus();
						else
							window.setTimeout(function() {
								if (!tinymce2.isWebKit)
									window.focus();
								el.focus();
							}, 10);

						return Event.cancel(e);
					}
				}
			}

			ed.onKeyUp.add(tabCancel);

			if (tinymce2.isGecko) {
				ed.onKeyPress.add(tabHandler);
				ed.onKeyDown.add(tabCancel);
			} else
				ed.onKeyDown.add(tabHandler);

		},

		getInfo : function() {
			return {
				longname : 'Tabfocus',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce2.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/tinymce2:Plugins/tabfocus',
				version : tinymce2.majorVersion + "." + tinymce2.minorVersion
			};
		}
	});

	// Register plugin
	tinymce2.PluginManager.add('tabfocus', tinymce2.plugins.TabFocusPlugin);
})();
