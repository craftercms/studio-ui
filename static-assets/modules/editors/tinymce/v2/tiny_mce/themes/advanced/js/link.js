tinymce2Popup.requireLangPack();

var LinkDialog = {
	preInit : function() {
		var url;

		if (url = tinymce2Popup.getParam("external_link_list_url"))
			document.write('<script language="javascript" type="text/javascript" src="' + tinymce2Popup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
	},

	init : function() {
		var f = document.forms[0], ed = tinymce2Popup.editor;

		// Setup browse button
		document.getElementById('hrefbrowsercontainer').innerHTML = getBrowserHTML('hrefbrowser', 'href', 'file', 'theme_advanced_link');
		if (isVisible('hrefbrowser'))
			document.getElementById('href').style.width = '180px';

		this.fillClassList('class_list');
		this.fillFileList('link_list', 'tinymce2LinkList');
		this.fillTargetList('target_list');

		if (e = ed.dom.getParent(ed.selection.getNode(), 'A')) {
			f.href.value = ed.dom.getAttrib(e, 'href');
			f.linktitle.value = ed.dom.getAttrib(e, 'title');
			f.insert.value = ed.getLang('update');
			selectByValue(f, 'link_list', f.href.value);
			selectByValue(f, 'target_list', ed.dom.getAttrib(e, 'target'));
			selectByValue(f, 'class_list', ed.dom.getAttrib(e, 'class'));
		}
	},

	update : function() {
		var f = document.forms[0], ed = tinymce2Popup.editor, e, b, href = f.href.value.replace(/ /g, '%20');

		tinymce2Popup.restoreSelection();
		e = ed.dom.getParent(ed.selection.getNode(), 'A');

		// Remove element if there is no href
		if (!f.href.value) {
			if (e) {
				b = ed.selection.getBookmark();
				ed.dom.remove(e, 1);
				ed.selection.moveToBookmark(b);
				tinymce2Popup.execCommand("mceEndUndoLevel");
				tinymce2Popup.close();
				return;
			}
		}

		// Create new anchor elements
		if (e == null) {
			ed.getDoc().execCommand("unlink", false, null);
			tinymce2Popup.execCommand("mceInsertLink", false, "#mce_temp_url#", {skip_undo : 1});

			tinymce2.each(ed.dom.select("a"), function(n) {
				if (ed.dom.getAttrib(n, 'href') == '#mce_temp_url#') {
					e = n;

					ed.dom.setAttribs(e, {
						href : href,
						title : f.linktitle.value,
						target : f.target_list ? getSelectValue(f, "target_list") : null,
						'class' : f.class_list ? getSelectValue(f, "class_list") : null
					});
				}
			});
		} else {
			ed.dom.setAttribs(e, {
				href : href,
				title : f.linktitle.value,
				target : f.target_list ? getSelectValue(f, "target_list") : null,
				'class' : f.class_list ? getSelectValue(f, "class_list") : null
			});
		}

		// Don't move caret if selection was image
		if (e.childNodes.length != 1 || e.firstChild.nodeName != 'IMG') {
			ed.focus();
			ed.selection.select(e);
			ed.selection.collapse(0);
			tinymce2Popup.storeSelection();
		}

		tinymce2Popup.execCommand("mceEndUndoLevel");
		tinymce2Popup.close();
	},

	checkPrefix : function(n) {
		if (n.value && Validator.isEmail(n) && !/^\s*mailto:/i.test(n.value) && confirm(tinymce2Popup.getLang('advanced_dlg.link_is_email')))
			n.value = 'mailto:' + n.value;

		if (/^\s*www\./i.test(n.value) && confirm(tinymce2Popup.getLang('advanced_dlg.link_is_external')))
			n.value = 'http://' + n.value;
	},

	fillFileList : function(id, l) {
		var dom = tinymce2Popup.dom, lst = dom.get(id), v, cl;

		l = window[l];

		if (l && l.length > 0) {
			lst.options[lst.options.length] = new Option('', '');

			tinymce2.each(l, function(o) {
				lst.options[lst.options.length] = new Option(o[0], o[1]);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillClassList : function(id) {
		var dom = tinymce2Popup.dom, lst = dom.get(id), cc, cl = [];

		if(cc = tinymce2Popup.editor.contextControl){
			cl = cc.rteLinkStyles || [];
		}

		if (cl.length > 0) {
			lst.options[lst.options.length] = new Option(tinymce2Popup.getLang('not_set'), '');

			tinymce2.each(cl, function(o) {
				lst.options[lst.options.length] = new Option(o.name, o.value);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillTargetList : function(id) {
		var dom = tinymce2Popup.dom, lst = dom.get(id), tl = [], cc;

		if(cc = tinymce2Popup.editor.contextControl){
			tl = cc.rteLinkTargets || [];
		}
		
		if(tl.length > 0){
			tinymce2.each(tl, function(o) {
				lst.options[lst.options.length] = new Option(o.name, o.value);
			});
		}else{
			//lst.options[lst.options.length] = new Option(tinymce2Popup.getLang('not_set'), '');
			lst.options[lst.options.length] = new Option(tinymce2Popup.getLang('advanced_dlg.link_target_same'), '_self');
			lst.options[lst.options.length] = new Option(tinymce2Popup.getLang('advanced_dlg.link_target_blank'), '_blank');
		}
		
	}
};

LinkDialog.preInit();
tinymce2Popup.onInit.add(LinkDialog.init, LinkDialog);
