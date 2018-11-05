tinymce2Popup.requireLangPack();

var EmotionsDialog = {
	addKeyboardNavigation: function(){
		var tableElm, cells, settings;
			
		cells = tinymce2Popup.dom.select("a.emoticon_link", "emoticon_table");
			
		settings ={
			root: "emoticon_table",
			items: cells
		};
		cells[0].tabindex=0;
		tinymce2Popup.dom.addClass(cells[0], "mceFocus");
		if (tinymce2.isGecko) {
			cells[0].focus();		
		} else {
			setTimeout(function(){
				cells[0].focus();
			}, 100);
		}
		tinymce2Popup.editor.windowManager.createInstance('tinymce2.ui.KeyboardNavigation', settings, tinymce2Popup.dom);
	}, 
	init : function(ed) {
		tinymce2Popup.resizeToInnerSize();
		this.addKeyboardNavigation();
	},

	insert : function(file, title) {
		var ed = tinymce2Popup.editor, dom = ed.dom;

		tinymce2Popup.execCommand('mceInsertContent', false, dom.createHTML('img', {
			src : tinymce2Popup.getWindowArg('plugin_url') + '/img/' + file,
			alt : ed.getLang(title),
			title : ed.getLang(title),
			border : 0
		}));

		tinymce2Popup.close();
	}
};

tinymce2Popup.onInit.add(EmotionsDialog.init, EmotionsDialog);
